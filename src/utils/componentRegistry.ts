import type { ComponentDefinition } from '../types';

// コンポーネントのデフォルトサイズ（グリッドユニット）
export const defaultComponentSizes: Record<string, { w: number; h: number }> = {
  TextField: { w: 4, h: 1 },
  Button: { w: 2, h: 1 },
};

// 新しいコンポーネントインスタンスを作成する関数
export const createComponentInstance = (type: string): ComponentDefinition => {
  const defaultProps = {
    TextField: {
      variant: 'outlined' as const,
      fullWidth: true,
      placeholder: 'テキストを入力',
      size: 'medium' as const,
    },
    Button: {
      variant: 'contained' as const,
      color: 'primary' as const,
      size: 'medium' as const,
    },
  };

  return {
    type,
    props: defaultProps[type as keyof typeof defaultProps],
    styles: {
      custom: {},
      mui: {},
    },
  };
};

// コンポーネントのデフォルトサイズを取得する関数
export const getComponentDefaultSize = (type: string) => {
  return defaultComponentSizes[type] || { w: 2, h: 2 };
};
