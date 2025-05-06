import type { Layout as RGLLayout } from 'react-grid-layout';
import type { ReactNode } from 'react';

/**
 * Layout構造の型
 */
export type Layout = RGLLayout;

/**
 * コンポーネントの配置位置を定義
 */
export type ComponentAlignment = 'start' | 'center' | 'end';

/**
 * 利用可能なコンポーネントタイプを定義
 */
export type ComponentType = 'button' | 'gridLayout' | 'textField';

/**
 * ボタンコンポーネントのプロパティを定義
 */
export interface ButtonProps {
  // ボタンの見た目の設定
  variant: 'text' | 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'error';
  label: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  
  // サイズ設定（親要素に対する割合 1-100%）
  widthPercentage: number;
  heightPercentage: number;
  
  // 配置設定
  horizontalAlign: ComponentAlignment;
  verticalAlign: ComponentAlignment;
}

/**
 * テキストフィールドコンポーネントのプロパティを定義
 */
export interface TextFieldProps {
  // 入力フィールドの設定
  label: string;
  placeholder?: string;
  variant: 'outlined' | 'filled' | 'standard';
  type: 'text' | 'password' | 'number' | 'email';
  multiline: boolean;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  
  // サイズ設定（親要素に対する割合 1-100%）
  widthPercentage: number;
  heightPercentage: number;
  
  // 配置設定
  horizontalAlign: ComponentAlignment;
  verticalAlign: ComponentAlignment;
}

/**
 * グリッドレイアウトのプロパティを定義
 */
export interface GridLayoutProps {
  children: GridItem[];
  // サイズ設定（親要素に対する割合 1-100%）
  widthPercentage: number;
  heightPercentage: number;
  // 配置設定
  horizontalAlign: ComponentAlignment;
  verticalAlign: ComponentAlignment;
}

/**
 * コンポーネントの設定を定義
 */
export type ComponentConfig =
  | { type: 'button'; props: ButtonProps }
  | { type: 'gridLayout'; props: GridLayoutProps }
  | { type: 'textField'; props: TextFieldProps };

/**
 * グリッドアイテムの構造を定義
 */
export interface GridItem {
  id: string;
  layout: Layout;
  component: ComponentConfig;
}

/**
 * コンポーネントの基本インターフェース
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
 * 設定パネルのプロパティを定義
 */
export type ComponentProps<T extends ComponentConfig> = T extends { type: 'button' }
  ? ButtonProps
  : T extends { type: 'gridLayout' }
  ? GridLayoutProps
  : T extends { type: 'textField' }
  ? TextFieldProps
  : never;

export interface ComponentSettingsPanelProps {
  selectedItem: GridItem | null;
  onUpdate: <T extends ComponentConfig>(id: string, newProps: Partial<ComponentProps<T>>) => void;
}
