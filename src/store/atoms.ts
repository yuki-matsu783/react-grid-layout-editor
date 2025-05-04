import { atom } from 'jotai';
import type {
  PageLayout,
  LayoutItem,
  Selection,
  EditMode,
  DragState,
  HistoryEntry
} from '../types';

// 初期ページレイアウト
const initialPageLayout: PageLayout = {
  metadata: {
    title: 'New Layout',
    description: '',
    createdAt: new Date().toISOString(),
    version: '1.0.0',
    author: '',
  },
  settings: {
    theme: {
      palette: {},
      typography: {},
      spacing: {},
    },
    grid: {
      columns: 12,
      rowHeight: 30,
      padding: 10,
    },
    responsive: {
      breakpoints: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
      layouts: {},
    },
  },
  dependencies: [],
  apis: [],
};

// 現在のレイアウト状態
export const layoutAtom = atom<PageLayout>(initialPageLayout);

// 現在選択されているコンポーネントと表示中のブレークポイント
export const selectionAtom = atom<Selection>({
  componentId: null,
  breakpoint: 'lg',
});

// 編集モード
export const editModeAtom = atom<EditMode>('layout');

// ドラッグ&ドロップ状態
export const dragStateAtom = atom<DragState>({
  isDragging: false,
  draggedComponent: null,
});

// 操作履歴
export const historyAtom = atom<HistoryEntry[]>([]);
export const historyIndexAtom = atom<number>(-1);

// アンドゥ/リドゥの派生アトム
export const canUndoAtom = atom((get) => {
  const historyIndex = get(historyIndexAtom);
  return historyIndex > 0;
});

export const canRedoAtom = atom((get) => {
  const history = get(historyAtom);
  const historyIndex = get(historyIndexAtom);
  return historyIndex < history.length - 1;
});

// コンポーネントの検索用文字列
export const searchQueryAtom = atom<string>('');

// 表示中のブレークポイントのレイアウト（派生アトム）
export const currentBreakpointLayoutAtom = atom((get) => {
  const layout = get(layoutAtom);
  const { breakpoint } = get(selectionAtom);
  return layout.settings.responsive.layouts[breakpoint] || [];
});

// 選択中のコンポーネント（派生アトム）
export const selectedComponentAtom = atom((get) => {
  const { componentId } = get(selectionAtom);
  const layout = get(currentBreakpointLayoutAtom);
  return layout.find(item => item.id === componentId);
});

// グリッド設定（派生アトム）
export const gridSettingsAtom = atom((get) => {
  const layout = get(layoutAtom);
  return layout.settings.grid;
});
