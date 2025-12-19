"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Team, Project } from "../types";
import { generateMockVulnerabilities } from "../lib/mockData";

// Context の型定義
interface AppContextType {
  // チーム関連
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  currentTeamId: string;
  setCurrentTeamId: React.Dispatch<React.SetStateAction<string>>;
  currentTeam: Team;

  // プロジェクト関連
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  filteredProjects: Project[];

  // 通知
  showNotification: (message: string) => void;
  snackbarOpen: boolean;
  snackbarMessage: string;
  handleCloseNotification: (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider コンポーネント
export function AppProvider({ children }: { children: ReactNode }) {
  // チーム状態
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

  // プロジェクト状態
  const [projects, setProjects] = useState<Project[]>([]);

  // 通知状態
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // 初期データ
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

  // 計算値
  const currentTeam = teams.find((t) => t.id === currentTeamId) || teams[0];
  const filteredProjects = projects.filter((p) => p.teamId === currentTeamId);

  // 通知関数
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

  return (
    <AppContext.Provider
      value={{
        teams,
        setTeams,
        currentTeamId,
        setCurrentTeamId,
        currentTeam,
        projects,
        setProjects,
        filteredProjects,
        showNotification,
        snackbarOpen,
        snackbarMessage,
        handleCloseNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// フック
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
