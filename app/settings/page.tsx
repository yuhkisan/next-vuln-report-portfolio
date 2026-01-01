import { getTeams } from "../lib/data";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function SettingsPage() {
  const teams = await getTeams();
  const defaultTeamId = teams.length > 0 ? teams[0].id : "";

  return <SettingsPageClient teams={teams} defaultTeamId={defaultTeamId} />;
}
