"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Building } from "lucide-react";
import { useApp } from "./contexts/AppContext";
import { UploadArea } from "./UploadArea";
import type { ApiErrorResponse, ScanResponse } from "./types/api";

export default function UploadPage() {
  const router = useRouter();
  const { currentTeam, currentTeamId, showNotification } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teamId", currentTeamId);

      const response = await fetch("/api/scans", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as ScanResponse | ApiErrorResponse;

      if (!response.ok) {
        showNotification(
          "error" in result ? result.error : "アップロードに失敗しました",
        );
        setIsUploading(false);
        return;
      }

      showNotification(
        `解析完了: ${result.vulnerabilityCount}件の脆弱性が見つかりました`,
      );
      router.push(`/projects/${result.projectId}`);
    } catch {
      showNotification("ネットワークエラーが発生しました");
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 8 }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Chip
              icon={<Building size={14} />}
              label={`アップロード先: ${currentTeam.name}`}
              color="primary"
              variant="outlined"
            />
          </Box>
          {isUploading ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress size={48} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                解析中...
              </Typography>
            </Box>
          ) : (
            <UploadArea onUpload={handleUpload} />
          )}
        </Box>
      </Container>
    </Box>
  );
}
