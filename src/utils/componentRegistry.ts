import { ReactNode, createElement } from 'react';
import type { ComponentType, ComponentConfig, ButtonProps, GridLayoutProps } from '../types';
import AddBoxIcon from '@mui/icons-material/AddBox';

/**
 * コンポーネントのメタデータを定義するインターフェース
 */
export interface ComponentMetadata<T extends ComponentConfig['props']> {
  // コンポーネントの表示名
  displayName: string;
  // コンポーネント追加ボタンに表示するアイコン
  icon: ReactNode;
  // コンポーネントのデフォルトの幅（グリッド単位）
  defaultWidth: number;
  // コンポーネントのデフォルトの高さ（グリッド単位）
  defaultHeight: number;
  // コンポーネントのデフォルトプロパティ
  defaultProps: T;
}

/**
 * コンポーネントタイプごとのメタデータマップ
 */
type ComponentMetadataMap = {
  button: ComponentMetadata<ButtonProps>;
  gridLayout: ComponentMetadata<GridLayoutProps>;
};

/**
 * コンポーネントの登録と管理を行うクラス
 */
class ComponentRegistry {
  private components: Map<ComponentType, ComponentMetadataMap[ComponentType]> = new Map();

  /**
   * コンポーネントを登録する
   * @param type コンポーネントのタイプ
   * @param metadata コンポーネントのメタデータ
   */
  registerComponent<T extends ComponentType>(
    type: T,
    metadata: ComponentMetadataMap[T]
  ): void {
    this.components.set(type, metadata);
    console.log(`Registered component: ${type}`);
  }

  /**
   * 登録済みのコンポーネントタイプの一覧を取得
   */
  getRegisteredTypes(): ComponentType[] {
    return Array.from(this.components.keys());
  }

  /**
   * コンポーネントのメタデータを取得
   * @param type コンポーネントのタイプ
   */
  getMetadata<T extends ComponentType>(type: T): ComponentMetadataMap[T] | undefined {
    return this.components.get(type) as ComponentMetadataMap[T] | undefined;
  }

  /**
   * コンポーネントのデフォルトプロパティを取得
   * @param type コンポーネントのタイプ
   */
  getDefaultProps<T extends ComponentType>(type: T): ComponentMetadataMap[T]['defaultProps'] | undefined {
    return this.components.get(type)?.defaultProps as ComponentMetadataMap[T]['defaultProps'] | undefined;
  }

  /**
   * コンポーネントのデフォルトサイズを取得する
   * @param type コンポーネントのタイプ
   * @returns {[number, number]} [width, height] のタプル
   */
  getComponentDefaultSize(type: ComponentType): [number, number] {
    const metadata = this.components.get(type);
    return metadata ? [metadata.defaultWidth, metadata.defaultHeight] : [1, 1];
  }
}

// Export named function for direct use
export const getComponentDefaultSize = (type: ComponentType): [number, number] => {
  return componentRegistry.getComponentDefaultSize(type);
};

// シングルトンインスタンスを作成
export const componentRegistry = new ComponentRegistry();

// デフォルトのボタンコンポーネントを登録
const defaultButtonProps: ButtonProps = {
  variant: 'contained',
  color: 'primary',
  label: 'ボタン',
  size: 'medium',
  widthPercentage: 80,
  heightPercentage: 50,
  horizontalAlign: 'center',
  verticalAlign: 'center',
};

componentRegistry.registerComponent('button', {
  displayName: 'ボタン',
  icon: createElement(AddBoxIcon),
  defaultWidth: 2,
  defaultHeight: 1,
  defaultProps: defaultButtonProps
});

// デフォルトのグリッドレイアウトコンポーネントを登録
const defaultGridLayoutProps: GridLayoutProps = {
  children: []
};

componentRegistry.registerComponent('gridLayout', {
  displayName: 'グリッドレイアウト',
  icon: createElement(AddBoxIcon),
  defaultWidth: 2,
  defaultHeight: 2,
  defaultProps: defaultGridLayoutProps
});

export default componentRegistry;
