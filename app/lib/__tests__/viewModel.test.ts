import { describe, expect, it } from "vitest";

import { convertToUIProject, type ProjectViewModelSource } from "../viewModel";

describe("convertToUIProject", () => {
  it("flattens vulnerabilities and maps severity", () => {
    const input: ProjectViewModelSource = {
      id: "project-1",
      teamId: "team-1",
      name: "Sample",
      fileName: "package.json",
      uploadDate: new Date("2025-01-01T00:00:00Z"),
      status: "completed",
      pkgCount: 3,
      errorMessage: null,
      packages: [
        {
          name: "left-pad",
          version: "1.3.0",
          vulnerability: {
            id: "vuln-1",
            severity: "HIGH",
            cve: "CVE-2024-0001",
            description: "desc",
          },
        },
        {
          name: "no-vuln",
          version: "2.0.0",
          vulnerability: null,
        },
        {
          name: "legacy",
          version: "0.9.0",
          vulnerability: {
            id: "vuln-2",
            severity: "low",
            cve: null,
            description: "desc2",
          },
        },
      ],
    };

    const result = convertToUIProject(input);

    expect(result.vulnerabilities).toEqual([
      {
        id: "vuln-1",
        packageName: "left-pad",
        version: "1.3.0",
        severity: "High",
        cve: "CVE-2024-0001",
        description: "desc",
      },
      {
        id: "vuln-2",
        packageName: "legacy",
        version: "0.9.0",
        severity: "Low",
        cve: "N/A",
        description: "desc2",
      },
    ]);
  });

  it("maps null errorMessage to undefined", () => {
    const input: ProjectViewModelSource = {
      id: "project-2",
      teamId: "team-2",
      name: "Sample 2",
      fileName: "package-lock.json",
      uploadDate: new Date("2025-01-02T00:00:00Z"),
      status: "failed",
      pkgCount: 0,
      errorMessage: null,
      packages: [],
    };

    const result = convertToUIProject(input);

    expect(result.errorMessage).toBeUndefined();
  });
});
