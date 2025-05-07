import { atom } from 'jotai';
import type { GridItem } from '../types';

/**
 * エディタのグローバル状態管理
 * Jotaiを使用して、エディタの主要な状態を管理する
 */

/**
 * グリッドアイテムのツリー構造を管理するatom
 * 全てのコンポーネントとそのレイアウト情報を保持する
 * @type {GridItem[]} - グリッドアイテムの配列
 */
export const gridItemsAtom = atom<GridItem[]>([]);

/**
 * 選択中のアイテムIDを管理するatom
 * 設定パネルに表示するコンポーネントの特定に使用
 * @type {string | null} - 選択されたアイテムのID、未選択時はnull
 */
export const selectedItemIdAtom = atom<string | null>(null);

/**
 * 初期状態を設定するためのヘルパー関数
 * ルートとなるグリッドレイアウトを生成する
 * 
 * @param rootId - ルートコンポーネントのID
 * @returns {GridItem[]} 初期化されたグリッドアイテムの配列
 * 
 * 生成される初期レイアウト:
 * - 幅: 12ユニット（最大幅）
 * - 高さ: 8ユニット
 * - 位置: (0,0)から開始
 * - 中央配置
 * - 子要素なし
 */
export const initializeGridItems = (rootId: string): GridItem[] => [{
  id: rootId,
  layout: { i: `layout_${rootId}`, x: 0, y: 0, w: 12, h: 8 },
  component: {
    type: 'gridLayout',
    props: {
      children: [],
      widthPercentage: 100,
      heightPercentage: 100,
      horizontalAlign: 'center',
      verticalAlign: 'center'
    }
  }
}];
