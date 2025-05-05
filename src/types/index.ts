/**
 * グリッドレイアウトの基本定義
 * x, y: グリッド上の位置
 * w, h: 幅と高さ（グリッド単位）
 */
export interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * ツリー構造を持つグリッドアイテム
 * レイアウト情報と子要素を持つ
 */
export interface TreeItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  layout: Layout;
  children: TreeItem[];
}

// ボックススタイルの型
export interface BoxStyles {
  background?: string;
  border?: string;
  padding?: string;
  borderRadius?: string;
}

// ボックスレイアウトの型
export interface BoxLayout {
  position?: 'start' | 'center' | 'end' | 'stretch';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
}

// コンポーネント定義の型
export interface ComponentDefinition {
  type: string;
  props: {
    variant?: string;
    color?: string;
    size?: string;
    fullWidth?: boolean;
    placeholder?: string;
    label?: string;
    options?: Array<{ value: string; label: string }>;
    // Box特有のプロパティ
    background?: string;
    border?: string;
    borderRadius?: string;
    padding?: number;
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    children?: Array<LayoutItem>;
    [key: string]: string | boolean | number | Array<{ value: string; label: string }> | Array<LayoutItem> | undefined;
  };
  styles: {
    custom: Record<string, string>;
    mui: Record<string, any>;
  };
}

// ボックスコンポーネントの型
export interface BoxComponent {
  id: string;
  name: string;
  styles: BoxStyles;
  layout: BoxLayout;
  component?: ComponentDefinition;
}

// レイアウトアイテムの型
export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isBox?: boolean;
  boxSettings?: BoxComponent;
  component?: ComponentDefinition;
}
