"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Search, Settings, UploadCloud, Edit2, Trash2 } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { ProjectCard } from "./ProjectCard";
import type { Project, Team } from "../types";

type Props = {
  initialProjects?: Project[];
  initialTeams?: Team[];
};

export const ProjectListView = ({ initialProjects, initialTeams }: Props) => {
  const router = useRouter();
  const {
    currentTeam,
    filteredProjects,
    projects,
    setProjects,
    setTeams,
    showNotification,
  } = useApp();

  // DBからの初期データをContextに反映
  React.useEffect(() => {
    if (initialTeams && initialTeams.length > 0) {
      setTeams(initialTeams);
    }
    if (initialProjects) {
      setProjects(initialProjects);
    }
  }, [initialTeams, initialProjects, setTeams, setProjects]);

  // プロジェクトメニュー
  const [projectMenuAnchor, setProjectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [menuProject, setMenuProject] = useState<Project | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleRenameSubmit = () => {
    if (menuProject && newName.trim()) {
      setProjects(
        projects.map((p) =>
          p.id === menuProject.id ? { ...p, name: newName } : p
        )
      );
      showNotification(`プロジェクト名を更新しました`);
      setIsRenameDialogOpen(false);
      setMenuProject(null);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* ヘッダー部分 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {currentTeam.name} のプロジェクト
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredProjects.length} プロジェクト
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button startIcon={<Search size={18} />} color="inherit">
              検索
            </Button>
            <Button
              startIcon={<Settings size={18} />}
              color="inherit"
              onClick={() => router.push("/settings")}
            >
              設定
            </Button>
          </Box>
        </Box>

        {/* プロジェクト一覧 or 空状態 */}
        {filteredProjects.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Link
                  href={
                    project.status === "completed"
                      ? `/projects/${project.id}`
                      : "#"
                  }
                  style={{ textDecoration: "none" }}
                  onClick={(e) => {
                    if (project.status !== "completed") {
                      e.preventDefault();
                    }
                  }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => {}} // Link で遷移するのでここは空
                    onMenuClick={(e, p) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuProject(p);
                      setProjectMenuAnchor(e.currentTarget as HTMLElement);
                    }}
                  />
                </Link>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              py: 10,
              px: 4,
              textAlign: "center",
              borderRadius: 3,
              borderStyle: "dashed",
              borderColor: "grey.300",
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: 1,
                color: "primary.main",
              }}
            >
              <UploadCloud size={40} />
            </Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="text.primary"
            >
              プロジェクトがありません
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, lineHeight: 1.6 }}
            >
              このチーム「{currentTeam.name}
              」にはまだ解析済みのSBOMがありません。
              <br />
              新しいファイルをアップロードして、脆弱性スキャンを開始しましょう。
            </Typography>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<UploadCloud size={20} />}
                sx={{ px: 4, py: 1.5 }}
              >
                SBOMをアップロード
              </Button>
            </Link>
          </Paper>
        )}

        {/* プロジェクトメニュー */}
        <Menu
          anchorEl={projectMenuAnchor}
          open={Boolean(projectMenuAnchor)}
          onClose={() => setProjectMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setNewName(menuProject?.name || "");
              setIsRenameDialogOpen(true);
              setProjectMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Edit2 size={16} />
            </ListItemIcon>
            <ListItemText primary="名前を変更" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (menuProject) {
                setProjects(projects.filter((p) => p.id !== menuProject.id));
                showNotification("削除しました");
                setProjectMenuAnchor(null);
              }
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <Trash2 size={16} color="#d32f2f" />
            </ListItemIcon>
            <ListItemText primary="削除" />
          </MenuItem>
        </Menu>

        {/* 名前変更ダイアログ */}
        <Dialog
          open={isRenameDialogOpen}
          onClose={() => setIsRenameDialogOpen(false)}
        >
          <DialogTitle>プロジェクト名を変更</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="プロジェクト名"
              fullWidth
              variant="outlined"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRenameDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleRenameSubmit} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
