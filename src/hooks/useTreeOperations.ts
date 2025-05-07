import { GridItem } from '../types';

/**
 * ツリー構造の操作に関する共通ロジックを提供するカスタムフック
 * グリッドレイアウト内のコンポーネントツリーに対する検索や階層計算などの操作を管理する
 * @returns ツリー操作に関する関数群
 */
export const useTreeOperations = () => {
  /**
   * ツリー内から指定されたIDを持つアイテムを再帰的に検索する
   * グリッドレイアウト内の任意の深さにあるアイテムを検索可能
   * @param nodes - 検索対象のノード配列
   * @param id - 検索するアイテムのID
   * @returns 見つかったアイテム、見つからない場合はnull
   */
  const findItemInTree = (nodes: GridItem[], id: string): GridItem | null => {
    // ノードを逐次探索
    for (const node of nodes) {
      // IDが一致した場合はそのノードを返す
      if (node.id === id) {
        return node;
      }
      // グリッドレイアウトの場合は子要素も再帰的に探索
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
   * 指定されたアイテムのツリー内での深さを計算する
   * ルートレベルを0とし、各グリッドレイアウトのネストレベルごとに+1される
   * @param nodes - 計算対象のノード配列
   * @param itemId - 深さを計算するアイテムのID
   * @returns アイテムの深さ（見つからない場合は-1）
   */
  const calculateDepth = (nodes: GridItem[], itemId: string): number => {
    // 再帰的に深さを計算する内部関数
    const calculateDepthRecursive = (nodes: GridItem[], targetId: string, currentDepth: number = 0): number => {
      for (const node of nodes) {
        // 対象のアイテムが見つかった場合は現在の深さを返す
        if (node.id === targetId) {
          return currentDepth;
        }
        // グリッドレイアウトの場合は子要素も再帰的に探索（深さを1増やす）
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
   * アイテムが指定された編集対象の子孫かどうかを確認する
   * 編集対象自身も含めて、そのグリッドレイアウト内に存在するかどうかを判定
   * @param nodes - 検査対象のノード配列
   * @param itemId - 検査するアイテムのID
   * @param targetEditId - 編集対象のグリッドレイアウトのID
   * @returns 子孫である場合はtrue、そうでない場合はfalse
   */
  const isItemInEditTarget = (nodes: GridItem[], itemId: string, targetEditId: string): boolean => {
    // 編集対象のグリッドレイアウトを検索
    const editTarget = findItemInTree(nodes, targetEditId);
    if (!editTarget || editTarget.component.type !== 'gridLayout') return false;

    if (itemId === targetEditId) return true;

    // 子要素を再帰的に検索する内部関数
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
   * 選択されたアイテムが指定されたノード配列内にネストされているかどうかを確認する
   * @param selectedId - 検索する選択アイテムのID
   * @param nodes - 検査対象のノード配列
   * @returns ネストされている場合はtrue、そうでない場合はfalse
   */
  const isNestedItemSelected = (selectedId: string | null, nodes: GridItem[]): boolean => {
    if (!selectedId) return false;
    return findItemInTree(nodes, selectedId) !== null;
  };

  /**
   * 指定されたIDを持つアイテムの親アイテムを検索する
   * @param nodes - 検索対象のノード配列
   * @param id - 親を検索するアイテムのID
   * @returns 親アイテム、見つからない場合はnull
   */
  const findParentItem = (nodes: GridItem[], id: string): GridItem | null => {
    // すべてのノードをチェック
    for (const node of nodes) {
      // グリッドレイアウトまたはスタックコンポーネントの場合
      if ('children' in node.component.props) {
        // 直接の子要素に対象がある場合
        if (node.component.props.children.some(child => child.id === id)) {
          return node;
        }
        // 子要素を再帰的に探索
        const found = findParentItem(node.component.props.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  return {
    findItemInTree,
    calculateDepth,
    isItemInEditTarget,
    isNestedItemSelected,
    findParentItem,
  };
};
