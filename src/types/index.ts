import type { Layout as RGLLayout } from 'react-grid-layout';

/**
 * Layout構造の型
 */
export type Layout = RGLLayout;

/**
 * ボタンの配置位置を定義
 */
export type ButtonAlignment = 'start' | 'center' | 'end';

/**
 * ボタンコンポーネントの設定を定義
 */
export interface ButtonConfig {
  type: 'button';
  props: {
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
    horizontalAlign: ButtonAlignment;
    verticalAlign: ButtonAlignment;
  };
}

/**
 * グリッドレイアウトコンポーネントの設定を定義
 */
export interface GridLayoutConfig {
  type: 'gridLayout';
  props: {
    children: GridItem[];
  };
}

/**
 * グリッドアイテムの構造を定義
 */
export interface GridItem {
  id: string;
  layout: Layout;
  component: ButtonConfig | GridLayoutConfig;
}

/**
 * コンポーネントの設定構造を定義
 */
export type ComponentConfig = ButtonConfig | GridLayoutConfig;
