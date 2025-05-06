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
- テキストフィールドコンポーネントの追加と設定
  - 単一行/複数行入力
  - パスワード、数値、メールアドレスなど各種入力タイプ
  - バリデーション（必須入力）

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

3. **テキストフィールドの追加**
   - 「テキストフィールドを追加」ボタンをクリックしてテキストフィールドコンポーネントを追加
   - 右側のパネルで以下の設定を編集可能：
     - ラベルとプレースホルダー
     - 入力タイプ（テキスト、パスワード、数値、メール）
     - スタイル（枠線付き、塗りつぶし、標準）
     - 複数行入力の有効化と行数設定
     - 必須入力の設定
     - サイズと配置の調整

4. **編集モード**
   - 領域を選択して「領域内を編集」ボタンをクリックすると、その領域内のみを編集可能
   - 「領域内の編集終了」で編集モードを終了

5. **削除**
   - 要素を選択して「選択した領域を削除」ボタンをクリック

### インポート/エクスポート

- 「エクスポート」ボタンでレイアウト設定をJSONファイルとして保存
- 「インポート」ボタンで保存したレイアウト設定を読み込み

## コンポーネントの追加方法

新しいコンポーネントタイプを追加する場合は、以下の手順で実装します：

1. `src/types/index.ts`にコンポーネントの型定義を追加

```typescript
// ComponentTypeに新しいタイプを追加
export type ComponentType = 'button' | 'gridLayout' | 'newComponent';

// コンポーネントのプロパティ型を定義
export interface NewComponentProps {
  // プロパティを定義
}

// ComponentConfigに新しいコンポーネント設定を追加
export type ComponentConfig =
  | { type: 'button'; props: ButtonProps }
  | { type: 'gridLayout'; props: GridLayoutProps }
  | { type: 'newComponent'; props: NewComponentProps };
```

2. `src/utils/componentRegistry.ts`にコンポーネントのメタデータを登録

```typescript
// デフォルトプロパティを定義
const defaultNewComponentProps: NewComponentProps = {
  // デフォルト値を設定
};

// コンポーネントを登録
componentRegistry.registerComponent('newComponent', {
  displayName: '新しいコンポーネント',
  icon: createElement(NewComponentIcon),
  defaultWidth: 2,
  defaultHeight: 1,
  defaultProps: defaultNewComponentProps
});
```

3. コンポーネントの実装

```typescript
// src/components/editor/NewComponent.tsx
export default class NewComponent implements BaseComponent<NewComponentProps> {
  render(props: NewComponentProps): React.ReactNode {
    return (
      // コンポーネントの実装
    );
  }

  renderSettings(
    props: NewComponentProps,
    onUpdate: (newProps: Partial<NewComponentProps>) => void
  ): React.ReactNode {
    return (
      // 設定UIの実装
    );
  }
}
```

4. `src/components/editor/ComponentLayout.tsx`にコンポーネントのマッピングを追加

```typescript
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  newComponent: NewComponent  // 新しいコンポーネントを追加
};
```

5. `src/components/editor/ComponentSettingsPanel.tsx`に設定パネルの処理を追加

```typescript
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  newComponent: NewComponent  // 新しいコンポーネントを追加
};

// renderSettings関数内のswitch文に新しいケースを追加
switch (selectedItem.component.type) {
  case 'newComponent':
    return settingsComponent.renderSettings(
      selectedItem.component.props as NewComponentProps,
      (newProps: Partial<NewComponentProps>) => onUpdate(selectedItem.id, newProps)
    );
  // ...他のケース
}
```

6. `ComponentLayout`クラスのupdateItemPropsメソッドに新しいコンポーネントの処理を追加

```typescript
updateItemProps = (
  nodes: GridItem[],
  itemId: string,
  newProps: Partial<ButtonProps | GridLayoutProps | NewComponentProps>  // 型を追加
): GridItem[] => {
  return nodes.map(node => {
    if (node.id === itemId) {
      switch (node.component.type) {
        case 'newComponent':  // 新しいケースを追加
          return {
            ...node,
            component: {
              ...node.component,
              props: {
                ...node.component.props,
                ...newProps as Partial<NewComponentProps>
              }
            }
          };
        // ...他のケース
      }
    }
    // ...既存のコード
  });
};
```

7. 必要に応じて、新しいコンポーネントを追加するボタンとハンドラーを実装

```typescript
handleAddNewComponent = () => {
  const { editTargetId, items } = this.state;
  
  // 既存のコンポーネント追加処理と同様の実装
  const metadata = componentRegistry.getMetadata('newComponent');
  if (!metadata) {
    console.error('NewComponent metadata not found');
    return;
  }

  // ...コンポーネントの追加処理
};

// render関数内のボタン追加
<Button
  variant="outlined"
  onClick={this.handleAddNewComponent}
  startIcon={<AddBoxIcon />}
>
  新しいコンポーネントを追加
</Button>
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
