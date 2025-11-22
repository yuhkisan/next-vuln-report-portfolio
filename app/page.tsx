"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Tabs,
  Tab,
  Snackbar,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  UploadCloud,
  FileCode,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  Search,
  MoreHorizontal,
  Users,
  ChevronDown,
  Plus,
  Building,
  XCircle,
  Settings,
  Trash2,
  Mail,
  Key,
  MoreVertical,
  Edit2,
  Filter,
  ArrowUpDown,
  AlertCircle,
  ChevronRight,
  Home,
  Sparkles,
  Bot,
  FileText,
} from "lucide-react";

// --- Gemini API Helper ---
const apiKey = "";

async function callGeminiAPI(prompt: string): Promise<string> {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Using mock response.");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (prompt.includes("Project Analysis")) {
      return `**プロジェクト分析レポート**\n\nこのプロジェクトは **Critical** レベルの脆弱性を複数含んでおり、即時の対応が必要です。\n\n1. **OpenSSLの更新**: 攻撃者がメモリ内容を読み取る可能性があるため、バージョン3.0.7以上への更新を最優先してください。\n2. **Log4jの確認**: 検出されたバージョンは古い可能性があります。Log4Shellの回避策が適用されているか確認が必要です。\n\n全体的なセキュリティスコアは **D** です。早急なパッチ適用を推奨します。`;
    } else {
      return `**AIによる解説と対策**\n\nこの脆弱性は、攻撃者がリモートで任意のコードを実行できる可能性があります（RCE）。\n\n**推奨される対策:**\n1. パッケージを最新の安定版にアップデートしてください。\n2. アップデートできない場合は、該当機能へのアクセス制限を行ってください。\n\n影響範囲は限定的ですが、放置すると危険です。`;
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated."
    );
  } catch (error) {
    console.error("Gemini API Call Failed:", error);
    throw error;
  }
}

// --- Types ---

type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "analyzing" | "completed" | "failed";
type Role = "Admin" | "Editor" | "Viewer";

interface Vulnerability {
  id: string;
  packageName: string;
  version: string;
  severity: Severity;
  cve: string;
  description: string;
}

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

interface Project {
  id: string;
  teamId: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  status: Status;
  vulnerabilities: Vulnerability[];
  pkgCount: number;
  errorMessage?: string;
}

// --- Mock Data Generators ---

const generateMockVulnerabilities = (count: number): Vulnerability[] => {
  const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
  const packages = [
    "log4j-core",
    "react",
    "lodash",
    "axios",
    "spring-web",
    "jackson-databind",
    "openssl",
  ];
  return Array.from({ length: count }).map((_, i) => {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const pkg = packages[Math.floor(Math.random() * packages.length)];
    return {
      id: `vuln-${i}`,
      packageName: pkg,
      version: `${Math.floor(Math.random() * 5)}.${Math.floor(
        Math.random() * 10
      )}.${Math.floor(Math.random() * 10)}`,
      severity,
      cve: `CVE-202${Math.floor(Math.random() * 4) + 1}-${
        Math.floor(Math.random() * 10000) + 1000
      }`,
      description: `Mock description for vulnerability in ${pkg}. This simulates a security finding.`,
    };
  });
};

const generateMockMembers = (): Member[] => [
  {
    id: "u1",
    name: "Yamada Taro",
    email: "taro@example.com",
    role: "Admin",
    avatarUrl: "",
  },
  {
    id: "u2",
    name: "Suzuki Hanako",
    email: "hanako@example.com",
    role: "Editor",
    avatarUrl: "",
  },
  {
    id: "u3",
    name: "Tanaka Ken",
    email: "ken@example.com",
    role: "Viewer",
    avatarUrl: "",
  },
];

// --- Components ---

const SeverityChip = ({ severity }: { severity: Severity }) => {
  let color: "error" | "warning" | "info" | "success" = "info";
  if (severity === "Critical" || severity === "High") color = "error";
  if (severity === "Medium") color = "warning";
  return (
    <Chip
      label={severity}
      color={color}
      size="small"
      variant={severity === "Critical" ? "filled" : "outlined"}
      sx={{ fontWeight: "bold", minWidth: 80 }}
    />
  );
};

// 2. Project Card
const ProjectCard = ({
  project,
  onClick,
  onMenuClick,
}: {
  project: Project;
  onClick: () => void;
  onMenuClick: (e: React.MouseEvent, project: Project) => void;
}) => {
  const isAnalyzing = project.status === "analyzing";
  const isFailed = project.status === "failed";

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.2s",
        borderColor: "rgba(0, 0, 0, 0.12)",
        bgcolor: "white",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <IconButton
        size="small"
        onClick={(e) => onMenuClick(e, project)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.8)",
          "&:hover": { bgcolor: "white" },
        }}
      >
        <MoreVertical size={18} />
      </IconButton>

      <CardActionArea
        onClick={onClick}
        disabled={isAnalyzing || isFailed}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 100,
            bgcolor: isFailed ? "error.50" : "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isFailed ? "error.main" : "grey.500",
          }}
        >
          {isAnalyzing ? (
            <Loader2 className="animate-spin" size={40} />
          ) : isFailed ? (
            <AlertCircle size={40} />
          ) : (
            <FileCode size={40} />
          )}
        </Box>

        <CardContent sx={{ width: "100%", pt: 2, flexGrow: 1 }}>
          <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            {isAnalyzing ? (
              <Chip
                icon={<Loader2 size={14} className="animate-spin" />}
                label="解析中..."
                color="warning"
                size="small"
                variant="outlined"
              />
            ) : isFailed ? (
              <Chip
                icon={<XCircle size={14} />}
                label="解析失敗"
                color="error"
                size="small"
                variant="filled"
              />
            ) : (
              <Chip
                icon={<CheckCircle size={14} />}
                label="完了"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {project.uploadDate.toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ width: "100%", mb: 2 }}>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {project.fileName}
            </Typography>
          </Box>

          {isAnalyzing ? (
            <Stack spacing={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
            </Stack>
          ) : isFailed ? (
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="body2"
                color="error"
                sx={{
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  wordBreak: "break-all",
                  lineHeight: 1.5,
                  fontSize: "0.875rem",
                }}
              >
                {project.errorMessage || "ファイル形式が不正です。"}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <Chip
                  size="small"
                  label={`${project.vulnerabilities.length} 脆弱性`}
                  icon={<ShieldAlert size={14} />}
                  sx={{
                    bgcolor: "error.50",
                    color: "error.main",
                    border: "none",
                  }}
                />
                <Chip
                  size="small"
                  label={`${project.pkgCount} パッケージ`}
                  sx={{ bgcolor: "grey.100", border: "none" }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 0.5, mt: 2 }}>
                {project.vulnerabilities.some(
                  (v) => v.severity === "Critical"
                ) && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                    }}
                    title="Critical"
                  />
                )}
                {project.vulnerabilities.some((v) => v.severity === "High") && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "orange",
                    }}
                    title="High"
                  />
                )}
                {project.vulnerabilities.some(
                  (v) => v.severity === "Medium"
                ) && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                    }}
                    title="Medium"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// 3. Upload Area
const UploadArea = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onUpload(e.target.files[0]);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) onUpload(e.dataTransfer.files[0]);
  };

  return (
    <Paper
      variant="outlined"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        p: 6,
        borderStyle: "dashed",
        borderWidth: 2,
        borderRadius: 4,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        borderColor: isDragActive ? "primary.main" : "grey.400",
        bgcolor: isDragActive ? "primary.50" : "grey.50",
        transform: isDragActive ? "scale(1.02)" : "scale(1)",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: isDragActive ? "primary.50" : "action.hover",
        },
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".json,.xml,.spdx"
        onChange={handleFileChange}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
          color: isDragActive ? "primary.dark" : "primary.main",
        }}
      >
        <UploadCloud size={48} strokeWidth={1.5} />
      </Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: isDragActive ? "primary.dark" : "text.primary",
        }}
      >
        {isDragActive
          ? "ここにファイルをドロップ"
          : "SBOMファイルをアップロード"}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        SPDX, CycloneDX 形式のJSONまたはXMLファイルをドラッグ＆ドロップ
        <br />
        またはクリックして選択してください
        <br />
        <Typography variant="caption" color="error">
          ( &quot;error&quot; を含むファイル名で失敗をテストできます )
        </Typography>
      </Typography>
      <Button
        variant="contained"
        size="large"
        disableElevation
        sx={{ pointerEvents: "none" }}
      >
        ファイルを選択
      </Button>
    </Paper>
  );
};

// 5. Team Settings
const TeamSettings = ({
  team,
  onUpdateTeamName,
  onDeleteTeam,
}: {
  team: Team;
  onUpdateTeamName: (name: string) => void;
  onDeleteTeam: () => void;
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [teamName, setTeamName] = useState(team.name);
  const [members, setMembers] = useState<Member[]>(generateMockMembers());
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newMember: Member = {
      id: `u-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "Viewer",
    };
    setMembers([...members, newMember]);
    setInviteEmail("");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        チーム設定
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
          <Tab
            label="一般設定"
            icon={<Settings size={16} />}
            iconPosition="start"
          />
          <Tab
            label="メンバー管理"
            icon={<Users size={16} />}
            iconPosition="start"
          />
          <Tab label="API連携" icon={<Key size={16} />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Stack spacing={4}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              チーム名
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                disableElevation
                onClick={() => onUpdateTeamName(teamName)}
                disabled={teamName === team.name}
              >
                保存
              </Button>
            </Box>
          </Paper>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderColor: "error.main", bgcolor: "error.50" }}
          >
            <Typography
              variant="h6"
              color="error"
              gutterBottom
              fontWeight="bold"
            >
              Danger Zone
            </Typography>
            <Typography variant="body2" paragraph>
              このチームを削除すると、すべてのプロジェクトと設定が永久に失われます。この操作は取り消せません。
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={onDeleteTeam}
            >
              チームを削除する
            </Button>
          </Paper>
        </Stack>
      )}

      {tabIndex === 1 && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              メンバーを招待
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                placeholder="colleague@example.com"
                size="small"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={16} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={handleInvite}
              >
                招待
              </Button>
            </Box>
          </Paper>
          <Paper variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell>名前 / メール</TableCell>
                  <TableCell>ロール</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {m.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {m.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.role}
                        size="small"
                        variant="outlined"
                        color={m.role === "Admin" ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setMembers(members.filter((x) => x.id !== m.id))
                        }
                      >
                        <XCircle size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {tabIndex === 2 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Key className="text-gray-500" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                API連携
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CI/CDパイプラインからの自動アップロード用キー
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            value="sk_live_51Mx...MockKey...XYZ"
            disabled
            InputProps={{ endAdornment: <Button size="small">コピー</Button> }}
            sx={{ bgcolor: "grey.50" }}
          />
        </Paper>
      )}
    </Box>
  );
};

// 4. Main Application
export default function App() {
  const [teams, setTeams] = useState<Team[]>([
    { id: "team-1", name: "My Workspace" },
    { id: "team-2", name: "DevOps Team" },
    { id: "team-3", name: "Mobile App Squad" },
    { id: "team-4", name: "Platform Engineering" },
    { id: "team-5", name: "Data Science Unit" },
    ...Array.from({ length: 45 }).map((_, i) => ({
      id: `team-mock-${i}`,
      name: `Project Team ${i + 6}`,
    })),
  ]);
  const [currentTeamId, setCurrentTeamId] = useState<string>("team-1");
  const [teamMenuAnchor, setTeamMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<
    "gallery" | "upload" | "detail" | "settings"
  >("upload");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [projectMenuAnchor, setProjectMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [menuProject, setMenuProject] = useState<Project | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiContext, setAiContext] = useState("");

  const [vulnSearchQuery, setVulnSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [sortOrder, setSortOrder] = useState<"severity" | "package">(
    "severity"
  );

  const showNotification = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  const handleCloseNotification = (
    _?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason !== "clickaway") setSnackbarOpen(false);
  };

  useEffect(() => {
    setProjects([
      {
        id: "demo-1",
        teamId: "team-1",
        name: "Frontend-App-v1.0",
        fileName: "sbom-frontend.json",
        uploadDate: new Date(Date.now() - 86400000),
        status: "completed",
        vulnerabilities: generateMockVulnerabilities(5),
        pkgCount: 124,
      },
      {
        id: "demo-2",
        teamId: "team-2",
        name: "Backend-API-v2.3",
        fileName: "sbom-backend.json",
        uploadDate: new Date(Date.now() - 172800000),
        status: "completed",
        vulnerabilities: generateMockVulnerabilities(12),
        pkgCount: 89,
      },
    ]);
  }, []);

  const currentTeam = teams.find((t) => t.id === currentTeamId) || teams[0];
  const filteredProjects = projects.filter((p) => p.teamId === currentTeamId);
  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  const handleSwitchTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
    setTeamMenuAnchor(null);
    setView("gallery");
    showNotification(
      `チームを「${teams.find((t) => t.id === teamId)?.name}」に切り替えました`
    );
  };
  const handleCreateTeamSubmit = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = { id: `team-${Date.now()}`, name: newTeamName };
    setTeams([newTeam, ...teams]);
    setCurrentTeamId(newTeam.id);
    setIsCreateTeamOpen(false);
    showNotification(`新しいチーム「${newTeamName}」を作成しました`);
  };

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

  // Missing functions restored:
  const handleUpdateTeamName = (name: string) => {
    setTeams(teams.map((t) => (t.id === currentTeamId ? { ...t, name } : t)));
    showNotification("チーム名を更新しました");
  };

  const handleDeleteTeam = () => {
    const newTeams = teams.filter((t) => t.id !== currentTeamId);
    setTeams(newTeams);
    if (newTeams.length > 0) {
      setCurrentTeamId(newTeams[0].id);
      setView("gallery");
      showNotification("チームを削除しました");
    } else {
      alert("最後のチームは削除できません(デモ制限)");
    }
  };

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

  const handleAiProjectReport = async () => {
    if (!selectedProject) return;
    setAiContext(`プロジェクト分析レポート: ${selectedProject.name}`);
    setAiResult("");
    setAiDialogOpen(true);
    setAiLoading(true);
    try {
      const result = await callGeminiAPI(
        `Project Analysis: ${selectedProject.name}`
      );
      setAiResult(result);
    } catch {
      setAiResult("Error");
    } finally {
      setAiLoading(false);
    }
  };

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
    setView("gallery");
    showNotification("アップロード完了。解析を開始しました。");

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

  const filteredVulnerabilities = useMemo(() => {
    if (!selectedProject) return [];
    let vulns = [...selectedProject.vulnerabilities];
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
  }, [selectedProject, severityFilter, vulnSearchQuery, sortOrder]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
      >
        <Toolbar>
          <Button
            onClick={(e) => {
              setTeamMenuAnchor(e.currentTarget);
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
                setView("settings");
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
          <Button
            color="inherit"
            onClick={() => setView("gallery")}
            sx={{ fontWeight: view === "gallery" ? "bold" : "normal" }}
          >
            プロジェクト一覧
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadCloud size={18} />}
            onClick={() => setView("upload")}
            disableElevation
            sx={{ ml: 2 }}
          >
            新規アップロード
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {view === "detail" && selectedProject && (
          <Breadcrumbs separator={<ChevronRight size={16} />} sx={{ mb: 2 }}>
            <MuiLink
              underline="hover"
              color="inherit"
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => {
                setSelectedProject(null);
                setView("gallery");
              }}
            >
              <Home size={16} style={{ marginRight: 4 }} />
              {currentTeam.name}
            </MuiLink>
            <Typography color="text.primary" fontWeight="bold">
              {selectedProject.name}
            </Typography>
          </Breadcrumbs>
        )}

        {view === "upload" && (
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
        )}

        {view === "gallery" && (
          <>
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
                  onClick={() => setView("settings")}
                >
                  設定
                </Button>
              </Box>
            </Box>
            {filteredProjects.length > 0 ? (
              <Grid container spacing={3}>
                {filteredProjects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <ProjectCard
                      project={project}
                      onClick={() => {
                        if (project.status === "completed") {
                          setSelectedProject(project);
                          setView("detail");
                          setVulnSearchQuery("");
                          setSeverityFilter("All");
                        }
                      }}
                      onMenuClick={(e, p) => {
                        e.stopPropagation();
                        setMenuProject(p);
                        setProjectMenuAnchor(e.currentTarget);
                      }}
                    />
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
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<UploadCloud size={20} />}
                  onClick={() => setView("upload")}
                  sx={{ px: 4, py: 1.5 }}
                >
                  SBOMをアップロード
                </Button>
              </Paper>
            )}
          </>
        )}

        {view === "detail" && selectedProject && (
          <>
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
                      {selectedProject.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={currentTeam.name}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ファイル名: {selectedProject.fileName} | アップロード:{" "}
                    {selectedProject.uploadDate.toLocaleString()}
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
                      label={`${selectedProject.vulnerabilities.length} 件の脆弱性`}
                      color="error"
                      variant="filled"
                      sx={{ fontSize: "1rem", py: 2, fontWeight: "bold" }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
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
                並び替え:{" "}
                {sortOrder === "severity" ? "深刻度順" : "パッケージ名順"}
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>深刻度</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      パッケージ
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      バージョン
                    </TableCell>
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
          </>
        )}

        {view === "settings" && (
          <>
            <Button
              startIcon={<ArrowLeft size={18} />}
              onClick={() => setView("gallery")}
              sx={{ mb: 2 }}
            >
              プロジェクト一覧へ戻る
            </Button>
            <TeamSettings
              team={currentTeam}
              onUpdateTeamName={handleUpdateTeamName}
              onDeleteTeam={handleDeleteTeam}
            />
          </>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity="info"
            variant="filled"
            sx={{ width: "100%", boxShadow: 3 }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
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
    </Box>
  );
}
