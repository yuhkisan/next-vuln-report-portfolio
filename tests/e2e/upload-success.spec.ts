import { test, expect } from "@playwright/test";
import { getFixturePath } from "./utils";

const fixture = getFixturePath("package-lock.v3.json");

const successToast = (page: { getByText: (text: string) => any }) =>
  page.getByText("解析完了: ", { exact: false });

const summarySection = (page: { getByText: (text: string) => any }) =>
  page.getByText("脆弱性サマリー", { exact: false });

const fileInput = (page: { locator: (selector: string) => any }) =>
  page.locator('input[type="file"]');

test("upload package-lock and navigate to result", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("アップロード先:")).toBeVisible();

  await fileInput(page).setInputFiles(fixture);

  await expect(successToast(page)).toBeVisible();
  await expect(page).toHaveURL(/\/projects\//);

  await expect(summarySection(page)).toBeVisible();
  await expect(page.getByText("Root Dependency:")).toBeVisible();
});
