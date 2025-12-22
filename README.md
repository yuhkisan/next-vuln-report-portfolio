# SBOM Vulnerability Scanner

Next.js で構築された SBOM（Software Bill of Materials）脆弱性スキャナー。アップロードされた SBOM ファイルを解析し、セキュリティ脆弱性を検出・管理する Web アプリケーションです。

> 📋 **[ポートフォリオ A 方針ドキュメント](./PORTFOLIO_A_PLAN.md)** - package-lock.json 解析機能の設計方針

## 🌟 主な機能

- **チーム管理**: 複数のチームを作成・管理し、プロジェクトを組織化
- **SBOM アップロード**: SPDX、CycloneDX 形式の JSON または XML ファイルに対応
- **脆弱性スキャン**: アップロードされた SBOM から脆弱性を自動検出
- **リアルタイム解析**: ファイルアップロード後、リアルタイムで解析状態を表示
- **AI 分析**: Gemini AI を使用した脆弱性の詳細解説とリスク分析
- **フィルタリング**: 深刻度別、パッケージ名別の検索・フィルタリング機能
- **メンバー管理**: チームメンバーの招待と権限管理

## 🛠️ 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **言語**: TypeScript
- **UI ライブラリ**: [Material-UI (MUI) v7](https://mui.com/)
- **ORM**: [Prisma v7](https://www.prisma.io/) (SQLite)
- **アイコン**: [Lucide React](https://lucide.dev/)
- **AI**: Google Gemini API (オプション)

## 📦 プロジェクト構造

```
vuln-app/
├── app/
│   ├── components/          # 再利用可能なコンポーネント
│   │   ├── SeverityChip.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── UploadArea.tsx
│   │   └── TeamSettings.tsx
│   ├── lib/                 # ユーティリティ関数
│   │   ├── gemini.ts       # Gemini API統合
│   │   └── mockData.ts     # モックデータ生成
│   ├── types/              # TypeScript型定義
│   │   └── index.ts
│   ├── page.tsx            # メインページ
│   ├── layout.tsx          # ルートレイアウト
│   └── globals.css         # グローバルスタイル
├── public/                 # 静的ファイル
├── next.config.js          # Next.js設定
├── tsconfig.json           # TypeScript設定
└── package.json            # 依存関係
```

## 🚀 セットアップ

### 前提条件

- Node.js 18.0 以上
- npm または yarn

### インストール

1. リポジトリをクローン

```bash
git clone https://github.com/yuhkisan/vuln-app.git
cd vuln-app
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下を設定します。

```env
DATABASE_URL="file:./dev.db"
```

4. データベースのセットアップ

Prisma を使用して SQLite データベースを作成し、初期データを投入します。

```bash
# データベースの作成（マイグレーション適用 & クライアント生成）
npx prisma migrate dev --name init

# シードデータの投入
npm run db:seed
```

5. 開発サーバーを起動

```bash
npm run dev
```

6. ブラウザで http://localhost:3000 を開く

> **Note**: データベースの中身を確認したい場合は `npm run db:studio` を実行してください。

## 🔧 ビルドとデプロイ

### プロダクションビルド

```bash
npm run build
```

### プロダクションサーバー起動

```bash
npm start
```

## 🎯 使い方

### 1. チームの作成

- ヘッダーのチーム名をクリック
- 「新しいチームを作成」を選択
- チーム名を入力して作成

### 2. SBOM ファイルのアップロード

- 「新規アップロード」ボタンをクリック
- SPDX/CycloneDX 形式のファイルをドラッグ&ドロップまたは選択
- 自動的に解析が開始されます

### 3. 脆弱性の確認

- プロジェクト一覧から解析完了したプロジェクトをクリック
- 検出された脆弱性のリストを確認
- 深刻度でフィルタリングまたは検索

### 4. AI 分析の利用

- 個別の脆弱性の「AI 解説」ボタンをクリック
- プロジェクト全体の「AI リスク分析」ボタンをクリック
- Gemini AI による詳細な分析結果を表示

## 🔑 環境変数

### 必須

`.env` ファイルに以下を設定してください。

```env
DATABASE_URL="file:./dev.db"
```

### オプション (Gemini API)

Gemini API を使用する場合は、`app/lib/gemini.ts`内の`apiKey`を設定してください。

```typescript
const apiKey = "YOUR_GEMINI_API_KEY";
```

> **注**: API キーが設定されていない場合、モックレスポンスが使用されます。

## 📝 開発メモ

### テスト機能

- ファイル名に "error" を含むファイルをアップロードすると、意図的に解析失敗をシミュレートできます

### モックデータ

- デモ用に 50 個のチームと 2 つのサンプルプロジェクトが初期データとして含まれています
- 脆弱性データはランダムに生成されます

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まず issue を開いて変更内容を議論してください。

## 📄 ライセンス

[MIT](LICENSE)

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- Next.js
- Material-UI
- Lucide Icons
- Google Gemini API

---

**Built with ❤️ using Claude Code**
