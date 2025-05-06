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
export interface NewComponentProps {
  // サイズ設定（親要素に対する割合 1-100%）
  widthPercentage: number;
  heightPercentage: number;
  // 配置設定
  horizontalAlign: ComponentAlignment;
  verticalAlign: ComponentAlignment;
  // その他の必要なプロパティを追加
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
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { NewComponentProps, BaseComponent } from '../../types';

/**
 * 新しいコンポーネントの実装
 */
class NewComponent implements BaseComponent<NewComponentProps> {
  /**
   * コンポーネントをレンダリングする
   * @param props コンポーネントのプロパティ
   */
  render(props: NewComponentProps): React.ReactNode {
    const {
      widthPercentage,
      heightPercentage,
      horizontalAlign,
      verticalAlign,
    } = props;

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
  }

  /**
   * コンポーネントの設定UIをレンダリングする
   * @param props 現在のプロパティ
   * @param onUpdate プロパティ更新時のコールバック
   */
  renderSettings(
    props: NewComponentProps,
    onUpdate: (newProps: Partial<NewComponentProps>) => void
  ): React.ReactNode | null {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* サイズ設定 */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            幅: {props.widthPercentage}%
          </Typography>
          <Slider
            size="small"
            value={props.widthPercentage}
            onChange={(_, value) => onUpdate({ widthPercentage: value as number })}
            min={10}
            max={100}
            step={1}
            sx={{ py: 0.5 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
            高さ: {props.heightPercentage}%
          </Typography>
          <Slider
            size="small"
            value={props.heightPercentage}
            onChange={(_, value) => onUpdate({ heightPercentage: value as number })}
            min={10}
            max={100}
            step={1}
            sx={{ py: 0.5 }}
          />
        </Box>

        {/* 配置設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>配置</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>水平</InputLabel>
              <Select
                value={props.horizontalAlign}
                label="水平"
                onChange={(e) => onUpdate({ horizontalAlign: e.target.value as ComponentAlignment })}
              >
                <MenuItem value="start">左寄せ</MenuItem>
                <MenuItem value="center">中央</MenuItem>
                <MenuItem value="end">右寄せ</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>垂直</InputLabel>
              <Select
                value={props.verticalAlign}
                label="垂直"
                onChange={(e) => onUpdate({ verticalAlign: e.target.value as ComponentAlignment })}
              >
                <MenuItem value="start">上寄せ</MenuItem>
                <MenuItem value="center">中央</MenuItem>
                <MenuItem value="end">下寄せ</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    );
  }
}

// シングルトンインスタンスをエクスポート
export default new NewComponent();
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

4. `src/components/editor/ComponentLayout.tsx`のコンポーネントマップに追加

```typescript
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  newComponent: NewComponent,  // 新しいコンポーネントを追加
};

type ComponentMapType = typeof componentMap;
```

5. `ComponentLayout`クラスに新しいコンポーネントの追加ハンドラーを実装

```typescript
handleAddNewComponent = () => {
  this.handleAddComponent('newComponent', 'new');
};
```

6. `ComponentLayout`クラスのrender関数にボタンを追加

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
