import { test, expect } from "@playwright/test";
import { prisma } from "../../lib/prisma";

const ensureTeams = async () => {
  const existing = await prisma.team.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (existing.length >= 2) return existing.slice(0, 2);

  const created = [] as { id: string; name: string }[];
  for (let i = existing.length; i < 2; i += 1) {
    const team = await prisma.team.create({
      data: {
        name: `E2E Team ${Date.now()}-${i}`,
      },
    });
    created.push(team);
  }

  return [...existing, ...created].slice(0, 2);
};

let teamA: { id: string; name: string } | null = null;

test.beforeAll(async () => {
  const [first] = await ensureTeams();
  teamA = first;
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("settings rename and delete (mock)", async ({ page }) => {
  if (!teamA) throw new Error("Team is not initialized");

  await page.goto(`/settings?teamId=${teamA.id}`);

  await expect(page.getByText("チーム設定")).toBeVisible();

  const nameInput = page.getByRole("textbox").first();
  await nameInput.fill("E2E Renamed Team");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(
    page.getByText("チーム名を更新しました（モック）"),
  ).toBeVisible();

  await page.getByRole("button", { name: "チームを削除する" }).click();
  await expect(
    page.getByText("チームを削除しました（モック）"),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/projects\?teamId=/);
});
