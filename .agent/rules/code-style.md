---
trigger: always_on
---

# コーディングルール

## TypeScript

### 1. 型定義は `type` を優先

- `interface` は継承や宣言マージが必要な場合のみ使用
- それ以外は `type` で統一する

```typescript
// ❌ 不要な interface
interface UserProps {
  name: string;
}

// ✅ type を使う
type UserProps = {
  name: string;
};
```

### 2. 型推論を最大限活用

- TypeScript が推論できる箇所には型注釈を書かない
- 明示的な型が必要な場合のみ型を書く:
  - 関数の引数
  - 空配列や空オブジェクトの初期化
  - Public API（エクスポートする関数の戻り値など）

```typescript
// ❌ 不要な型注釈
const count: number = 0;
const name: string = "Taro";
const user: { name: string } = { name: "Taro" };

// ✅ 型推論に任せる
const count = 0;
const name = "Taro";
const user = { name: "Taro" };

// ✅ 型が必要なケース
const items: string[] = []; // 空配列
function getUser(id: string): User | undefined {
  // 引数と戻り値
  return users.find((u) => u.id === id);
}
```

### 3. その他

- `any` は原則禁止、どうしても必要な場合は `unknown` を検討
- ユニオン型や条件型は積極的に活用する
