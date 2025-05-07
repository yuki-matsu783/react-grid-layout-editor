import { atom } from 'jotai';
import type { GridItem } from '../types';

/**
 * グリッドアイテムのツリー構造を管理するatom
 */
export const gridItemsAtom = atom<GridItem[]>([]);

/**
 * 選択中のアイテムIDを管理するatom
 */
export const selectedItemIdAtom = atom<string | null>(null);

/**
 * 初期状態を設定するためのヘルパー関数
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