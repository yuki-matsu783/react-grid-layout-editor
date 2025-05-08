import { useRef, useState, useEffect } from "react";
import { useAtom } from 'jotai';
import type { 
  Layout, 
  GridItem, 
  ComponentType,
  GridLayoutProps,
  ParentType
} from '../../../types';
import { gridItemsAtom, selectedItemIdAtom, initializeGridItems } from '../../../store/atoms';
import { useLayoutOperations } from '../../../hooks/useLayoutOperations';
import { useTreeOperations } from '../../../hooks/useTreeOperations';
import componentRegistry, { ComponentMetadata } from '../../../utils/componentRegistry';

/**
 * ComponentEditorのロジックを提供するカスタムフック
 */
export const useComponentEditor = (cols: any, rowHeight: number, margin: [number, number]) => {
  // グローバル状態
  const [items, setItems] = useAtom(gridItemsAtom);
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);

  // ローカル状態
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectingMode, setSelectingMode] = useState(false);

  // refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // カスタムフック
  const {
    findAvailablePosition,
    updateLayoutInTree,
    addChildToTree,
    removeFromTree,
    updateItemProps,
  } = useLayoutOperations();

  const {
    findItemInTree,
    calculateDepth,
    isItemInEditTarget,
    isNestedItemSelected,
    isLayoutComponent,
    hasChildren,
    findParentItem,
  } = useTreeOperations();

  /**
   * レイアウトの初期化
   */
  useEffect(() => {
    setItems(initializeGridItems());
  }, [setItems]);

  /**
   * アイテムIDからレイアウトIDを生成する
   */
  const generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  /**
   * レイアウトIDからアイテムIDを抽出する
   */
  const extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  const updateItemLayout = (itemId: string, newLayout: Layout) => {
    setItems(prevItems => updateLayoutInTree(prevItems, itemId, newLayout));
  };

  /**
   * グリッドレイアウトの変更を処理する
   */
  const handleLayoutChange = (layout: Layout[]) => {
    const processedLayout = layout.map(layoutItem => {
      const itemId = extractItemId(layoutItem.i);
      return {
        ...layoutItem,
        i: generateLayoutId(itemId)
      };
    });

    processedLayout.forEach(layoutItem => {
      const itemId = extractItemId(layoutItem.i);
      const affectedItem = findItemInTree(items, itemId);
      if (affectedItem) {
        updateItemLayout(affectedItem.id, layoutItem);
      }
    });
  };

  /**
   * ユニークなIDを生成する
   */
  function generateId(prefix = "grid"): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 新しいコンポーネントのGridItem設定を生成する
   */
  function createNewComponent(
    type: ComponentType,
    itemId: string,
    position: { x: number, y: number },
    metadata: ComponentMetadata<any>
  ): GridItem {
    return {
      id: itemId,
      layout: {
        i: `layout_${itemId}`,
        x: position.x,
        y: position.y,
        w: metadata.defaultWidth,
        h: metadata.defaultHeight
      },
      component: {
        type,
        props: metadata.defaultProps
      }
    };
  }

  /**
   * 新しいコンポーネントをグリッドに追加する
   */
  const handleAddComponent = (
    componentType: ComponentType,
    idPrefix: string
  ): boolean => {
    // 編集対象が選択されている場合、ネストの深さをチェック（最大5階層まで）
    if (editTargetId) {
      const depth = calculateDepth(items, editTargetId);
      if (depth >= 4) {
        alert('これ以上階層を深くすることはできません（最大5階層まで）');
        return false;
      }
    }
    
    // 新しいコンポーネントを追加する対象のアイテム配列を決定
    const targetItems = editTargetId
      ? (() => {
          const targetItem = findItemInTree(items, editTargetId);
          if (!targetItem) return [];
          
          // レイアウト系コンポーネントかつ子要素を持てる場合のみ追加可能
          if (isLayoutComponent(targetItem.component.type) && hasChildren(targetItem.component.props)) {
            console.log(`Adding to ${targetItem.component.type}, current children:`, targetItem.component.props.children);
            return targetItem.component.props.children || [];
          }
          return [];
        })()
      : items;

    // 子要素を持つコンポーネントへの追加かどうかを判定
    const isAddingToParent = editTargetId && (() => {
      const targetItem = findItemInTree(items, editTargetId);
      return targetItem && isLayoutComponent(targetItem.component.type);
    })();

    // 親コンポーネントのタイプを取得
    const parentType = (() => {
      if (!editTargetId) return 'grid' as ParentType;
      const targetItem = findItemInTree(items, editTargetId);
      if (!targetItem) return 'grid' as ParentType;
      
      if (targetItem.component.type === 'rowStack' || targetItem.component.type === 'colStack') {
        return 'stack' as ParentType;
      }
      return 'grid' as ParentType;
    })();

    // グリッドレイアウト用のデフォルトメタデータを定義
    const defaultGridLayoutMetadata = { 
      displayName: 'Grid Layout',
      icon: 'grid_view',
      defaultWidth: 2, 
      defaultHeight: 2, 
      defaultProps: {
        children: [] as GridItem[],
        widthPercentage: 100,
        heightPercentage: 100,
        horizontalAlign: 'center',
        verticalAlign: 'center'
      } 
    } as ComponentMetadata<GridLayoutProps>;

    // コンポーネントのメタデータを取得
    const metadata = componentType === 'gridLayout' 
      ? defaultGridLayoutMetadata
      : componentRegistry.getMetadata(componentType);

    if (!metadata) {
      console.error(`${componentType} component metadata not found`);
      return false;
    }

    // 位置を決定
    const position = (() => {
      // RowStackの子要素として追加する場合
      if (isAddingToParent) {
        const targetItem = findItemInTree(items, editTargetId);
        if (targetItem && 'children' in targetItem.component.props) {
          const currentChildren = targetItem.component.props.children;
          // RowStackの場合は横方向、ColStackの場合は縦方向に配置
          if (targetItem.component.type === 'rowStack') {
            return { x: currentChildren.length, y: 0, canPlace: true };
          } else if (targetItem.component.type === 'colStack') {
            return { x: 0, y: currentChildren.length, canPlace: true };
          }
        }
      }

      // グリッドレイアウトの場合
      const findResult = findAvailablePosition(
        metadata.defaultWidth,
        metadata.defaultHeight,
        targetItems
      );

      // グリッドレイアウトの場合、1x1でも配置を試みる
      if (!findResult.canPlace && componentType === 'gridLayout') {
        return findAvailablePosition(1, 1, targetItems);
      }

      return findResult;
    })();

    if (!position.canPlace) {
      alert('利用可能なスペースがありません。');
      return false;
    }

    // 新しいアイテムの作成
    const itemId = generateId(idPrefix);
    let newItem: GridItem;

    if (isLayoutComponent(componentType)) {
      newItem = {
        id: itemId,
        layout: {
          i: `layout_${itemId}`,
          x: position.x,
          y: position.y,
          w: metadata.defaultWidth,
          h: metadata.defaultHeight
        },
        component: {
          type: componentType,
          props: {
            children: [],
            widthPercentage: 100,
            heightPercentage: 100,
            horizontalAlign: 'center',
            verticalAlign: 'center'
          }
        }
      } as GridItem;
    } else {
      // 基本的なコンポーネント作成
      newItem = createNewComponent(componentType, itemId, position, metadata);
      
      // Stack内のコンポーネントの場合、初期設定を追加
      if (parentType === 'stack') {
        newItem.component.props.width = 'auto';
        newItem.component.props.height = 'auto';
      }
    }

    // アイテムを追加（編集対象があれば子要素として、なければルートレベルに）
    setItems(prevItems => {
      console.log('Adding new item:', newItem, 'to parent:', editTargetId);
      return !editTargetId
        ? [...prevItems, newItem]
        : addChildToTree(prevItems, editTargetId, newItem);
    });

    return true;
  };

  /**
   * 新しいグリッドレイアウトコンポーネントを追加する
   */
  const handleAddGridLayout = () => handleAddComponent('gridLayout', 'grid');

  /**
   * 新しいボタンコンポーネントを追加する
   */
  const handleAddButton = () => handleAddComponent('button', 'btn');

  /**
   * 新しいテキストフィールドコンポーネントを追加する
   */
  const handleAddTextField = () => handleAddComponent('textField', 'txt');

  /**
   * 新しいラジオグループコンポーネントを追加する
   */
  const handleAddRadioGroup = () => handleAddComponent('radioGroup', 'radio');

  /**
   * 現在のレイアウトをJSONファイルとしてエクスポートする
   */
  const handleExport = () => {
    try {
      // バージョン情報とアイテムデータを含むエクスポートデータを作成
      const exportData = {
        version: '1.0',
        items,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // ダウンロードリンクを作成して自動クリック
      const a = document.createElement('a');
      a.href = url;
      a.download = 'layout-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  /**
   * JSONファイルからレイアウトをインポートする
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          // バージョンチェック
          if (importData.version !== '1.0') {
            throw new Error('Unsupported version');
          }

          // データ形式チェック
          if (!Array.isArray(importData.items)) {
            throw new Error('Invalid layout data');
          }

          // インポートデータを適用し、選択状態をリセット
          setItems(importData.items);
          setSelectedItemId(null);
          setEditTargetId(null);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    } finally {
      // ファイル入力をリセット（同じファイルを再度選択可能にする）
      setFileInputKey(prev => prev + 1);
    }
  };

  /**
   * 選択中のアイテムを削除する
   */
  const handleRemoveItem = () => {
    if (!selectedItemId) return;
    
    // アイテムを削除し、選択状態をリセット
    setItems(prev => removeFromTree(prev, selectedItemId));
    setSelectedItemId(null);
    if (editTargetId === selectedItemId) {
      setEditTargetId(null);
    }
  };

  /**
   * グリッドアイテムを選択する
   */
  const handleSelect = (id: string): void => {
    const selectedItem = findItemInTree(items, id);
    if (!selectedItem) return;

    // 編集対象選択モードの場合
    if (selectingMode) {
      if (isLayoutComponent(selectedItem.component.type)) {
        setSelectedItemId(id);
        setEditTargetId(id);
        setSelectingMode(false);
        console.log('編集対象に設定:', id, selectedItem.component.type);
      }
      return;
    }

    // 編集対象が設定されている場合
    if (editTargetId) {
      const editTargetItem = findItemInTree(items, editTargetId);
      if (editTargetItem) {
        // レイアウト系コンポーネントの場合は、その子孫要素の選択を許可
        if (isLayoutComponent(editTargetItem.component.type)) {
          if (isItemInEditTarget(items, id, editTargetId)) {
            setSelectedItemId(id);
            console.log('編集対象内のアイテムを選択:', id);
          }
        }
      }
      return;
    }

    // 通常の選択
    console.log('通常選択:', id);
    setSelectedItemId(id);
  };

  /**
   * 編集対象の選択モードを切り替える
   */
  const toggleEditTarget = () => {
    if (editTargetId) {
      // 編集モードを終了
      setEditTargetId(null);
      setSelectingMode(false);
    } else if (selectingMode) {
      // 選択モードをキャンセル
      setSelectingMode(false);
    } else {
      // 選択モードを開始
      setSelectingMode(true);
    }
  };

  /**
   * アイテムの親要素の種類（grid/stack）を判定する
   */
  const getParentType = (item: GridItem): ParentType => {
    const parent = findParentItem(items, item.id);
    if (!parent) return 'grid';
    return ['rowStack', 'colStack'].includes(parent.component.type) ? 'stack' : 'grid';
  };

  /**
   * ドラッグ＆ドロップとリサイズの可否を判定する
   */
  const isDraggableAndResizable = (): boolean => {
    if (selectingMode) return false;
    return !editTargetId || !isNestedItemSelected(editTargetId, items);
  };

  /**
   * プロパティの更新をハンドルする
   */
  const handleUpdateProps = (id: string, newProps: any) => {
    if (selectedItemId) {
      const selectedItem = findItemInTree(items, selectedItemId);
      if (selectedItem) {
        setItems(prevItems => updateItemProps(prevItems, id, newProps));
      }
    }
  };

  return {
    // 状態
    items,
    selectedItemId,
    editTargetId,
    selectingMode,
    fileInputKey,
    fileInputRef,
    
    // アクション
    setSelectedItemId,
    
    // メソッド
    handleLayoutChange,
    handleAddComponent,
    handleAddGridLayout,
    handleAddButton,
    handleAddTextField,
    handleAddRadioGroup,
    handleExport,
    handleImport,
    handleRemoveItem,
    handleSelect,
    toggleEditTarget,
    getParentType,
    isDraggableAndResizable,
    handleUpdateProps,
    findItemInTree,
    isLayoutComponent,
    hasChildren,
    isItemInEditTarget,
  };
};