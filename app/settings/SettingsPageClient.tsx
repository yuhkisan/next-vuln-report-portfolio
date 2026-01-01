"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Container, Button } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Team } from "../types/viewModel";
import { TeamSettings } from "./TeamSettings";

type SettingsPageClientProps = {
  teams: Team[];
  defaultTeamId: string;
};

export const SettingsPageClient = ({
  teams: initialTeams,
  defaultTeamId,
}: SettingsPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  const currentTeamId = searchParams.get("teamId") ?? defaultTeamId;
  const currentTeam = useMemo(() => {
    return teams.find((t) => t.id === currentTeamId) ??
      teams[0] ?? { id: "", name: "Unknown" };
  }, [teams, currentTeamId]);

  const handleUpdateTeamName = (name: string) => {
    setTeams(teams.map((t) => (t.id === currentTeam.id ? { ...t, name } : t)));
    toast.success("チーム名を更新しました（モック）");
  };

  const handleDeleteTeam = () => {
    if (teams.length <= 1) {
      toast.error("最後のチームは削除できません（デモ制限）");
      return;
    }
    const newTeams = teams.filter((t) => t.id !== currentTeam.id);
    setTeams(newTeams);
    const nextTeamId = newTeams[0]?.id ?? "";
    toast.success("チームを削除しました（モック）");
    router.push(`/projects?teamId=${nextTeamId}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Link
          href={`/projects?teamId=${currentTeam.id}`}
          style={{ textDecoration: "none" }}
        >
          <Button startIcon={<ArrowLeft size={18} />} sx={{ mb: 2 }}>
            プロジェクト一覧へ戻る
          </Button>
        </Link>
        <TeamSettings
          team={currentTeam}
          onUpdateTeamName={handleUpdateTeamName}
          onDeleteTeam={handleDeleteTeam}
        />
      </Container>
    </Box>
  );
};
