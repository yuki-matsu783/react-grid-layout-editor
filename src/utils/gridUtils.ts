/**
 * グリッドレイアウトに関連するユーティリティ関数を提供するモジュール
 */
import { TreeItem, Layout } from '../types';

/**
 * ユニークなIDを生成する
 * @param prefix - IDのプレフィックス（デフォルト: "item"）
 * @returns プレフィックスとランダムな文字列を組み合わせたユニークなID
 */
export const generateId = (prefix = "item"): string => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 指定されたサイズのアイテムを配置可能な位置を探す
 * 12x12のグリッドマップ内で空きスペースを探索する
 * 
 * @param children - 現在の子要素配列
 * @param requestedW - 希望する幅
 * @param requestedH - 希望する高さ
 * @returns 配置可能な位置情報。配置不可能な場合はnull
 */
export const findAvailableSpace = (
  children: TreeItem[],
  requestedW: number,
  requestedH: number
) => {
  // 12x12のグリッドマップを作成（全てfalseで初期化）
  const gridMap = Array(12).fill(null).map(() => Array(12).fill(false));

  // 既存のアイテムで占有されているグリッドをマーク
  children.forEach(child => {
    const { x, y, w, h } = child.layout;
    for (let i = x; i < x + w; i++) {
      for (let j = y; j < y + h; j++) {
        if (i < 12 && j < 12) {
          gridMap[i][j] = true;
        }
      }
    }
  });

  // まず要求されたサイズで配置可能な場所を探す
  const normalSpace = findSpace(gridMap, requestedW, requestedH);
  if (normalSpace) return normalSpace;

  // 要求サイズで配置できない場合、1x1で配置可能な場所を探す
  if (requestedW !== 1 || requestedH !== 1) {
    return findSpace(gridMap, 1, 1);
  }

  return null;
};

/**
 * グリッドマップ内で指定されたサイズの空きスペースを探す
 * @param gridMap - 12x12のグリッドマップ（true: 占有済み、false: 空き）
 * @param w - 探索する幅
 * @param h - 探索する高さ
 * @returns 配置可能な位置情報。配置不可能な場合はnull
 */
const findSpace = (gridMap: boolean[][], w: number, h: number) => {
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x <= 12 - w; x++) {
      let canPlace = true;
      for (let i = x; i < x + w && canPlace; i++) {
        for (let j = y; j < y + h && canPlace; j++) {
          if (j >= 12 || gridMap[i][j]) {
            canPlace = false;
          }
        }
      }
      if (canPlace) {
        return { x, y, w, h };
      }
    }
  }
  return null;
};

/**
 * ツリー構造に新しい子要素を追加する
 * @param nodes 現在のツリー構造
 * @param parentId 親要素のID
 * @param child 追加する子要素
 * @returns 更新されたツリー構造
 */
export const addChildToTree = (nodes: TreeItem[], parentId: string, child: TreeItem): TreeItem[] =>
  nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, child] };
    }
    if (node.children.length) {
      return { ...node, children: addChildToTree(node.children, parentId, child) };
    }
    return node;
  });

/**
 * ツリー構造から指定されたアイテムを削除する
 * @param nodes 現在のツリー構造
 * @param targetId 削除対象のID
 * @returns 更新されたツリー構造
 */
export const removeFromTree = (nodes: TreeItem[], targetId: string): TreeItem[] =>
  nodes
    .map(node => {
      if (node.id === targetId) return null;
      if (node.children.length) {
        return { ...node, children: removeFromTree(node.children, targetId) };
      }
      return node;
    })
    .filter((node): node is TreeItem => node !== null);

/**
 * レイアウトが有効か検証する
 * @param layout - 検証するレイアウト配列
 * @returns レイアウトが有効な場合はtrue
 */
export const validateLayout = (layout: Layout[]): boolean => {
  return layout.every((item: Layout) => item.y + item.h <= 12);
};

/**
 * 指定したアイテムの子孫に選択されているアイテムが存在するか確認
 * @param selectedId 検索対象のID
 * @param nodes 検索を行うツリー構造
 * @param excludeSelfId 除外するID（自身のIDを除外する場合に使用）
 * @returns 子孫に選択されているアイテムが存在する場合はtrue
 */
export const isNestedItemSelected = (
  selectedId: string | null,
  nodes: TreeItem[],
  excludeSelfId: string | null = null
): boolean => {
  if (!selectedId) return false;

  const search = (items: TreeItem[]): boolean =>
    items.some(item => {
      if (item.id === selectedId) {
        return excludeSelfId ? item.id !== excludeSelfId : true;
      }
      return search(item.children);
    });

  return search(nodes);
};

/**
 * ツリー構造内の指定されたIDを持つノードの子要素を取得する
 * @param nodes - 検索対象のツリー構造
 * @param targetId - 取得したい親ノードのID
 * @returns 指定されたIDを持つノードの子要素配列、見つからない場合はnull
 */
export const getNodeChildren = (nodes: TreeItem[], targetId: string): TreeItem[] | null => {
  for (const node of nodes) {
    if (node.id === targetId) return node.children;
    if (node.children.length) {
      const res = getNodeChildren(node.children, targetId);
      if (res) return res;
    }
  }
  return null;
};
