import { prisma } from "@/lib/prisma";
import type { Project, Vulnerability, Severity } from "@/app/types";
import { Prisma } from "../../generated/prisma/client";

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

type ProjectWithPackages = Prisma.ProjectGetPayload<{
  include: {
    packages: {
      include: {
        vulnerability: true;
      };
    };
  };
}>;

export async function getProjects(teamId?: string): Promise<Project[]> {
  const where = teamId ? { teamId } : {};
  const projects = await prisma.project.findMany({
    where,
    include: {
      packages: {
        include: {
          vulnerability: true,
        },
      },
    },
    orderBy: {
      uploadDate: "desc",
    },
  });

  return projects.map((p: ProjectWithPackages) => convertToUIProject(p));
}

function convertToUIProject(p: ProjectWithPackages): Project {
  // Project -> Package -> Vulnerability の構造をフラットな Vulnerability 配列に変換
  const vulnerabilities: Vulnerability[] = p.packages
    .filter((pkg) => pkg.vulnerability) // 脆弱性があるパッケージのみ
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

export async function getTeams() {
  return await prisma.team.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}
