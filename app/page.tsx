"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Chip } from "@mui/material";
import { Building } from "lucide-react";
import { useApp } from "./contexts/AppContext";
import { UploadArea } from "./components/UploadArea";
import { generateMockVulnerabilities } from "./lib/mockData";
import type { Project } from "./types";

export default function UploadPage() {
  const router = useRouter();
  const {
    currentTeam,
    currentTeamId,
    projects,
    setProjects,
    showNotification,
  } = useApp();

  const handleUpload = (file: File) => {
    const newProjectId = `proj-${Date.now()}`;
    const shouldFail = file.name.toLowerCase().includes("error");

    const newProject: Project = {
      id: newProjectId,
      teamId: currentTeamId,
      name: file.name.split(".")[0] || "Unknown",
      fileName: file.name,
      uploadDate: new Date(),
      status: "analyzing",
      vulnerabilities: [],
      pkgCount: 0,
    };

    setProjects((prev) => [newProject, ...prev]);
    router.push("/projects");
    showNotification("アップロード完了。解析を開始しました。");

    // 解析シミュレーション
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === newProjectId) {
            if (shouldFail)
              return {
                ...p,
                status: "failed",
                errorMessage:
                  "解析エラー: 不正なJSONフォーマット、またはSBOMファイルが破損しています。",
              };
            return {
              ...p,
              status: "completed",
              vulnerabilities: generateMockVulnerabilities(
                Math.floor(Math.random() * 15) + 1
              ),
              pkgCount: Math.floor(Math.random() * 200) + 50,
            };
          }
          return p;
        })
      );
      if (shouldFail) showNotification("解析に失敗しました");
    }, 3000);
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
          <UploadArea onUpload={handleUpload} />
        </Box>
      </Container>
    </Box>
  );
}
