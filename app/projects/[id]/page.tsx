"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  FileCode,
  Search,
  ChevronRight,
  Home,
  Sparkles,
  Bot,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { SeverityChip } from "../../components/SeverityChip";
import { callGeminiAPI } from "../../lib/gemini";
import type { Vulnerability, Severity } from "../../types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, currentTeam } = useApp();

  // プロジェクトを取得
  const project = projects.find((p) => p.id === projectId);

  // フィルタ・ソート状態
  const [vulnSearchQuery, setVulnSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [sortOrder, setSortOrder] = useState<"severity" | "package">(
    "severity"
  );

  // AI ダイアログ状態
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiContext, setAiContext] = useState("");

  // フィルタリング済み脆弱性
  const filteredVulnerabilities = useMemo(() => {
    if (!project) return [];
    let vulns = [...project.vulnerabilities];
    if (severityFilter !== "All")
      vulns = vulns.filter((v) => v.severity === severityFilter);
    if (vulnSearchQuery) {
      const q = vulnSearchQuery.toLowerCase();
      vulns = vulns.filter(
        (v) =>
          v.packageName.toLowerCase().includes(q) ||
          v.cve.toLowerCase().includes(q)
      );
    }
    vulns.sort((a, b) =>
      sortOrder === "severity"
        ? ["Critical", "High", "Medium", "Low"].indexOf(a.severity) -
          ["Critical", "High", "Medium", "Low"].indexOf(b.severity)
        : a.packageName.localeCompare(b.packageName)
    );
    return vulns;
  }, [project, severityFilter, vulnSearchQuery, sortOrder]);

  // AI 解説
  const handleAiRemediation = async (vuln: Vulnerability) => {
    setAiContext(`脆弱性分析: ${vuln.packageName} (${vuln.cve})`);
    setAiResult("");
    setAiDialogOpen(true);
    setAiLoading(true);
    try {
      const result = await callGeminiAPI(
        `脆弱性解説: ${vuln.packageName} ${vuln.cve}`
      );
      setAiResult(result);
    } catch {
      setAiResult("Error");
    } finally {
      setAiLoading(false);
    }
  };

  // プロジェクト全体レポート
  const handleAiProjectReport = async () => {
    if (!project) return;
    setAiContext(`プロジェクト分析レポート: ${project.name}`);
    setAiResult("");
    setAiDialogOpen(true);
    setAiLoading(true);
    try {
      const result = await callGeminiAPI(`Project Analysis: ${project.name}`);
      setAiResult(result);
    } catch {
      setAiResult("Error");
    } finally {
      setAiLoading(false);
    }
  };

  // プロジェクトが見つからない場合
  if (!project) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h5">プロジェクトが見つかりません</Typography>
          <Link href="/projects" style={{ textDecoration: "none" }}>
            <Button sx={{ mt: 2 }}>プロジェクト一覧に戻る</Button>
          </Link>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* パンくずリスト */}
        <Breadcrumbs separator={<ChevronRight size={16} />} sx={{ mb: 2 }}>
          <Link
            href="/projects"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Home size={16} style={{ marginRight: 4 }} />
              {currentTeam.name}
            </Box>
          </Link>
          <Typography color="text.primary" fontWeight="bold">
            {project.name}
          </Typography>
        </Breadcrumbs>

        {/* プロジェクトヘッダー */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                }}
              >
                <FileCode size={32} />
              </Box>
            </Grid>
            <Grid item xs>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 0.5,
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {project.name}
                </Typography>
                <Chip
                  size="small"
                  label={currentTeam.name}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                ファイル名: {project.fileName} | アップロード:{" "}
                {project.uploadDate.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Sparkles size={16} />}
                  onClick={handleAiProjectReport}
                  sx={{
                    bgcolor: "secondary.main",
                    color: "white",
                    fontWeight: "bold",
                    boxShadow: 2,
                  }}
                >
                  AIリスク分析
                </Button>
                <Divider orientation="vertical" flexItem />
                <Chip
                  label={`${project.vulnerabilities.length} 件の脆弱性`}
                  color="error"
                  variant="filled"
                  sx={{ fontSize: "1rem", py: 2, fontWeight: "bold" }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* フィルタバー */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="パッケージ名やCVEで検索..."
            value={vulnSearchQuery}
            onChange={(e) => setVulnSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, bgcolor: "white" }}
          />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Filter size={16} className="text-gray-500" />
            <Typography variant="body2" color="text.secondary">
              深刻度:
            </Typography>
            {(["All", "Critical", "High", "Medium", "Low"] as const).map(
              (sev) => (
                <Chip
                  key={sev}
                  label={sev}
                  size="small"
                  variant={severityFilter === sev ? "filled" : "outlined"}
                  color={
                    severityFilter === sev
                      ? sev === "All"
                        ? "default"
                        : sev === "Critical" || sev === "High"
                        ? "error"
                        : sev === "Medium"
                        ? "warning"
                        : "info"
                      : "default"
                  }
                  onClick={() => setSeverityFilter(sev)}
                  sx={{ cursor: "pointer" }}
                />
              )
            )}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            size="small"
            startIcon={<ArrowUpDown size={16} />}
            onClick={() =>
              setSortOrder((prev) =>
                prev === "severity" ? "package" : "severity"
              )
            }
          >
            並び替え: {sortOrder === "severity" ? "深刻度順" : "パッケージ名順"}
          </Button>
        </Box>

        {/* 脆弱性テーブル */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>深刻度</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>パッケージ</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>バージョン</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>CVE ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>詳細</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 140 }}>
                  アクション
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVulnerabilities.length > 0 ? (
                filteredVulnerabilities.map((vuln) => (
                  <TableRow key={vuln.id} hover>
                    <TableCell>
                      <SeverityChip severity={vuln.severity} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {vuln.packageName}
                    </TableCell>
                    <TableCell>{vuln.version}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {vuln.cve}
                    </TableCell>
                    <TableCell
                      sx={{ color: "text.secondary", maxWidth: 300 }}
                      className="truncate"
                    >
                      {vuln.description}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<Bot size={14} />}
                        onClick={() => handleAiRemediation(vuln)}
                        sx={{ textTransform: "none" }}
                      >
                        AI解説
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "text.secondary",
                      }}
                    >
                      <Search size={40} />
                      <Typography sx={{ mt: 1 }}>該当なし</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* AI ダイアログ */}
        <Dialog
          open={aiDialogOpen}
          onClose={() => setAiDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "secondary.50",
              color: "secondary.main",
            }}
          >
            <Sparkles size={20} />
            <Typography variant="h6" component="div" fontWeight="bold">
              Gemini AI Analysis
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ minHeight: 300, p: 4 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {aiContext}
            </Typography>
            {aiLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  gap: 2,
                }}
              >
                <CircularProgress color="secondary" />
                <Typography color="text.secondary" className="animate-pulse">
                  AIが分析中...
                </Typography>
              </Box>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  bgcolor: "grey.50",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                }}
              >
                {aiResult.split("\n").map((l, i) => (
                  <Typography key={i} paragraph sx={{ mb: 1 }}>
                    {l.startsWith("**") ? (
                      <Box component="span" fontWeight="bold">
                        {l.replace(/\*\*/g, "")}
                      </Box>
                    ) : (
                      l
                    )}
                  </Typography>
                ))}
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAiDialogOpen(false)} color="inherit">
              閉じる
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setAiDialogOpen(false)}
            >
              理解しました
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
