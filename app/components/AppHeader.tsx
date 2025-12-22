import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { ShieldAlert, UploadCloud } from "lucide-react";
import { getTeams } from "../lib/data";

export const AppHeader = async () => {
  const teams = await getTeams();
  const currentTeam = teams.length > 0 ? teams[0] : { name: "Unknown" };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
    >
      <Toolbar>
        {/* チーム表示 (現在固定) */}
        <Button
          startIcon={
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "white",
                p: 0.5,
                borderRadius: 1,
                display: "flex",
              }}
            >
              <ShieldAlert size={18} />
            </Box>
          }
          sx={{
            mr: 2,
            textTransform: "none",
            color: "text.primary",
            fontWeight: "bold",
            fontSize: "1rem",
            maxWidth: 300,
          }}
        >
          <Box sx={{ textAlign: "left", overflow: "hidden" }}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              lineHeight={1}
            >
              Team
            </Typography>
            <Typography noWrap>{currentTeam.name}</Typography>
          </Box>
        </Button>

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
