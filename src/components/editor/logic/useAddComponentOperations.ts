import { useLayoutOperations } from '../../../hooks/useLayoutOperations';
import { useTreeOperations } from '../../../hooks/useTreeOperations';
import type { ComponentType, GridItem, ParentType, GridLayoutProps } from '../../../types';
import componentRegistry, { ComponentMetadata } from '../../../utils/componentRegistry';
import { useComponentOperations } from './useComponentOperations';

/**
 * コンポーネントの追加に関連する操作を提供するカスタムフック
 */
export const useAddComponentOperations = () => {
  const layoutOps = useLayoutOperations();
  const treeOps = useTreeOperations();
  const componentOps = useComponentOperations();

  /**
   * 新しいコンポーネントをグリッドに追加する
   * @param items - 現在のアイテムリスト
   * @param editTargetId - 編集対象のID
   * @param componentType - 追加するコンポーネントの種類
   * @param idPrefix - 生成するIDのプレフィックス
   * @returns [成功したかどうか, 更新されたアイテムリスト]
   */
  const handleAddComponent = (
    items: GridItem[],
    editTargetId: string | null,
    componentType: ComponentType,
    idPrefix: string
  ): [boolean, GridItem[]] => {
    // 編集対象が選択されている場合、ネストの深さをチェック（最大5階層まで）
    if (editTargetId) {
      const depth = treeOps.calculateDepth(items, editTargetId);
      if (depth >= 4) {
        return [false, items];
      }
    }
    
    // 新しいコンポーネントを追加する対象のアイテム配列を決定
    const targetItems = editTargetId
      ? (() => {
          const targetItem = treeOps.findItemInTree(items, editTargetId);
          if (!targetItem) return [];
          
          // レイアウト系コンポーネントかつ子要素を持てる場合のみ追加可能
          if (treeOps.isLayoutComponent(targetItem.component.type) && treeOps.hasChildren(targetItem.component.props)) {
            console.log(`Adding to ${targetItem.component.type}, current children:`, targetItem.component.props.children);
            return targetItem.component.props.children || [];
          }
          return [];
        })()
      : items;

    // 親コンポーネントのタイプを取得
    const parentType = (() => {
      if (!editTargetId) return 'grid' as ParentType;
      const targetItem = treeOps.findItemInTree(items, editTargetId);
      if (!targetItem) return 'grid' as ParentType;
      
      if (targetItem.component.type === 'rowStack' || targetItem.component.type === 'colStack') {
        return 'stack' as ParentType;
      }
      return 'grid' as ParentType;
    })();

    // グリッドレイアウト用のデフォルトメタデータを定義
    const defaultGridLayoutMetadata = { 
      displayName: 'Grid Layout',
      icon: 'grid_view',
      defaultWidth: 2, 
      defaultHeight: 2, 
      defaultProps: {
        children: [] as GridItem[],
        widthPercentage: 100,
        heightPercentage: 100,
        horizontalAlign: 'center',
        verticalAlign: 'center'
      } 
    } as ComponentMetadata<GridLayoutProps>;

    // コンポーネントのメタデータを取得
    const metadata = componentType === 'gridLayout' 
      ? defaultGridLayoutMetadata
      : componentRegistry.getMetadata(componentType);

    if (!metadata) {
      console.error(`${componentType} component metadata not found`);
      return [false, items];
    }

    // 利用可能な位置を探す
    const findResult = layoutOps.findAvailablePosition(
      metadata.defaultWidth,
      metadata.defaultHeight,
      targetItems
    );

    // グリッドレイアウトの場合、1x1でも配置を試みる
    const position = !findResult.canPlace && componentType === 'gridLayout'
      ? layoutOps.findAvailablePosition(1, 1, targetItems)
      : findResult;

    if (!position.canPlace) {
      return [false, items];
    }

    // 新しいアイテムを作成
    const itemId = componentOps.generateId(idPrefix);
    const newItem = componentOps.createNewComponent(componentType, itemId, position, metadata);

    // アイテムを追加（編集対象があれば子要素として、なければルートレベルに）
    const newItems = !editTargetId
      ? [...items, newItem]
      : layoutOps.addChildToTree(items, editTargetId, newItem);

    return [true, newItems];
  };

  return {
    handleAddComponent
  };
};
