import type { ComponentDefinition, BoxComponent } from '../types';

// コンポーネントのデフォルトサイズ（グリッドユニット）
export const defaultComponentSizes: Record<string, { w: number; h: number }> = {
  TextField: { w: 4, h: 1 },
  Button: { w: 2, h: 1 },
  Select: { w: 4, h: 1 },
  Checkbox: { w: 2, h: 1 },
  Radio: { w: 2, h: 1 },
  Switch: { w: 2, h: 1 },
  GridContainer: { w: 6, h: 4 },
};

// 新しいBoxインスタンスを作成する関数
export const createBoxInstance = (id: string): BoxComponent => {
  // IDからデフォルトの名前を生成（例：Box-1 → Box 1）
  const defaultName = id.replace('-', ' ');
  
  return {
    id,
    name: defaultName,
    styles: {
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      padding: '16px',
      borderRadius: '4px',
    },
    layout: {
      position: 'start',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
  };
};

// 新しいコンポーネントインスタンスを作成する関数
export const createComponentInstance = (type: string): ComponentDefinition => {
  const defaultProps = {
    GridContainer: {
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: 2,
      children: [],
    },
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
      label: 'Button',
    },
    Select: {
      variant: 'outlined' as const,
      fullWidth: true,
      label: '選択してください',
      options: [
        { value: 'option1', label: 'オプション1' },
        { value: 'option2', label: 'オプション2' },
        { value: 'option3', label: 'オプション3' },
      ],
      size: 'medium' as const,
    },
    Checkbox: {
      color: 'primary' as const,
      label: 'チェックボックス',
    },
    Radio: {
      color: 'primary' as const,
      label: 'ラジオボタン',
    },
    Switch: {
      color: 'primary' as const,
      label: 'スイッチ',
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
