# グリッドレイアウトエディタ

## 概要

このプロジェクトは、React Grid Layoutを利用したインタラクティブなグリッドレイアウトエディタです。
ドラッグ＆ドロップで自由にレイアウトを編集でき、コンポーネントのネスト構造にも対応しています。

## 主な機能

- グリッドレイアウトの動的な編集
- コンポーネントのドラッグ＆ドロップ配置
- サイズ変更可能なグリッドアイテム
- 最大5階層までのネスト構造
- レイアウト設定のインポート/エクスポート
- ボタンコンポーネントの追加と設定

## 必要要件

- Node.js 18.0.0以上
- pnpm 8.0.0以上

## インストール

```bash
# パッケージのインストール
pnpm install
```

## 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev
```

## ビルド

```bash
# プロダクション用にビルド
pnpm build
```

## 使用方法

### 基本操作

1. **領域の追加**
   - 「領域を追加」ボタンをクリックして新しいグリッド領域を追加
   - ドラッグで位置を移動可能
   - 右下のハンドルでサイズを変更可能

2. **ボタンの追加**
   - 「ボタンを追加」ボタンをクリックしてボタンコンポーネントを追加
   - 右側のパネルでボタンの設定を編集可能

3. **編集モード**
   - 領域を選択して「領域内を編集」ボタンをクリックすると、その領域内のみを編集可能
   - 「領域内の編集終了」で編集モードを終了

4. **削除**
   - 要素を選択して「選択した領域を削除」ボタンをクリック

### インポート/エクスポート

- 「エクスポート」ボタンでレイアウト設定をJSONファイルとして保存
- 「インポート」ボタンで保存したレイアウト設定を読み込み

## コンポーネントの追加方法

新しいコンポーネントタイプを追加する場合は、以下の手順で実装します：

1. `src/types/index.ts`にコンポーネントの型定義を追加

```typescript
export type ComponentType = 'button' | 'gridLayout' | /* 新しいコンポーネントタイプ */;

// コンポーネントのプロパティ型を定義
export interface NewComponentProps {
  // プロパティを定義
}
```

2. `src/utils/componentRegistry.ts`にコンポーネントのメタデータを登録

```typescript
componentRegistry.register('newComponent', {
  defaultWidth: 2,
  defaultHeight: 1,
  defaultProps: {
    // デフォルトのプロパティ値
  }
});
```

3. `src/components/editor/ComponentLayout.tsx`にコンポーネントのマッピングを追加

```typescript
const componentMap = {
  button: ButtonComponent,
  // 新しいコンポーネントを追加
  newComponent: NewComponent
};
```

4. コンポーネントの実装

```typescript
// src/components/editor/NewComponent.tsx
export default class NewComponent extends React.PureComponent<NewComponentProps> {
  static render(props: NewComponentProps) {
    return (
      // コンポーネントの実装
    );
  }
}
```

## 制限事項

- ネストは最大5階層まで
- グリッドは12x12サイズ
- コンポーネントは重ならないように配置される

## 技術スタック

- React
- TypeScript
- Material-UI
- react-grid-layout
- Vite
- ESLint

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
