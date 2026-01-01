# テスト網羅表

USER_MANUAL / BEHAVIOR_SPEC に対するテスト網羅状況を整理します。

---

## 1. USER_MANUAL.md 対応表

| 章 | 内容 | カバー状況 | 対応テスト |
|---|---|---|---|
| 1 | 基本フロー | ✅ | `tests/e2e/upload-success.spec.cjs` |
| 2 | チーム選択 | ✅ | `tests/e2e/team-switch.spec.cjs` |
| 3 | アップロード | ✅ | `tests/e2e/upload-success.spec.cjs` / `tests/e2e/upload-errors.spec.cjs` |
| 4 | プロジェクト一覧 | ✅ | `tests/e2e/project-view.spec.cjs` |
| 4.1 | プロジェクトメニュー（名前変更/削除・モック） | ⏳ | - |
| 5 | 脆弱性詳細 | ✅ | `tests/e2e/project-view.spec.cjs` |
| 5.5 | AI解説 | ✅ | `tests/e2e/project-view.spec.cjs` |
| 6 | 設定 | ✅ | `tests/e2e/settings.spec.cjs` / `app/settings/__tests__/teamDeleteGuard.test.ts` |
| 7 | モック脆弱性DB | ✅（単体） | `app/lib/fixtures/vulnDb.test.ts` |

---

## 2. BEHAVIOR_SPEC.md 対応表

| 章 | 内容 | カバー状況 | 対応テスト |
|---|---|---|---|
| 2 | 入力と制約 | ✅ | `tests/e2e/upload-errors.spec.cjs` |
| 3 | アップロードAPI | ✅ | `app/api/scans/__tests__/route.test.ts` |
| 4 | 依存抽出ルール | ✅ | `app/api/scans/__tests__/packageParsing.test.ts` |
| 5 | 脆弱性マッチング | ✅ | `app/lib/fixtures/vulnDb.test.ts` |
| 6 | Root Dependency | ✅ | `tests/e2e/project-view.spec.cjs`（見出し確認） |
| 7 | 画面挙動 | ✅ | `tests/e2e/upload-success.spec.cjs` / `tests/e2e/project-view.spec.cjs` / `tests/e2e/team-switch.spec.cjs` |
| 7.1 | プロジェクトメニュー（名前変更/削除・モック） | ⏳ | - |
| 8 | 設定画面 | ✅ | `tests/e2e/settings.spec.cjs` / `app/settings/__tests__/teamDeleteGuard.test.ts` |
| 9 | 通知 | ✅ | `tests/e2e/upload-success.spec.cjs` / `tests/e2e/upload-errors.spec.cjs` |

---

## 3. 追加が必要なテスト（ギャップ）

- プロジェクトメニュー（名前変更/削除）の UI 挙動（モック確認）
