import { promises as fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(currentDir, "..", "fixtures");

export const getFixturePath = (name: string) => resolve(fixturesDir, name);

export const createTempJsonFile = async (content: string) => {
  const dir = await fs.mkdtemp(join(tmpdir(), "vuln-e2e-"));
  const filePath = join(dir, "temp.json");
  await fs.writeFile(filePath, content, "utf8");
  return filePath;
};

export const createOversizeJsonFile = async (
  minSizeBytes = 5 * 1024 * 1024 + 1,
) => {
  const payload = "x".repeat(minSizeBytes);
  const content = JSON.stringify({ data: payload });
  return createTempJsonFile(content);
};
