import { minVersion } from "semver";

export type ParsedPackage = {
  name: string;
  version: string;
  isDev: boolean;
};

type PackageJsonDeps = Record<string, string>;

type PackageJsonContent = {
  dependencies?: PackageJsonDeps;
  devDependencies?: PackageJsonDeps;
};

function resolveVersion(range: string): string | null {
  try {
    const resolved = minVersion(range);
    return resolved ? resolved.version : null;
  } catch {
    return null;
  }
}

function extractPackages(
  deps: PackageJsonDeps | undefined,
  isDev: boolean,
): ParsedPackage[] {
  if (!deps) return [];

  return Object.entries(deps)
    .map(([name, range]) => {
      const version = resolveVersion(range);
      if (!version) return null;
      return { name, version, isDev };
    })
    .filter((pkg): pkg is ParsedPackage => pkg !== null);
}

export function parsePackageJson(content: string): ParsedPackage[] {
  let parsed: PackageJsonContent;

  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }

  const deps = extractPackages(parsed.dependencies, false);
  const devDeps = extractPackages(parsed.devDependencies, true);

  return [...deps, ...devDeps];
}
