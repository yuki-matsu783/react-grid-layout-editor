import type { ComponentType, GridItem,  } from '../../../types';
import  { ComponentMetadata } from '../../../utils/componentRegistry';

/**
 * コンポーネント操作に関連する関数を提供するカスタムフック
 */
export const useComponentOperations = () => {
  /**
   * ユニークなIDを生成する
   * @param prefix - IDのプレフィックス（デフォルト: "grid"）
   * @returns プレフィックスと乱数を組み合わせたユニークなID
   */
  const generateId = (prefix = "grid"): string => {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
  };

  /**
   * アイテムIDからレイアウトIDを生成する
   * @param itemId - 元となるアイテムID
   * @returns レイアウトID（'layout_'プレフィックス付き）
   */
  const generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  /**
   * レイアウトIDからアイテムIDを抽出する
   * @param layoutId - レイアウトID
   * @returns アイテムID（'layout_'プレフィックスを除去）
   */
  const extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  /**
   * 新しいコンポーネントのGridItem設定を生成する
   * @param type - 作成するコンポーネントのタイプ
   * @param itemId - コンポーネントのID
   * @param position - グリッド上の配置位置
   * @param metadata - コンポーネントのメタデータ
   * @returns 新しいGridItem設定
   */
  const createNewComponent = (
    type: ComponentType,
    itemId: string,
    position: { x: number, y: number },
    metadata: ComponentMetadata<any>
  ): GridItem => {
    return {
      id: itemId,
      layout: {
        i: `layout_${itemId}`,
        x: position.x,
        y: position.y,
        w: metadata.defaultWidth,
        h: metadata.defaultHeight
      },
      component: {
        type,
        props: metadata.defaultProps
      }
    };
  };

  return {
    generateId,
    generateLayoutId,
    extractItemId,
    createNewComponent
  };
};
