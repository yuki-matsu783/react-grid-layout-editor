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
 * アプリケーション起動時に呼び出され、指定されたレイアウトを生成する
 * @returns 初期化されたグリッドアイテムの配列
 */
export const initializeGridItems = (): GridItem[] => [
  {
    id: "grid_initial",
    layout: {
      i: "layout_grid_9ynv2awrk",
      x: 3,
      y: 1,
      w: 9,
      h: 7,
      moved: false,
      static: false
    },
    component: {
      type: "gridLayout",
      props: {
        children: [],
        widthPercentage: 100,
        heightPercentage: 100,
        horizontalAlign: "center",
        verticalAlign: "center"
      }
    }
  },
  {
    id: "row_initaial",
    layout: {
      i: "layout_row_initaial",
      x: 3,
      y: 0,
      w: 9,
      h: 1,
      moved: false,
      static: false
    },
    component: {
      type: "rowStack",
      props: {
        children: [],
        widthPercentage: 100,
        heightPercentage: 100,
        horizontalAlign: "center",
        verticalAlign: "center"
      }
    }
  },
  {
    id: "col_initial",
    layout: {
      i: "layout_col_initial",
      x: 0,
      y: 0,
      w: 3,
      h: 8,
      moved: false,
      static: false
    },
    component: {
      type: "colStack",
      props: {
        children: [],
        widthPercentage: 100,
        heightPercentage: 100,
        horizontalAlign: "center",
        verticalAlign: "center"
      }
    }
  }
];
