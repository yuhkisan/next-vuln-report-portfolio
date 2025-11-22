export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Status = "analyzing" | "completed" | "failed";
export type Role = "Admin" | "Editor" | "Viewer";

export interface Vulnerability {
  id: string;
  packageName: string;
  version: string;
  severity: Severity;
  cve: string;
  description: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Project {
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
