import { prisma } from "@/lib/prisma";
import type { Project } from "@/app/types";
import { Prisma } from "../../generated/prisma/client";
import { convertToUIProject } from "./viewModel";

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

// 単一プロジェクトを ID で取得
export async function getProjectById(id: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      packages: {
        include: {
          vulnerability: true,
        },
      },
    },
  });

  if (!project) return null;
  return convertToUIProject(project);
}

export async function getTeams() {
  return await prisma.team.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}
