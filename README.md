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
- ラジオグループコンポーネントの追加と設定
  - 動的なラジオオプションの追加/削除/編集
  - 縦/横レイアウトの切り替え
  - プライマリ、セカンダリ、エラーカラー
  - 必須入力の設定
  - 有効/無効状態の切り替え

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

2. **各種コンポーネントの追加**
   - 「XXXを追加」ボタンをクリックしてXXXコンポーネントを追加
   - 右側のパネルで以下の設定を編集可能：
     - サイズと配置の調整
     - コンポーネントごとに特有のpropsの調整


5. **編集モード**
   - 領域を選択して「領域内を編集」ボタンをクリックすると、その領域内のみを編集可能
   - 「領域内の編集終了」で編集モードを終了

5. **削除**
   - 要素を選択して「選択した領域を削除」ボタンをクリック

### インポート/エクスポート

- 「エクスポート」ボタンでレイアウト設定をJSONファイルとして保存
- 「インポート」ボタンで保存したレイアウト設定を読み込み

## このプロジェクトに新しいコンポーネントを追加する方法

新しいコンポーネントをプロジェクトに追加するには、以下の手順を実行してください：

1. **型定義の追加**
   - `src/types/index.ts` に新しいコンポーネントの型定義を追加します。
   ```typescript
   export type ComponentType = 'button' | 'gridLayout' | 'textField' | 'radioGroup' | 'newComponent';

   export interface NewComponentProps extends BaseLayoutProps {
  // コンポーネント固有のプロパティを追加
     label: string;
     variant: 'outlined' | 'contained';
   }
   ```

2. **コンポーネントの実装**
   - `src/components/editor/NewComponent.tsx` に新しいコンポーネントを実装します。
   ```tsx
   import React from 'react';
   import { Box, Button } from '@mui/material';
   import type { NewComponentProps, BaseComponent } from '../../types';
   import { CommonLayoutSettings } from './common/CommonLayoutSettings';

   const NewComponent: BaseComponent<NewComponentProps> = {
     render: (props: NewComponentProps) => {
       const { label, variant } = props;
       return (
         <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Button variant={variant}>{label}</Button>
         </Box>
       );
     },

     renderSettings: (props: NewComponentProps, onUpdate: (newProps: Partial<NewComponentProps>) => void) => {
       return (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
           <CommonLayoutSettings props={props} onUpdate={onUpdate} />
           <input
             type="text"
             value={props.label}
             onChange={(e) => onUpdate({ label: e.target.value })}
           />
           <select
             value={props.variant}
             onChange={(e) => onUpdate({ variant: e.target.value as 'outlined' | 'contained' })}
           >
             <option value="outlined">枠線付き</option>
             <option value="contained">塗りつぶし</option>
           </select>
         </Box>
       );
     },
   };

   export default NewComponent;
   ```

3. **コンポーネントの登録**
   - `src/utils/componentRegistry.ts` に新しいコンポーネントを登録します。
   ```typescript
   import NewComponent from '../components/editor/NewComponent';

   const defaultNewComponentProps: NewComponentProps = {
     label: '新しいコンポーネント',
     variant: 'outlined',
     widthPercentage: 80,
     heightPercentage: 50,
     horizontalAlign: 'center',
     verticalAlign: 'center',
   };

   componentRegistry.registerComponent('newComponent', {
     displayName: '新しいコンポーネント',
     icon: createElement(AddBoxIcon),
     defaultWidth: 2,
     defaultHeight: 1,
     defaultProps: defaultNewComponentProps,
   });
   ```

4. **設定パネルへの追加**
   - `src/components/editor/ComponentSettingsPanel.tsx` に新しいコンポーネントを設定パネルに追加します。
   ```tsx
   import NewComponent from './NewComponent';

   const componentMap = {
     button: ButtonComponent,
     textField: TextFieldComponent,
     gridLayout: GridLayoutComponent,
     radioGroup: RadioGroupComponent,
     newComponent: NewComponent, // 新しいコンポーネントを追加
   };
   ```

5. **エディタへの追加**
   - `src/components/editor/ComponentEditor.tsx` に新しいコンポーネントを追加するボタンを実装します。
   ```tsx
   const handleAddNewComponent = () => handleAddComponent('newComponent', 'new');

   <Box>
     <Button
       variant="outlined"
       fullWidth
       onClick={handleAddNewComponent}
       startIcon={<AddBoxIcon />}
     >
       XXXを追加
     </Button>
   </Box>
   ```

6. **プロパティ更新ロジックの追加**
   - `src/hooks/useLayoutOperations.ts` に新しいコンポーネントのプロパティ更新ロジックを追加します。
   ```typescript
   case 'newComponent':
     updatedComponent.props = {
       ...updatedComponent.props,
       ...(newProps as Partial<NewComponentProps>),
     } as NewComponentProps;
     break;
   ```

7. **動作確認**
   - プロジェクトを起動し、エディタ画面で「XXXを追加」ボタンをクリック。
   - グリッドに `NewComponent` が追加され、設定パネルでプロパティを編集できることを確認します。

これで、新しいコンポーネントが他のコンポーネントと同様に扱えるようになります。

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
