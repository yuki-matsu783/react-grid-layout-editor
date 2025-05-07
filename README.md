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
  - テキスト、アウトライン、塗りつぶしスタイル
  - プライマリ、セカンダリ、エラーカラー
  - サイズ（小、中、大）
- テキストフィールドコンポーネントの追加と設定
  - 単一行/複数行入力
  - パスワード、数値、メールアドレスなど各種入力タイプ
  - バリデーション（必須入力）
  - 3種類の表示スタイル（標準、枠線付き、塗りつぶし）

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
   - 右側のパネルで以下の設定を編集可能：
     - ラベルテキスト
     - スタイル（テキスト、アウトライン、塗りつぶし）
     - カラー（プライマリ、セカンダリ、エラー）
     - サイズ（小、中、大）
     - 有効/無効状態
     - サイズと配置の調整

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

// コンポーネントのプロパティ型を定義（BaseLayoutPropsを継承）
export interface NewComponentProps extends BaseLayoutProps {
  // BaseLayoutPropsで継承される共通プロパティ
  // - widthPercentage: 親要素に対する幅の割合（1-100%）
  // - heightPercentage: 親要素に対する高さの割合（1-100%）
  // - horizontalAlign: 水平方向の配置（'start' | 'center' | 'end'）
  // - verticalAlign: 垂直方向の配置（'start' | 'center' | 'end'）

  // コンポーネント固有のプロパティを追加
  label: string;
  variant: 'outlined' | 'contained';
  // その他必要なプロパティ
}

// ComponentConfigに新しいコンポーネント設定を追加
export type ComponentConfig =
  | { type: 'button'; props: ButtonProps }
  | { type: 'gridLayout'; props: GridLayoutProps }
  | { type: 'textField'; props: TextFieldProps }
  | { type: 'newComponent'; props: NewComponentProps };
```

2. `src/components/editor/NewComponent.tsx`でコンポーネントを実装

```typescript
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup
} from '@mui/material';
import type { NewComponentProps, BaseComponent } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';

/**
 * 新しいコンポーネントの実装
 */
const NewComponent: BaseComponent<NewComponentProps> = {
  /**
   * コンポーネントをレンダリングする
   * @param props コンポーネントのプロパティ
   */
  render: (props: NewComponentProps) => {
    const {
      label,
      variant
    } = props;

    return (
      <Box sx={{
        width: '100%',
        height: '100%'
      }}>
        {/* コンポーネントの実装 */}
        <Box sx={{
          p: 1,
          border: variant === 'outlined' ? '1px solid' : 'none'
        }}>
          {label}
        </Box>
      </Box>
    );
  },

  /**
   * コンポーネントの設定UIをレンダリングする
   * @param props 現在のプロパティ
   * @param onUpdate プロパティ更新時のコールバック
   */
  renderSettings: (
    props: NewComponentProps,
    onUpdate: (newProps: Partial<NewComponentProps>) => void
  ) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 共通レイアウト設定 */}
        <CommonLayoutSettings props={props} onUpdate={onUpdate} />

        <Typography variant="body2" gutterBottom>基本設定</Typography>

        {/* テキスト設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>テキスト</Typography>
          <TextField
            size="small"
            fullWidth
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </Box>

        {/* スタイル設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>スタイル</Typography>
          <ButtonGroup size="small" variant="outlined" fullWidth>
            {(['outlined', 'contained'] as const).map((v) => (
              <Button
                key={v}
                onClick={() => onUpdate({ variant: v })}
                color={props.variant === v ? 'primary' : 'inherit'}
              >
                {v}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>
    );
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
  label: '新しいコンポーネント',
  variant: 'outlined'
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

上記の手順で新しいコンポーネントタイプを追加できます。実装の際は以下の点に注意してください：

- BaseLayoutPropsを継承して、サイズと配置の共通設定を活用
- renderメソッドでは、親要素に対する相対サイズ（widthPercentage, heightPercentage）を適切に反映
- renderSettingsメソッドで、直感的な設定UIを提供
- コンポーネントレジストリに適切なデフォルト値を設定

## 制限事項

- ネストは最大5階層まで
- グリッドは12x12サイズ
- コンポーネントは重ならないように配置される
- 作成したコンポーネントの縦横比は内側の要素の大きさに関わらず固定される
- コンポーネントのサイズは親要素に対する相対値（パーセンテージ）で指定

## 技術スタック

- React
- TypeScript
- Material-UI
- react-grid-layout
- Vite
- ESLint

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
