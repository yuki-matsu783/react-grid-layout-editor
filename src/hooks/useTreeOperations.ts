import { GridItem } from '../types';

/**
 * ツリー構造の操作に関する共通ロジックを提供するカスタムフック
 */
export const useTreeOperations = () => {
  /**
   * ツリー内から指定されたIDを持つアイテムを検索
   */
  const findItemInTree = (nodes: GridItem[], id: string): GridItem | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.component.type === 'gridLayout') {
        const found = findItemInTree(node.component.props.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  /**
   * 指定されたアイテムの深さを計算
   */
  const calculateDepth = (nodes: GridItem[], itemId: string): number => {
    const calculateDepthRecursive = (nodes: GridItem[], targetId: string, currentDepth: number = 0): number => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return currentDepth;
        }
        if (node.component.type === 'gridLayout') {
          const childDepth = calculateDepthRecursive(node.component.props.children, targetId, currentDepth + 1);
          if (childDepth !== -1) {
            return childDepth;
          }
        }
      }
      return -1;
    };

    return calculateDepthRecursive(nodes, itemId, 0);
  };

  /**
   * アイテムが編集対象の子孫かどうかを確認
   */
  const isItemInEditTarget = (nodes: GridItem[], itemId: string, targetEditId: string): boolean => {
    const editTarget = findItemInTree(nodes, targetEditId);
    if (!editTarget || editTarget.component.type !== 'gridLayout') return false;

    if (itemId === targetEditId) return true;

    const searchInChildren = (nodes: GridItem[]): boolean => {
      return nodes.some(node => {
        if (node.id === itemId) return true;
        if (node.component.type === 'gridLayout') {
          return searchInChildren(node.component.props.children);
        }
        return false;
      });
    };

    return searchInChildren(editTarget.component.props.children);
  };

  /**
   * 選択されたアイテムがネストされているかどうかを確認
   */
  const isNestedItemSelected = (selectedId: string | null, nodes: GridItem[], excludeSelfId: string | null = null): boolean => {
    if (!selectedId) return false;
    const search = (items: GridItem[]): boolean =>
      items.some(item => {
        if (item.id === selectedId) {
          return excludeSelfId ? item.id !== excludeSelfId : true;
        }
        if (item.component.type === 'gridLayout') {
          return search(item.component.props.children);
        }
        return false;
      });
    return search(nodes);
  };

  return {
    findItemInTree,
    calculateDepth,
    isItemInEditTarget,
    isNestedItemSelected,
  };
};
