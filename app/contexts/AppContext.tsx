"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Team } from "../types/viewModel";

type AppContextType = {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  currentTeamId: string;
  setCurrentTeamId: React.Dispatch<React.SetStateAction<string>>;
  currentTeam: Team;

  showNotification: (message: string) => void;
  snackbarOpen: boolean;
  snackbarMessage: string;
  handleCloseNotification: (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
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
  const [currentTeamId, setCurrentTeamId] = useState("team-1");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const currentTeam = teams.find((t) => t.id === currentTeamId) || teams[0];

  const showNotification = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseNotification = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
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

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
