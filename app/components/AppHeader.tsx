"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Box,
} from "@mui/material";
import {
  UploadCloud,
  ShieldAlert,
  Search,
  Users,
  ChevronDown,
  Plus,
  Settings,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";

export const AppHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    teams,
    setTeams,
    currentTeamId,
    setCurrentTeamId,
    currentTeam,
    showNotification,
  } = useApp();

  const [teamMenuAnchor, setTeamMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  const handleSwitchTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
    setTeamMenuAnchor(null);
    router.push("/projects");
    showNotification(
      `チームを「${teams.find((t) => t.id === teamId)?.name}」に切り替えました`
    );
  };

  const handleCreateTeamSubmit = () => {
    if (!newTeamName.trim()) return;
    const newTeam = { id: `team-${Date.now()}`, name: newTeamName };
    setTeams([newTeam, ...teams]);
    setCurrentTeamId(newTeam.id);
    setIsCreateTeamOpen(false);
    setNewTeamName("");
    showNotification(`新しいチーム「${newTeamName}」を作成しました`);
  };

  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
      >
        <Toolbar>
          {/* チーム選択ボタン */}
          <Button
            onClick={(e) => {
              setTeamMenuAnchor(e.currentTarget as HTMLElement);
              setTeamSearchQuery("");
            }}
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
            endIcon={<ChevronDown size={16} className="text-gray-400" />}
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

          {/* チームメニュー */}
          <Menu
            anchorEl={teamMenuAnchor}
            open={Boolean(teamMenuAnchor)}
            onClose={() => setTeamMenuAnchor(null)}
            PaperProps={{ sx: { width: 320, mt: 1, maxHeight: 500 } }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                position: "sticky",
                top: 0,
                bgcolor: "white",
                zIndex: 1,
              }}
            >
              <TextField
                size="small"
                fullWidth
                placeholder="Search..."
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Divider />
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {filteredTeams.map((t) => (
                <MenuItem
                  key={t.id}
                  selected={t.id === currentTeamId}
                  onClick={() => handleSwitchTeam(t.id)}
                >
                  <ListItemIcon>
                    <Users size={18} />
                  </ListItemIcon>
                  <ListItemText primary={t.name} />
                  {t.id === currentTeamId && (
                    <CheckCircle size={16} className="text-blue-500" />
                  )}
                </MenuItem>
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={() => {
                setTeamMenuAnchor(null);
                setIsCreateTeamOpen(true);
                setNewTeamName("");
              }}
              sx={{ color: "primary.main" }}
            >
              <ListItemIcon>
                <Plus size={18} color="#1976d2" />
              </ListItemIcon>
              <ListItemText primary="新しいチームを作成" />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={() => {
                router.push("/settings");
                setTeamMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Settings size={18} />
              </ListItemIcon>
              <ListItemText primary="チーム設定" />
            </MenuItem>
          </Menu>

          <Box sx={{ flexGrow: 1 }} />

          {/* ナビゲーションボタン */}
          <Button
            color="inherit"
            onClick={() => router.push("/projects")}
            sx={{ fontWeight: pathname === "/projects" ? "bold" : "normal" }}
          >
            プロジェクト一覧
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadCloud size={18} />}
            onClick={() => router.push("/")}
            disableElevation
            sx={{ ml: 2 }}
          >
            新規アップロード
          </Button>
        </Toolbar>
      </AppBar>

      {/* チーム作成ダイアログ */}
      <Dialog
        open={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>新しいチームを作成</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="チーム名"
            fullWidth
            variant="outlined"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="例: Security Team, Frontend Squad"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateTeamOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleCreateTeamSubmit}
            variant="contained"
            disabled={!newTeamName.trim()}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
