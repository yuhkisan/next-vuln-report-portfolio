"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Container, Button } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { TeamSettings } from "./TeamSettings";

export default function SettingsPage() {
  const router = useRouter();
  const {
    currentTeam,
    teams,
    setTeams,
    currentTeamId,
    setCurrentTeamId,
    showNotification,
  } = useApp();

  const handleUpdateTeamName = (name: string) => {
    setTeams(teams.map((t) => (t.id === currentTeamId ? { ...t, name } : t)));
    showNotification("チーム名を更新しました");
  };

  const handleDeleteTeam = () => {
    const newTeams = teams.filter((t) => t.id !== currentTeamId);
    setTeams(newTeams);
    if (newTeams.length > 0) {
      setCurrentTeamId(newTeams[0].id);
      router.push("/projects");
      showNotification("チームを削除しました");
    } else {
      alert("最後のチームは削除できません(デモ制限)");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Link href="/projects" style={{ textDecoration: "none" }}>
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
}
