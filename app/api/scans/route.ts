import { NextRequest, NextResponse } from "next/server";
import { minVersion } from "semver";
import { prisma } from "@/lib/prisma";
import { findVulnerabilities } from "@/app/lib/fixtures/vulnDb";

type PackageJsonDeps = Record<string, string>;

type PackageJsonContent = {
  name?: string;
  dependencies?: PackageJsonDeps;
  devDependencies?: PackageJsonDeps;
};

function parsePackageJson(content: string): Array<{
  name: string;
  version: string;
  isDirect: boolean;
}> {
  let parsed: PackageJsonContent;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }

  const result: Array<{ name: string; version: string; isDirect: boolean }> =
    [];

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

  return result;
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
    const packages = parsePackageJson(content);

    if (packages.length === 0) {
      return NextResponse.json(
        { error: "Invalid package.json or no dependencies found" },
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
