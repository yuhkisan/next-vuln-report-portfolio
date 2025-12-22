import React, { Suspense } from "react";
import Link from "next/link";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { UploadCloud } from "lucide-react";
import { getTeams } from "../lib/data";
import { TeamSelector } from "./TeamSelector";

export const AppHeader = async () => {
  const teams = await getTeams();
  const defaultTeamId = teams.length > 0 ? teams[0].id : "";

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
    >
      <Toolbar>
        {/* チーム選択ドロップダウン */}
        <Suspense fallback={<Box sx={{ width: 200 }} />}>
          <TeamSelector teams={teams} defaultTeamId={defaultTeamId} />
        </Suspense>

        <Box sx={{ flexGrow: 1 }} />

        {/* ナビゲーション */}
        <Link href="/projects" style={{ textDecoration: "none" }}>
          <Button color="inherit" sx={{ mr: 2 }}>
            プロジェクト一覧
          </Button>
        </Link>

        <Link href="/" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            startIcon={<UploadCloud size={18} />}
            disableElevation
          >
            新規アップロード
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
};
