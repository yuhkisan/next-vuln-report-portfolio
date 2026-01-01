import type {
  Project,
  Severity,
  Vulnerability,
  VulnerabilitySummary,
} from "@/app/types/viewModel";
import type { ProjectApiResponse } from "@/app/types/api";

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

const buildSummary = (vulnerabilities: Vulnerability[]): VulnerabilitySummary => {
  const bySeverity: VulnerabilitySummary["bySeverity"] = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  for (const vuln of vulnerabilities) {
    bySeverity[vuln.severity] += 1;
  }

  return {
    total: vulnerabilities.length,
    bySeverity,
  };
};

export function convertToProjectViewModel(p: ProjectApiResponse): Project {
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
        dependencyType: pkg.dependencyType,
        cve: v.cve || "N/A",
        description: v.description,
      };
    });

  const summary = buildSummary(vulnerabilities);

  return {
    id: p.id,
    teamId: p.teamId,
    name: p.name,
    fileName: p.fileName,
    uploadDate: new Date(p.uploadDate),
    status: p.status,
    vulnerabilities: vulnerabilities,
    summary,
    pkgCount: p.pkgCount,
    errorMessage: p.errorMessage || undefined,
  };
}
