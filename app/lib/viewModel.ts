import type { Project, Severity, Vulnerability } from "@/app/types";

type PackageWithVulnerability = {
  name: string;
  version: string;
  vulnerability: {
    id: string;
    severity: string;
    cve: string | null;
    description: string;
  } | null;
};

export type ProjectViewModelSource = {
  id: string;
  teamId: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  status: string;
  pkgCount: number;
  errorMessage?: string | null;
  packages: PackageWithVulnerability[];
};

// 重要度文字列をUIの型に変換
const mapSeverity = (severity: string): Severity => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
    default:
      return "Low";
  }
};

export function convertToUIProject(p: ProjectViewModelSource): Project {
  // Project -> Package -> Vulnerability の構造をフラットな Vulnerability 配列に変換
  const vulnerabilities: Vulnerability[] = p.packages
    .filter((pkg) => pkg.vulnerability)
    .map((pkg) => {
      const v = pkg.vulnerability!;
      return {
        id: v.id,
        packageName: pkg.name,
        version: pkg.version,
        severity: mapSeverity(v.severity),
        cve: v.cve || "N/A",
        description: v.description,
      };
    });

  return {
    id: p.id,
    teamId: p.teamId,
    name: p.name,
    fileName: p.fileName,
    uploadDate: p.uploadDate,
    status: p.status as "analyzing" | "completed" | "failed",
    vulnerabilities: vulnerabilities,
    pkgCount: p.pkgCount,
    errorMessage: p.errorMessage || undefined,
  };
}
