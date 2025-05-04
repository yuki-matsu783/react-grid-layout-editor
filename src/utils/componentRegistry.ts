import type { ComponentDefinition } from '../types';

// MUIコンポーネントのカテゴリー定義
export const componentCategories = {
  inputs: 'フォーム部品',
  navigation: 'ナビゲーション',
  surfaces: 'サーフェス',
  feedback: 'フィードバック',
  dataDisplay: 'データ表示',
  layout: 'レイアウト',
} as const;

// 利用可能なコンポーネントの定義
export const availableComponents: Record<string, ComponentDefinition> = {
  // 入力系コンポーネント
  TextField: {
    type: 'TextField',
    props: {
      variant: 'outlined',
      fullWidth: true,
      size: 'medium',
    },
    styles: {
      custom: {},
      mui: {},
    },
    validation: {
      required: false,
    },
  },
  Button: {
    type: 'Button',
    props: {
      variant: 'contained',
      color: 'primary',
      size: 'medium',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },
  Select: {
    type: 'Select',
    props: {
      variant: 'outlined',
      fullWidth: true,
    },
    styles: {
      custom: {},
      mui: {},
    },
  },

  // サーフェス系コンポーネント
  Card: {
    type: 'Card',
    props: {
      variant: 'outlined',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },
  Paper: {
    type: 'Paper',
    props: {
      elevation: 1,
    },
    styles: {
      custom: {},
      mui: {},
    },
  },

  // データ表示系コンポーネント
  Table: {
    type: 'Table',
    props: {
      size: 'medium',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },
  Typography: {
    type: 'Typography',
    props: {
      variant: 'body1',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },

  // フィードバック系コンポーネント
  Alert: {
    type: 'Alert',
    props: {
      severity: 'info',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },
  Progress: {
    type: 'CircularProgress',
    props: {
      size: 40,
    },
    styles: {
      custom: {},
      mui: {},
    },
  },

  // ナビゲーション系コンポーネント
  Tabs: {
    type: 'Tabs',
    props: {
      variant: 'standard',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },
  AppBar: {
    type: 'AppBar',
    props: {
      position: 'static',
    },
    styles: {
      custom: {},
      mui: {},
    },
  },
};

// コンポーネントのカテゴリー分類
export const componentsByCategory: Record<keyof typeof componentCategories, string[]> = {
  inputs: ['TextField', 'Button', 'Select'],
  surfaces: ['Card', 'Paper'],
  dataDisplay: ['Table', 'Typography'],
  feedback: ['Alert', 'Progress'],
  navigation: ['Tabs', 'AppBar'],
  layout: [],
};

// コンポーネントのデフォルトサイズ（グリッドユニット）
export const defaultComponentSizes: Record<string, { w: number; h: number }> = {
  TextField: { w: 6, h: 1 },
  Button: { w: 2, h: 1 },
  Select: { w: 6, h: 1 },
  Card: { w: 6, h: 4 },
  Paper: { w: 6, h: 4 },
  Table: { w: 12, h: 6 },
  Typography: { w: 12, h: 1 },
  Alert: { w: 12, h: 1 },
  Progress: { w: 2, h: 2 },
  Tabs: { w: 12, h: 1 },
  AppBar: { w: 12, h: 1 },
};

// 新しいコンポーネントインスタンスを作成する関数
export const createComponentInstance = (
  type: string,
  id: string
): ComponentDefinition => {
  const baseComponent = availableComponents[type];
  if (!baseComponent) {
    throw new Error(`Unknown component type: ${type}`);
  }

  return {
    ...baseComponent,
    props: { ...baseComponent.props },
    styles: {
      custom: { ...baseComponent.styles.custom },
      mui: { ...baseComponent.styles.mui },
    },
  };
};

// コンポーネントのデフォルトサイズを取得する関数
export const getComponentDefaultSize = (type: string) => {
  return defaultComponentSizes[type] || { w: 2, h: 2 };
};
