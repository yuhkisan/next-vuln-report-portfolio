"use client";

import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import type { Project } from "../types/viewModel";

type Props = {
  project: Project;
};

export const ProjectMenu = ({ project }: Props) => {
  const { showNotification } = useApp();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // Link遷移を防ぐ
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setNewName(project.name);
    setIsRenameDialogOpen(true);
    handleClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Server Action
    showNotification(`「${project.name}」を削除しました（モック）`);
    handleClose();
  };

  const handleRenameSubmit = () => {
    if (newName.trim()) {
      // TODO: Server Action (optimistic update or revalidate)
      showNotification(`名前を「${newName}」に変更しました（モック）`);
      setIsRenameDialogOpen(false);
    }
  };

  // ダイアログクリック時の伝播防止
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuClick}
        sx={{ color: "text.secondary" }}
      >
        <MoreVertical size={20} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <Edit2 size={16} />
          </ListItemIcon>
          <ListItemText primary="名前を変更" />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Trash2 size={16} color="#d32f2f" />
          </ListItemIcon>
          <ListItemText primary="削除" />
        </MenuItem>
      </Menu>

      {/* onClick, onMouseDownで伝播を止める */}
      <div onClick={handleDialogClick} onMouseDown={handleDialogClick}>
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
      </div>
    </>
  );
};
