import { minVersion } from "semver";

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

export type ParsedPackage = {
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

export function parsePackageContent(content: string): ParsedPackage[] {
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
