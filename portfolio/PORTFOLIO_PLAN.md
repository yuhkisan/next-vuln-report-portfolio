# ポートフォリオ方針（React × OpenAPI スキーマ駆動 × TanStack Query）

## ポートフォリオのコンセプト

このポートフォリオは、**React / TypeScript を軸にしたフロントエンドエンジニア**としての設計力・実装力をアピールするためのものです。

バックエンド（FastAPI）はあくまで「OpenAPI スキーマを提供する役割」に留め、フロントエンド側で**スキーマ駆動 + 自動生成**を行う方針を採用しています。

- FastAPI が生成する `openapi.json` を**唯一の情報源（Single Source of Truth）**として扱う
- コード生成ツール（例: `codegen-tanstack-query` 相当）を使い、以下を自動生成する：
  - TypeScript 型
  - TanStack Query 用のデータフェッチフック（`useGetXxxQuery` など）
- Redux は使わず、状態管理はシンプルに構成する：
  - **サーバー状態** = TanStack Query
  - **ローカル状態** = React（`useState` / `useReducer`）

---

## 技術スタック方針

### フロントエンド

- **React / TypeScript**
- **データフェッチ**: TanStack Query（React Query）
- OpenAPI から自動生成された型付きフックを利用し、props よりも「**カスタムフック + 型推論**」を重視した設計

### バックエンド

- **FastAPI**（最小限の実装）
- ポートフォリオでは詳細な実装ではなく、**OpenAPI を供給するためのバックエンド**として扱う方針
- UI から叩くエンドポイントはすべて OpenAPI に載る前提で設計

### コード生成

- `openapi.json` を入力として、codegen ツールで TypeScript 型と TanStack Query フックを自動生成
- 人間は API クライアントを手書きせず、**生成されたフックを呼び出すだけ**にしたい

---

## アピールしたいポイント

- **スキーマ駆動開発**

  - バックエンドの OpenAPI を唯一の情報源として扱い、フロント側の「型」と「データフェッチフック」を自動生成する設計ができること

- **コロケーション × 型推論**

  - データ取得ロジックをコンポーネント近くのフックに寄せ、TypeScript の型推論だけで UI 実装をスムーズに進められる設計を意識すること

- **「型だけ codegen」ではなく「フックまで codegen」する意識**

  - 単に型ファイルだけを生成するのではなく、フェッチロジック／フックごと自動生成することで、`getVuln` のような「型抜け」を構造的に減らせる、という問題意識を持っていること

- **React エンジニアとしての立ち位置**
  - バックエンド実装者ではないが、「OpenAPI の設計」「public/internal の整理」「operationId の整備」など、スキーマ設計と DX 改善をフロント側から提案できるスタンスであること

---

## 実装イメージ

### スクリプト例: `npm run codegen`

```bash
# openapi.json を取得して TanStack Query フックを生成するイメージ
curl http://localhost:8000/openapi.json -o ./src/generated/openapi.json

npx @openapi-codegen/cli generate \
  --input ./src/generated/openapi.json \
  --output ./src/generated/api \
  --client tanstack-query
```

### 生成されたフックを使う React コンポーネント例

```tsx
import { useGetItemQuery } from "@/generated/api/hooks";

export const ItemDetail: React.FC<{ itemId: string }> = ({ itemId }) => {
  // data には自動的に型が付いている（ItemResponse など）
  const { data, isLoading, error } = useGetItemQuery({ itemId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
};
```

ポイント:

- `useGetItemQuery` は `openapi.json` から自動生成されたフック
- `data` の型は OpenAPI スキーマから推論されるため、手書きの型定義が不要
- コンポーネントの近くでフックを呼び出すことで、コロケーションを実現

---

## 今後の拡張アイデア

- OpenAPI から TanStack Query フックを完全自動生成する構成を、より汎用的なテンプレートとして整理していく
- `operationId`・`tags`・`public/internal` の整理を、フロントエンドからもレビュー・提案できる形にしていきたい
- Storybook や MSW などのモックと組み合わせて、スキーマ駆動で UI 開発体験をさらに高める余地がある
- CI/CD パイプラインに codegen を組み込み、スキーマ変更時に自動で型とフックを再生成する仕組みを構築したい
