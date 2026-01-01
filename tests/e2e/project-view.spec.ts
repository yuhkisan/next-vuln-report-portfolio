import { test, expect } from "@playwright/test";
import { getFixturePath } from "./utils";

const fixture = getFixturePath("package-lock.v3.json");

const fileInput = (page: { locator: (selector: string) => any }) =>
  page.locator('input[type="file"]');

const vulnRows = (page: { locator: (selector: string, options?: any) => any }) =>
  page.locator("tbody tr", {
    has: page.getByRole("button", { name: "AI解説" }),
  });

test("project list and detail interactions", async ({ page }) => {
  await page.goto("/");
  await fileInput(page).setInputFiles(fixture);

  await expect(page.getByText("解析完了:", { exact: false })).toBeVisible();
  await expect(page).toHaveURL(/\/projects\//);
  const detailUrl = page.url();

  await page.goto("/projects");
  await expect(page.getByText("package-lock.v3")).toBeVisible();

  await page.goto(detailUrl);
  await expect(page.getByText("Root Dependency:")).toBeVisible();

  const rows = vulnRows(page);
  await expect(rows).toHaveCount(5);

  const severityFilter = page.getByText("深刻度:").locator("..");
  const dependencyFilter = page.getByText("依存タイプ:").locator("..");

  await severityFilter.getByRole("button", { name: "Critical" }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("minimist");

  await severityFilter.getByRole("button", { name: "All" }).click();
  await expect(rows).toHaveCount(5);

  await dependencyFilter.getByRole("button", { name: /dev/i }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("axios");

  await dependencyFilter.getByRole("button", { name: "All" }).click();
  await expect(rows).toHaveCount(5);

  const searchInput = page.getByPlaceholder("パッケージ名やCVEで検索...");
  await searchInput.fill("semver");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("semver");
  await searchInput.fill("");
  await expect(rows).toHaveCount(5);

  await expect(page.getByText("脆弱性詳細")).toHaveCount(0);
  await rows.first().getByRole("button", { name: "AI解説" }).click();
  await expect(page.getByText("Gemini AI Analysis")).toBeVisible();
  await expect(page.getByText("脆弱性詳細")).toHaveCount(0);
  await page.getByRole("button", { name: "閉じる" }).click();

  await rows.first().click();
  await expect(page.getByText("脆弱性詳細")).toBeVisible();
  await expect(page.getByText("Dependency Path")).toBeVisible();
});
