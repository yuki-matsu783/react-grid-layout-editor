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
/**
 * デフォルトのグリッドアイテムを返す関数
 * サンプルレイアウトとして使用される
 * @returns デフォルトのグリッドアイテムの配列
 */
export const getDefaultGridItems = (): GridItem[] => [
  {
    id: "grid_initial",
    layout: {
      i: "layout_grid_initial",
      x: 2,
      y: 1,
      w: 10,
      h: 7,
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
      x: 2,
      y: 0,
      w: 10,
      h: 1,
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
      w: 2,
      h: 8,
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

/**
 * 初期グリッドアイテムを生成する関数
 * アプリケーション起動時に呼び出され、空のレイアウトを返す
 * @returns 空のグリッドアイテムの配列
 */
export const initializeGridItems = (): GridItem[] => [];
