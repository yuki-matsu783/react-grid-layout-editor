// コンポーネント定義の型
export interface ComponentDefinition {
  type: string;
  props: {
    variant?: string;
    color?: string;
    size?: string | number;
    fullWidth?: boolean;
    elevation?: number;
    severity?: string;
    position?: string;
    [key: string]: string | number | boolean | undefined;
  };
  styles: {
    custom: Record<string, string>;
    mui: Record<string, any>;
  };
  events?: {
    type: string;
    action: string;
    target?: string;
  }[];
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    [key: string]: any;
  };
  dataBinding?: {
    source: string;
    field: string;
    type: string;
  };
}

// レイアウトアイテムの型
export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component: ComponentDefinition;
  children?: LayoutItem[];
}

// ページレイアウトの型
export interface PageLayout {
  metadata: {
    title: string;
    description: string;
    createdAt: string;
    version: string;
    author: string;
  };
  settings: {
    theme: {
      palette: Record<string, string>;
      typography: Record<string, any>;
      spacing: Record<string, number>;
    };
    grid: {
      columns: number;
      rowHeight: number;
      padding: number;
    };
    responsive: {
      breakpoints: Record<string, number>;
      layouts: Record<string, LayoutItem[]>;
    };
  };
  dependencies: string[];
  apis: {
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
    parameters?: Record<string, any>;
  }[];
}

// コード生成テンプレートの型
export interface CodeGenerationTemplate {
  type: 'react' | 'next' | 'remix';
  format: {
    components: boolean;
    styles: boolean;
    api: boolean;
    store: boolean;
  };
  options: {
    typescript: boolean;
    prettier: boolean;
    eslint: boolean;
  };
}

// ドラッグ&ドロップの状態型
export interface DragState {
  isDragging: boolean;
  draggedComponent: string | null;
}

// 編集モードの型
export type EditMode = 'layout' | 'style' | 'data' | 'preview';

// 選択状態の型
export interface Selection {
  componentId: string | null;
  breakpoint: string;
}

// アンドゥ/リドゥのための履歴エントリの型
export interface HistoryEntry {
  layout: PageLayout;
  timestamp: number;
}

// エクスポートオプションの型
export interface ExportOptions {
  includeStyles: boolean;
  includeData: boolean;
  includeEvents: boolean;
  format: 'json' | 'typescript' | 'javascript';
}
