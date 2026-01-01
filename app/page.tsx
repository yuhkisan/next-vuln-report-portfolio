"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Chip,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { Building } from "lucide-react";
import { useApp } from "./contexts/AppContext";
import { UploadArea } from "./UploadArea";
import type { ApiErrorResponse, ScanResponse } from "./types/api";

export default function UploadPage() {
  const router = useRouter();
  const { currentTeam, currentTeamId, showNotification } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const maxFileSize = 5 * 1024 * 1024;

  const validateFile = async (file: File): Promise<string | null> => {
    if (file.size === 0) {
      return "空のファイルです。依存情報を含む JSON をアップロードしてください。";
    }
    if (file.size > maxFileSize) {
      return "ファイルサイズが5MBを超えています。5MB以下にしてください。";
    }
    if (!file.name.toLowerCase().endsWith(".json")) {
      return "JSON ファイルのみ対応しています。";
    }
    try {
      JSON.parse(await file.text());
    } catch {
      return "JSONとして解析できません。形式を確認してください。";
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    setUploadError(null);
    const validationError = await validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      showNotification(validationError, "error");
      return;
    }

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

      if (!response.ok || "error" in result) {
        const message =
          "error" in result ? result.error : "アップロードに失敗しました";
        setUploadError(message);
        showNotification(message, "error");
        setIsUploading(false);
        return;
      }

      setUploadError(null);
      showNotification(
        `解析完了: ${result.vulnerabilityCount}件の脆弱性が見つかりました`,
        "success",
      );
      router.push(`/projects/${result.projectId}`);
    } catch {
      const message = "ネットワークエラーが発生しました";
      setUploadError(message);
      showNotification(message, "error");
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 8 }}>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
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
