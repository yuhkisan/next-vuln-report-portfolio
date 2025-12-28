import { satisfies } from "semver";
import type { Severity } from "../../types";

export type VulnerabilityRule = {
  packageName: string;
  vulnerableRange: string;
  severity: Severity;
  cve: string;
  title: string;
  description: string;
  fixedIn?: string;
  url?: string;
};

const VULNERABILITY_RULES: VulnerabilityRule[] = [
  {
    packageName: "lodash",
    vulnerableRange: "<4.17.21",
    severity: "High",
    cve: "CVE-2020-28500",
    title: "Regular Expression Denial of Service (ReDoS)",
    description:
      "lodash versions prior to 4.17.21 are vulnerable to Regular Expression Denial of Service (ReDoS) via the `toNumber`, `trim` and `trimEnd` functions.",
    fixedIn: "4.17.21",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2020-28500",
  },
  {
    packageName: "axios",
    vulnerableRange: "<0.21.1",
    severity: "High",
    cve: "CVE-2020-28168",
    title: "Server-Side Request Forgery (SSRF)",
    description:
      "axios before 0.21.1 allows attackers to perform Server-Side Request Forgery via a crafted URL.",
    fixedIn: "0.21.1",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2020-28168",
  },
  {
    packageName: "express",
    vulnerableRange: "<4.17.3",
    severity: "Medium",
    cve: "CVE-2022-24999",
    title: "Open Redirect vulnerability",
    description:
      "qs before 6.10.3, as used in Express before 4.17.3, allows attackers to cause prototype pollution.",
    fixedIn: "4.17.3",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-24999",
  },
  {
    packageName: "minimist",
    vulnerableRange: "<1.2.6",
    severity: "Critical",
    cve: "CVE-2021-44906",
    title: "Prototype Pollution",
    description:
      "Minimist <=1.2.5 is vulnerable to Prototype Pollution via file index.js, function setKey() (lines 69-95).",
    fixedIn: "1.2.6",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2021-44906",
  },
  {
    packageName: "json5",
    vulnerableRange: "<2.2.2",
    severity: "High",
    cve: "CVE-2022-46175",
    title: "Prototype Pollution",
    description:
      "JSON5 before 2.2.2 allows Prototype Pollution when parsing JSON5 files with specially crafted input.",
    fixedIn: "2.2.2",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-46175",
  },
  {
    packageName: "qs",
    vulnerableRange: "<6.10.3",
    severity: "High",
    cve: "CVE-2022-24999",
    title: "Prototype Pollution",
    description:
      "qs before 6.10.3 allows attackers to cause prototype pollution via the `allowPrototypes` option.",
    fixedIn: "6.10.3",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-24999",
  },
  {
    packageName: "semver",
    vulnerableRange: "<7.5.2",
    severity: "Medium",
    cve: "CVE-2022-25883",
    title: "Regular Expression Denial of Service (ReDoS)",
    description:
      "semver versions prior to 7.5.2 are vulnerable to Regular Expression Denial of Service (ReDoS).",
    fixedIn: "7.5.2",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-25883",
  },
  {
    packageName: "tar",
    vulnerableRange: "<6.1.11",
    severity: "High",
    cve: "CVE-2021-37701",
    title: "Arbitrary File Overwrite",
    description:
      "The npm package tar (aka node-tar) before versions 6.1.11 has an arbitrary file overwrite vulnerability.",
    fixedIn: "6.1.11",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2021-37701",
  },
  {
    packageName: "glob-parent",
    vulnerableRange: "<5.1.2",
    severity: "High",
    cve: "CVE-2020-28469",
    title: "Regular Expression Denial of Service (ReDoS)",
    description:
      "The package glob-parent before 5.1.2 is vulnerable to Regular Expression Denial of Service (ReDoS).",
    fixedIn: "5.1.2",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2020-28469",
  },
  {
    packageName: "async",
    vulnerableRange: "<2.6.4",
    severity: "High",
    cve: "CVE-2021-43138",
    title: "Prototype Pollution",
    description:
      "In async before 2.6.4, a malicious user can obtain privileges via the mapValues() method.",
    fixedIn: "2.6.4",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2021-43138",
  },
  {
    packageName: "node-fetch",
    vulnerableRange: "<2.6.7",
    severity: "High",
    cve: "CVE-2022-0235",
    title: "Exposure of Sensitive Information",
    description:
      "node-fetch before 2.6.7 allows attackers to expose sensitive information via the Request.clone method.",
    fixedIn: "2.6.7",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-0235",
  },
  {
    packageName: "moment",
    vulnerableRange: "<2.29.4",
    severity: "High",
    cve: "CVE-2022-31129",
    title: "Inefficient Regular Expression Complexity",
    description:
      "moment before 2.29.4 is vulnerable to ReDoS when passing user-provided strings without sanity length checks to moment constructor.",
    fixedIn: "2.29.4",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-31129",
  },
];

export function findVulnerabilities(
  packageName: string,
  version: string,
): VulnerabilityRule[] {
  return VULNERABILITY_RULES.filter((rule) => {
    if (rule.packageName !== packageName) return false;
    try {
      return satisfies(version, rule.vulnerableRange);
    } catch {
      return false;
    }
  });
}
