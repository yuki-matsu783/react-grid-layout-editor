import type { Layout as RGLLayout } from 'react-grid-layout';
import type { ReactNode } from 'react';
import type { Theme } from '@mui/material';

/**
 * Layout構造の型定義
 * react-grid-layoutのLayout型をエイリアスとして使用
 */
export type Layout = RGLLayout;

/**
 * レイアウトエディタのプロパティを定義
 */
export interface ComponentEditorProps {
  /** カラム数の設定（ブレークポイントごとに設定可能） */
  cols: { [key: string]: number };
  /** グリッドの行の高さ（ピクセル単位） */
  rowHeight: number;
  /** グリッドアイテム間のマージン [水平, 垂直] */
  margin: [number, number];
}

/**
 * コンポーネントの配置位置を定義
 * start: 開始位置（左/上）
 * center: 中央
 * end: 終了位置（右/下）
 */
export type ComponentAlignment = 'start' | 'center' | 'end';

/**
 * 利用可能なコンポーネントタイプを定義
 */
export type ComponentType = 'button' | 'gridLayout' | 'textField' | 'radioGroup';

/**
 * コンポーネントの基本レイアウトプロパティを定義
 */
export interface BaseLayoutProps {
  /** 幅の設定（親要素に対する割合 1-100%） */
  widthPercentage: number;
  /** 高さの設定（親要素に対する割合 1-100%） */
  heightPercentage: number;
  /** パディング設定（親要素に対する割合 0-100%） */
  paddingPercentage?: number;
  /** 水平方向の配置設定 */
  horizontalAlign: ComponentAlignment;
  /** 垂直方向の配置設定 */
  verticalAlign: ComponentAlignment;
}

/**
 * ボタンコンポーネントのプロパティを定義
 */
export interface ButtonProps extends BaseLayoutProps {
  /** ボタンの見た目の種類（text/contained/outlined） */
  variant: 'text' | 'contained' | 'outlined';
  /** ボタンの色 */
  color?: 'primary' | 'secondary' | 'error';
  /** ボタンのテキスト */
  label: string;
  /** ボタンの無効化状態 */
  disabled?: boolean;
  /** ボタンのサイズ */
  size?: 'small' | 'medium' | 'large';
}

/**
 * テキストフィールドコンポーネントのプロパティを定義
 */
export interface TextFieldProps extends BaseLayoutProps {
  /** フィールドのラベル */
  label: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** フィールドの見た目の種類 */
  variant: 'outlined' | 'filled' | 'standard';
  /** 入力タイプ */
  type: 'text' | 'password' | 'number' | 'email';
  /** 複数行入力の有効化 */
  multiline: boolean;
  /** 複数行入力時の行数 */
  rows?: number;
  /** フィールドの無効化状態 */
  disabled?: boolean;
  /** 必須入力の設定 */
  required?: boolean;
}

/**
 * グリッドレイアウトのプロパティを定義
 */
export interface GridLayoutProps extends BaseLayoutProps {
  /** グリッドレイアウト内の子アイテム */
  children: GridItem[];
}

/**
 * コンポーネントの設定を定義
 * 各コンポーネントタイプに対応するプロパティを持つユニオン型
 */
/**
 * ラジオグループコンポーネントのプロパティを定義
 */
export interface RadioGroupProps extends BaseLayoutProps {
  /** ラジオグループのラベル */
  label: string;
  /** ラジオオプションの配列 */
  options: Array<{
    value: string;
    label: string;
  }>;
  /** 選択値 */
  value: string;
  /** 水平配置（true）か垂直配置（false）か */
  row: boolean;
  /** 無効化状態 */
  disabled?: boolean;
  /** 必須入力 */
  required?: boolean;
  /** カラーテーマ */
  color: 'primary' | 'secondary' | 'error';
}

export type ComponentConfig =
  | { type: 'button'; props: ButtonProps }
  | { type: 'gridLayout'; props: GridLayoutProps }
  | { type: 'textField'; props: TextFieldProps }
  | { type: 'radioGroup'; props: RadioGroupProps };

/**
 * グリッドアイテムの構造を定義
 */
export interface GridItem {
  /** アイテムの一意のID */
  id: string;
  /** アイテムのレイアウト情報 */
  layout: Layout;
  /** アイテムのコンポーネント設定 */
  component: ComponentConfig;
}

/**
 * コンポーネントの基本インターフェース
 * すべてのコンポーネントが実装する必要がある機能を定義
 */
export interface BaseComponent<T = any> {
  /**
   * コンポーネントをレンダリングする
   * @param props コンポーネントのプロパティ
   * @returns レンダリングされたコンポーネント
   */
  render(props: T): ReactNode;

  /**
   * コンポーネントの設定UIをレンダリングする
   * @param props 現在のプロパティ
   * @param onUpdate プロパティ更新時のコールバック
   * @returns 設定UI
   */
  renderSettings(props: T, onUpdate: (newProps: Partial<T>) => void): ReactNode;
}

/**
 * コンポーネントのプロパティ型を取得するヘルパー型
 */
export type ComponentProps<T extends ComponentConfig> = 
    T extends { type: 'gridLayout' }
  ? GridLayoutProps
  : T extends { type: 'button' }
  ? ButtonProps
  : T extends { type: 'textField' }
  ? TextFieldProps
  : T extends { type: 'radioGroup' }
  ? RadioGroupProps
  : never;

/**
 * 設定パネルのプロパティを定義
 */
export interface ComponentSettingsPanelProps {
  /** 選択されたアイテム（未選択の場合はnull） */
  selectedItem: GridItem | null;
  /** アイテムのプロパティ更新時のコールバック */
  onUpdate: <T extends ComponentConfig>(id: string, newProps: Partial<ComponentProps<T>>) => void;
}
