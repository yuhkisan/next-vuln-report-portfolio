# テスト網羅表

USER_MANUAL / BEHAVIOR_SPEC に対するテスト網羅状況を整理します。

---

## 1. USER_MANUAL.md 対応表

| 章 | 内容 | カバー状況 | 対応テスト |
|---|---|---|---|
| 1 | 基本フロー | ✅ | `tests/e2e/upload-success.spec.ts` |
| 2 | チーム選択 | ✅ | `tests/e2e/team-switch.spec.ts` |
| 3 | アップロード | ✅ | `tests/e2e/upload-success.spec.ts` / `tests/e2e/upload-errors.spec.ts` |
| 4 | プロジェクト一覧 | ✅ | `tests/e2e/project-view.spec.ts` |
| 5 | 脆弱性詳細 | ✅ | `tests/e2e/project-view.spec.ts` |
| 5.5 | AI解説 | ✅ | `tests/e2e/project-view.spec.ts` |
| 6 | 設定 | ⚠️ | `tests/e2e/settings.spec.ts`（最後のチーム削除ガードは未カバー） |
| 7 | モック脆弱性DB | ✅（単体） | `app/lib/fixtures/vulnDb.test.ts` |

---

## 2. BEHAVIOR_SPEC.md 対応表

| 章 | 内容 | カバー状況 | 対応テスト |
|---|---|---|---|
| 2 | 入力と制約 | ✅ | `tests/e2e/upload-errors.spec.ts` |
| 3 | アップロードAPI | ⚠️ | エラー応答の一部は未カバー（API単体 or E2Eで補完検討） |
| 4 | 依存抽出ルール | ✅ | `app/api/scans/__tests__/packageParsing.test.ts` |
| 5 | 脆弱性マッチング | ✅ | `app/lib/fixtures/vulnDb.test.ts` |
| 6 | Root Dependency | ✅ | `tests/e2e/project-view.spec.ts`（見出し確認） |
| 7 | 画面挙動 | ✅ | `tests/e2e/upload-success.spec.ts` / `tests/e2e/project-view.spec.ts` / `tests/e2e/team-switch.spec.ts` |
| 8 | 設定画面 | ⚠️ | `tests/e2e/settings.spec.ts`（最後のチーム削除ガードは未カバー） |
| 9 | 通知 | ✅ | `tests/e2e/upload-success.spec.ts` / `tests/e2e/upload-errors.spec.ts` |

---

## 3. 追加が必要なテスト（ギャップ）

- 設定画面（最後のチーム削除ガード）のE2E
- アップロードAPIのエラー応答（teamId欠落など）のAPIテスト
