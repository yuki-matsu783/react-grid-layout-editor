import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { gridItemsAtom, selectedItemIdAtom, initializeGridItems } from '../../../store/atoms';
import { useLayoutOperations } from '../../../hooks/useLayoutOperations';
import { useTreeOperations } from '../../../hooks/useTreeOperations';
import { useComponentOperations } from './useComponentOperations';
import { useFileOperations } from './useFileOperations';
import { useRenderOperations } from './useRenderOperations';
import { useAddComponentOperations } from './useAddComponentOperations';
import type { Layout } from '../../../types';

/**
 * エディタの主要なロジックを管理するカスタムフック
 */
export const useEditorLogic = (cols: number, rowHeight: number, margin: [number, number]) => {
  // グローバル状態
  const [items, setItems] = useAtom(gridItemsAtom);
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);

  // ローカル状態
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [selectingMode, setSelectingMode] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  // カスタムフックの初期化
  const { updateLayoutInTree, updateItemProps, removeFromTree } = useLayoutOperations();
  const { findItemInTree, isItemInEditTarget, isNestedItemSelected, isLayoutComponent } = useTreeOperations();
  const { handleExport, handleImport } = useFileOperations();
  const { calculateGridItemStyle, calculateWrapperStyle } = useRenderOperations();
  const { handleAddComponent } = useAddComponentOperations();

  /**
   * レイアウトの初期化
   */
  useEffect(() => {
    setItems(initializeGridItems());
  }, [setItems]);

  /**
   * グリッドレイアウトの変更を処理する
   */
  const handleLayoutChange = (layout: Layout[]) => {
    layout.forEach(layoutItem => {
      const itemId = layoutItem.i.replace('layout_', '');
      const affectedItem = findItemInTree(items, itemId);
      if (affectedItem) {
        setItems(prevItems => updateLayoutInTree(prevItems, affectedItem.id, layoutItem));
      }
    });
  };

  /**
   * グリッドアイテムを選択する
   */
  const handleSelect = (id: string): void => {
    const selectedItem = findItemInTree(items, id);
    if (!selectedItem) return;

    if (selectingMode) {
      if (isLayoutComponent(selectedItem.component.type)) {
        setSelectedItemId(id);
        setEditTargetId(id);
        setSelectingMode(false);
        console.log('編集対象に設定:', id, selectedItem.component.type);
      }
      return;
    }

    if (editTargetId) {
      const editTargetItem = findItemInTree(items, editTargetId);
      if (editTargetItem) {
        if (isLayoutComponent(editTargetItem.component.type)) {
          if (isItemInEditTarget(items, id, editTargetId)) {
            setSelectedItemId(id);
            console.log('編集対象内のアイテムを選択:', id);
          }
        }
      }
      return;
    }

    console.log('通常選択:', id);
    setSelectedItemId(id);
  };

  /**
   * 編集対象の選択モードを切り替える
   */
  const toggleEditTarget = () => {
    if (editTargetId) {
      setEditTargetId(null);
      setSelectingMode(false);
    } else if (selectingMode) {
      setSelectingMode(false);
    } else {
      setSelectingMode(true);
    }
  };

  /**
   * 選択中のアイテムを削除する
   */
  const handleRemoveItem = () => {
    if (!selectedItemId) return;
    
    setItems(prev => removeFromTree(prev, selectedItemId));
    setSelectedItemId(null);
    if (editTargetId === selectedItemId) {
      setEditTargetId(null);
    }
  };

  /**
   * ファイルからレイアウトをインポートする
   */
  const onFileImport = async (file: File) => {
    const result = await handleImport(file);
    if (result) {
      setItems(result.items);
      setSelectedItemId(null);
      setEditTargetId(null);
    }
    setFileInputKey(prev => prev + 1);
  };

  /**
   * ドラッグ＆ドロップとリサイズの可否を判定する
   */
  const isDraggableAndResizable = (): boolean => {
    if (selectingMode) return false;
    return !editTargetId || !isNestedItemSelected(editTargetId, items);
  };

  return {
    // 状態
    state: {
      items,
      selectedItemId,
      editTargetId,
      selectingMode,
      fileInputKey
    },
    // 編集操作
    edit: {
      handleLayoutChange,
      handleSelect,
      toggleEditTarget,
      handleRemoveItem,
      updateItemProps: (id: string, newProps: any) => setItems(prev => updateItemProps(prev, id, newProps))
    },
    // ファイル操作
    file: {
      handleExport: () => handleExport(items),
      handleImport: onFileImport
    },
    // コンポーネント追加
    add: {
      handleAddComponent: (type: any, prefix: string) => {
        const [success, newItems] = handleAddComponent(items, editTargetId, type, prefix);
        if (success) {
          setItems(newItems);
        }
        return success;
      }
    },
    // レンダリング補助
    render: {
      calculateGridItemStyle,
      calculateWrapperStyle,
      isDraggableAndResizable
    }
  };
};
