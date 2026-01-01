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
let teamB: { id: string; name: string } | null = null;

test.beforeAll(async () => {
  const [first, second] = await ensureTeams();
  teamA = first;
  teamB = second;
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("teamId switching via URL and selector", async ({ page }) => {
  if (!teamA || !teamB) throw new Error("Teams are not initialized");

  await page.goto(`/projects?teamId=${teamA.id}`);
  await expect(page.getByText(`${teamA.name} のプロジェクト`)).toBeVisible();

  const selectorButton = page.getByRole("button", {
    name: new RegExp(teamA.name),
  });
  await selectorButton.click();

  await page.getByRole("menuitem", { name: teamB.name }).click();
  await expect(page).toHaveURL(new RegExp(`teamId=${teamB.id}`));
  await expect(page.getByText(`${teamB.name} のプロジェクト`)).toBeVisible();

  await page.goto(`/?teamId=${teamB.id}`);
  await expect(
    page.getByText(`アップロード先: ${teamB.name}`),
  ).toBeVisible();
});
