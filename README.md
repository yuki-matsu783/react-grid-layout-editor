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
export type ComponentType = 'button' | 'gridLayout' | 'textField' | 'newComponent';

// ComponentAlignmentを使用して配置設定を定義
export type ComponentAlignment = 'start' | 'center' | 'end';

// コンポーネントのプロパティ型を定義
export interface NewComponentProps extends BaseLayoutProps {
  // その他の必要なプロパティを追加
}

// ComponentConfigに新しいコンポーネント設定を追加
export type ComponentConfig =
  | { type: 'button'; props: ButtonProps }
  | { type: 'gridLayout'; props: GridLayoutProps }
  | { type: 'textField'; props: TextFieldProps }
  | { type: 'newComponent'; props: NewComponentProps };
```

2. `src/components/editor/NewComponent.tsx`でコンポーネントを実装し、BaseComponentインターフェースを実装する

```typescript
import React from 'react';
import { Box } from '@mui/material';
import type { NewComponentProps, BaseComponent } from '../../types';

const NewComponent: BaseComponent<NewComponentProps> = {
  render: (props: NewComponentProps) => {
    const { widthPercentage, heightPercentage, horizontalAlign, verticalAlign } = props;

    // 水平・垂直方向の配置設定をflexboxのalignmentに変換
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    return (
      <Box sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems,
        justifyContent
      }}>
        {/* コンポーネントの実装 */}
      </Box>
    );
  },

  renderSettings: (props: NewComponentProps, onUpdate: (newProps: Partial<NewComponentProps>) => void) => {
    // 設定パネルのUI実装
    return null;
  }
};

export default NewComponent;
```

3. `src/utils/componentRegistry.ts`にコンポーネントを登録

```typescript
// デフォルトプロパティを定義
const defaultNewComponentProps: NewComponentProps = {
  widthPercentage: 80,
  heightPercentage: 50,
  horizontalAlign: 'center',
  verticalAlign: 'center',
  // その他の必要なプロパティのデフォルト値を設定
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

4. `src/components/editor/ComponentEditor.tsx`のコンポーネントマップに追加

```typescript
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  gridLayout: GridLayoutComponent,
  newComponent: NewComponent,  // 新しいコンポーネントを追加
};

type ComponentMapType = typeof componentMap;
```

5. `ComponentEditor`クラスに新しいコンポーネントの追加ハンドラーを実装

```typescript
handleAddNewComponent = () => {
  this.handleAddComponent('newComponent', 'new');
};
```

6. `ComponentEditor`クラスのrender関数のボタン追加セクションに追加

```typescript
<Button
  variant="outlined"
  fullWidth
  onClick={this.handleAddNewComponent}
  startIcon={<AddBoxIcon />}
>
  新しいコンポーネントを追加
</Button>
```

この手順で新しいコンポーネントタイプを追加できます。既存のコンポーネント（ButtonComponentやTextFieldComponent）を参考にして、必要な機能やスタイリングを実装してください。

## 制限事項

- ネストは最大5階層まで
- グリッドは12x12サイズ
- コンポーネントは重ならないように配置される
- 作成したコンポーネントの縦横比は内側の要素の大きさに関わらず固定される

## 技術スタック

- React
- TypeScript
- Material-UI
- react-grid-layout
- Vite
- ESLint

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
