import { notFound } from "next/navigation";
import { getProjectById, getTeams } from "@/app/lib/data";
import { ProjectDetailView } from "./ProjectDetailView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [project, teams] = await Promise.all([getProjectById(id), getTeams()]);

  if (!project) {
    notFound();
  }

  // TODO: チーム選択は URL/Cookie で管理すべき。ここでは先頭チームを仮で使用
  const currentTeam = teams.find((t) => t.id === project.teamId) ??
    teams[0] ?? { id: "", name: "Unknown" };

  return <ProjectDetailView project={project} currentTeam={currentTeam} />;
}
