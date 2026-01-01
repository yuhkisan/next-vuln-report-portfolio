import { test, expect } from "@playwright/test";
import {
  createOversizeJsonFile,
  createTempFile,
  getFixturePath,
} from "./utils";

const fileInput = (page: { locator: (selector: string) => any }) =>
  page.locator('input[type="file"]');

const errorAlert = (page: { getByRole: (role: string) => any }) =>
  page.getByRole("alert");

const toastByMessage = (page: { getByText: (text: string) => any }, message: string) =>
  page.getByText(message, { exact: false });

test("shows error for empty file", async ({ page }) => {
  await page.goto("/");
  await fileInput(page).setInputFiles(getFixturePath("empty.json"));

  await expect(errorAlert(page)).toContainText("空のファイルです");
  await expect(toastByMessage(page, "空のファイルです")).toBeVisible();
});

test("shows error for invalid JSON", async ({ page }) => {
  await page.goto("/");
  await fileInput(page).setInputFiles(getFixturePath("invalid.json"));

  await expect(errorAlert(page)).toContainText("JSONとして解析できません");
  await expect(toastByMessage(page, "JSONとして解析できません")).toBeVisible();
});

test("shows error for non-json extension", async ({ page }) => {
  await page.goto("/");
  const filePath = await createTempFile("{}", "txt");
  await fileInput(page).setInputFiles(filePath);
  await expect(errorAlert(page)).toContainText("JSON ファイルのみ対応しています");
  await expect(toastByMessage(page, "JSON ファイルのみ対応しています")).toBeVisible();
});

test("shows error for oversize file", async ({ page }) => {
  await page.goto("/");
  const oversizePath = await createOversizeJsonFile();
  await fileInput(page).setInputFiles(oversizePath);

  await expect(errorAlert(page)).toContainText("5MBを超えています");
  await expect(toastByMessage(page, "5MBを超えています")).toBeVisible();
});
