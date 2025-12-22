import { ProjectListView } from "./ProjectListView";

type PageProps = {
  searchParams: Promise<{ teamId?: string }>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { teamId } = await searchParams;
  return <ProjectListView teamId={teamId} />;
}
