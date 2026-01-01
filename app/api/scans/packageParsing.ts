import { minVersion } from "semver";

type PackageJsonDeps = Record<string, string>;

type PackageJsonContent = {
  dependencies?: PackageJsonDeps;
  devDependencies?: PackageJsonDeps;
};

type PackageLockPackage = {
  name?: string;
  version?: string;
  dev?: boolean;
  dependencies?: PackageJsonDeps;
  devDependencies?: PackageJsonDeps;
};

type PackageLockContent = {
  lockfileVersion?: number;
  packages?: Record<string, PackageLockPackage>;
};

type DependencyType = "prod" | "dev";

export type ParsedPackage = {
  name: string;
  version: string;
  isDirect: boolean;
  dependencyType: DependencyType;
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
    const isDirect = existing.isDirect || pkg.isDirect;
    const dependencyType =
      existing.dependencyType === "prod" || pkg.dependencyType === "prod"
        ? "prod"
        : "dev";
    map.set(key, { ...existing, isDirect, dependencyType });
  }
  return Array.from(map.values());
};

const getDependencyNames = (deps: PackageJsonDeps | undefined) =>
  new Set<string>(Object.keys(deps ?? {}));

const getPackageNameFromPath = (pkgPath: string) => {
  const marker = "node_modules/";
  const index = pkgPath.lastIndexOf(marker);
  if (index === -1) return null;
  const name = pkgPath.slice(index + marker.length);
  return name || null;
};

const parsePackageJsonContent = (parsed: PackageJsonContent): ParsedPackage[] => {
  const result: ParsedPackage[] = [];

  const processDeps = (
    deps: PackageJsonDeps | undefined,
    dependencyType: DependencyType,
  ) => {
    if (!deps) return;
    for (const [name, range] of Object.entries(deps)) {
      try {
        const resolved = minVersion(range);
        if (resolved) {
          result.push({
            name,
            version: resolved.version,
            isDirect: true,
            dependencyType,
          });
        }
      } catch {
        // skip invalid version ranges
      }
    }
  };

  processDeps(parsed.dependencies, "prod");
  processDeps(parsed.devDependencies, "dev");

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

  const root = packages[""];
  const prodNames = getDependencyNames(root?.dependencies);
  const devNames = getDependencyNames(root?.devDependencies);
  const directNames = new Set<string>([...prodNames, ...devNames]);

  const result: ParsedPackage[] = [];
  for (const [pkgPath, pkg] of Object.entries(packages)) {
    if (pkgPath === "") continue;
    if (!pkg.version) continue;
    const name = pkg.name ?? getPackageNameFromPath(pkgPath);
    if (!name) continue;
    const isDirect = directNames.has(name);
    const dependencyType: DependencyType = prodNames.has(name)
      ? "prod"
      : devNames.has(name)
        ? "dev"
        : pkg.dev
          ? "dev"
          : "prod";
    result.push({
      name,
      version: pkg.version,
      isDirect,
      dependencyType,
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
