export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Vulnerability = {
  id: string;
  packageName: string;
  version: string;
  severity: Severity;
  cve: string;
  description: string;
};

export type Team = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  avatarUrl?: string;
};

export type Project = {
  id: string;
  teamId: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  status: "analyzing" | "completed" | "failed";
  vulnerabilities: Vulnerability[];
  pkgCount: number;
  errorMessage?: string;
};
