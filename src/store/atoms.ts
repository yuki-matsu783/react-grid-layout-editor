import { atom } from 'jotai';
import type { GridItem } from '../types';

/**
 * グリッドアイテムの状態を管理するatom
 * レイアウトエディタ内の全てのグリッドアイテムを格納する
 */
export const gridItemsAtom = atom<GridItem[]>([]);

/**
 * 選択中のアイテムIDを管理するatom
 * 現在選択されているグリッドアイテムのIDを保持する
 */
export const selectedItemIdAtom = atom<string | null>(null);

/**
 * 初期グリッドアイテムを生成する関数
 * アプリケーション起動時に呼び出され、ルートとなるグリッドレイアウトを生成する
 * @param rootId - ルートアイテムのID
 * @returns 初期化されたグリッドアイテムの配列
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
