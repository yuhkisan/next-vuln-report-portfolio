import { ProjectListView } from "./ProjectListView";
import { getProjects, getTeams } from "../lib/data";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const teams = await getTeams();

  return <ProjectListView initialProjects={projects} initialTeams={teams} />;
}
