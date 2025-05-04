// コンポーネント定義の型
export interface ComponentDefinition {
  type: string;
  props: {
    variant?: string;
    color?: string;
    size?: string;
    fullWidth?: boolean;
    placeholder?: string;
    [key: string]: string | boolean | undefined;
  };
  styles: {
    custom: Record<string, string>;
    mui: Record<string, any>;
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
}
