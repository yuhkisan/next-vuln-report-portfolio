import { NextRequest, NextResponse } from "next/server";
import { minVersion } from "semver";
import { prisma } from "@/lib/prisma";
import { findVulnerabilities } from "@/app/lib/fixtures/vulnDb";

type PackageJsonDeps = Record<string, string>;

type PackageJsonContent = {
  dependencies?: PackageJsonDeps;
  devDependencies?: PackageJsonDeps;
};

type PackageLockPackage = {
  name?: string;
  version?: string;
  dependencies?: PackageJsonDeps;
  devDependencies?: PackageJsonDeps;
};

type PackageLockContent = {
  lockfileVersion?: number;
  packages?: Record<string, PackageLockPackage>;
};

type ParsedPackage = {
  name: string;
  version: string;
  isDirect: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPackageLockContent = (value: unknown): value is PackageLockContent =>
  isRecord(value) && "lockfileVersion" in value;

const isPackageJsonContent = (value: unknown): value is PackageJsonContent =>
  isRecord(value) && ("dependencies" in value || "devDependencies" in value);

const dedupePackages = (packages: ParsedPackage[]) => {
  const map = new Map<string, ParsedPackage>();
  for (const pkg of packages) {
    const key = `${pkg.name}@${pkg.version}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, pkg);
      continue;
    }
    if (pkg.isDirect && !existing.isDirect) {
      map.set(key, { ...existing, isDirect: true });
    }
  }
  return Array.from(map.values());
};

const getDirectDependencyNames = (root: PackageLockPackage | undefined) =>
  new Set<string>([
    ...Object.keys(root?.dependencies ?? {}),
    ...Object.keys(root?.devDependencies ?? {}),
  ]);

const getPackageNameFromPath = (pkgPath: string) => {
  const marker = "node_modules/";
  const index = pkgPath.lastIndexOf(marker);
  if (index === -1) return null;
  const name = pkgPath.slice(index + marker.length);
  return name || null;
};

const parsePackageJsonContent = (parsed: PackageJsonContent): ParsedPackage[] => {
  const result: ParsedPackage[] = [];

  const processDeps = (deps: PackageJsonDeps | undefined) => {
    if (!deps) return;
    for (const [name, range] of Object.entries(deps)) {
      try {
        const resolved = minVersion(range);
        if (resolved) {
          result.push({ name, version: resolved.version, isDirect: true });
        }
      } catch {
        // skip invalid version ranges
      }
    }
  };

  processDeps(parsed.dependencies);
  processDeps(parsed.devDependencies);

  return dedupePackages(result);
};

const parsePackageLockContent = (
  parsed: PackageLockContent,
): ParsedPackage[] => {
  const lockfileVersion =
    typeof parsed.lockfileVersion === "number" ? parsed.lockfileVersion : 0;
  if (lockfileVersion !== 2 && lockfileVersion !== 3) return [];

  const packages = parsed.packages;
  if (!packages) return [];

  const directNames = getDirectDependencyNames(packages[""]);

  const result: ParsedPackage[] = [];
  for (const [pkgPath, pkg] of Object.entries(packages)) {
    if (pkgPath === "") continue;
    if (!pkg.version) continue;
    const name = pkg.name ?? getPackageNameFromPath(pkgPath);
    if (!name) continue;
    result.push({
      name,
      version: pkg.version,
      isDirect: directNames.has(name),
    });
  }

  return dedupePackages(result);
};

function parsePackageContent(content: string): ParsedPackage[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }

  if (isPackageLockContent(parsed)) {
    return parsePackageLockContent(parsed);
  }

  if (isPackageJsonContent(parsed)) {
    return parsePackageJsonContent(parsed);
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const teamId = formData.get("teamId") as string | null;

    if (!file || !teamId) {
      return NextResponse.json(
        { error: "file and teamId are required" },
        { status: 400 },
      );
    }

    const content = await file.text();
    const packages = parsePackageContent(content);

    if (packages.length === 0) {
      return NextResponse.json(
        { error: "Invalid package file or no dependencies found" },
        { status: 400 },
      );
    }

    const projectName = file.name.replace(/\.(json)$/i, "") || "Untitled";

    const project = await prisma.project.create({
      data: {
        name: projectName,
        fileName: file.name,
        teamId,
        status: "completed",
        pkgCount: packages.length,
        packages: {
          create: packages.map((pkg) => {
            const vulns = findVulnerabilities(pkg.name, pkg.version);
            const vuln = vulns[0];

            return {
              name: pkg.name,
              version: pkg.version,
              isDirect: pkg.isDirect,
              ...(vuln && {
                vulnerability: {
                  create: {
                    severity: vuln.severity.toLowerCase(),
                    cve: vuln.cve,
                    title: vuln.title,
                    description: vuln.description,
                    fixedIn: vuln.fixedIn,
                    url: vuln.url,
                  },
                },
              }),
            };
          }),
        },
      },
      include: {
        packages: {
          include: {
            vulnerability: true,
          },
        },
      },
    });

    const vulnerabilityCount = project.packages.filter(
      (p) => p.vulnerability,
    ).length;

    return NextResponse.json({
      projectId: project.id,
      status: project.status,
      vulnerabilityCount,
    });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
