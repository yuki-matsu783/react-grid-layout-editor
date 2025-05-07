import React, { useRef, useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Box, Button, Typography } from '@mui/material';
import type { Theme } from '@mui/material';
import { useAtom } from 'jotai';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useLayoutOperations } from '../../hooks/useLayoutOperations';
import { useTreeOperations } from '../../hooks/useTreeOperations';
import type { 
  Layout, 
  GridItem, 
  ComponentConfig, 
  ComponentType,
  GridLayoutProps,
  ComponentEditorProps,
  ComponentAlignment
} from '../../types';
import { gridItemsAtom, selectedItemIdAtom, initializeGridItems } from '../../store/atoms';
import ComponentSettingsPanel from './ComponentSettingsPanel';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import componentRegistry, { ComponentMetadata } from '../../utils/componentRegistry';
import GridLayout from './layout/GridLayout';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
};

type ComponentMapType = typeof componentMap;

/**
 * ユニークなIDを生成する
 * @param prefix - IDのプレフィックス（デフォルト: "grid"）
 * @returns プレフィックスと乱数を組み合わせたユニークなID
 */
function generateId(prefix = "grid"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 新しいコンポーネントのGridItem設定を生成する
 * @param type - 作成するコンポーネントのタイプ
 * @param itemId - コンポーネントのID
 * @param position - グリッド上の配置位置
 * @param metadata - コンポーネントのメタデータ
 * @returns 新しいGridItem設定
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
    } as ComponentConfig
  };
}

/**
 * ネストされたグリッドレイアウトを管理するメインコンポーネント
 * - グリッドアイテムの配置、サイズ変更、ドラッグ＆ドロップを制御
 * - 最大5階層までのネストに対応
 * - コンポーネントの追加、削除、プロパティ編集機能を提供
 * - レイアウトのインポート/エクスポート機能を提供
 * 
 * @param cols - グリッドの列数
 * @param rowHeight - グリッドの行の高さ（ピクセル）
 * @param margin - グリッドアイテム間のマージン
 */
const ComponentEditor: React.FC<ComponentEditorProps> = ({ 
  cols, 
  rowHeight, 
  margin 
}) => {
  // グローバル状態
  const [items, setItems] = useAtom(gridItemsAtom);
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);

  // ローカル状態
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectingMode, setSelectingMode] = useState(false);

  // refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * レイアウトの初期化
   * コンポーネントマウント時に一度だけ実行され、ルートとなるグリッドアイテムを生成する
   */
  useEffect(() => {
    const rootId = generateId();
    setItems(initializeGridItems(rootId));
  }, [setItems]);

  // カスタムフックを使用
  /**
   * レイアウト操作に関する機能を提供するカスタムフック
   * @property findAvailablePosition - 指定されたサイズのコンポーネントを配置可能な位置を探す
   * @property updateLayoutInTree - ツリー内の特定アイテムのレイアウトを更新
   * @property addChildToTree - 指定された親アイテムの子として新しいアイテムを追加
   * @property removeFromTree - ツリーから特定のアイテムを削除
   * @property updateItemProps - 特定アイテムのプロパティを更新
   */
  const {
    findAvailablePosition,
    updateLayoutInTree,
    addChildToTree,
    removeFromTree,
    updateItemProps,
  } = useLayoutOperations();

  /**
   * ツリー構造の操作に関する機能を提供するカスタムフック
   * @property findItemInTree - ツリー内から特定のIDを持つアイテムを検索
   * @property calculateDepth - 指定されたアイテムのツリー内での深さを計算
   * @property isItemInEditTarget - アイテムが現在の編集対象の子孫かどうかを判定
   * @property isNestedItemSelected - 選択されたアイテムが編集対象の子孫かどうかを判定
   */
  const {
    findItemInTree,
    calculateDepth,
    isItemInEditTarget,
    isNestedItemSelected,
  } = useTreeOperations();

  /**
   * アイテムIDからレイアウトIDを生成する
   * @param itemId - 元となるアイテムID
   * @returns レイアウトID（'layout_'プレフィックス付き）
   */
  const generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  /**
   * レイアウトIDからアイテムIDを抽出する
   * @param layoutId - レイアウトID
   * @returns アイテムID（'layout_'プレフィックスを除去）
   */
  const extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  const updateItemLayout = (itemId: string, newLayout: Layout) => {
    setItems(prevItems => updateLayoutInTree(prevItems, itemId, newLayout));
  };

  /**
   * グリッドレイアウトの変更を処理する
   * アイテムの移動やサイズ変更時に呼び出され、新しいレイアウトを状態に反映する
   * @param layout - 更新されたレイアウト情報の配列
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
   * 新しいコンポーネントをグリッドに追加する
   * @param componentType - 追加するコンポーネントの種類
   * @param idPrefix - 生成するIDのプレフィックス
   * @returns 追加に成功した場合はtrue、失敗した場合はfalse
   */
  const handleAddComponent = (
    componentType: ComponentType,
    idPrefix: string
  ): boolean => {
    if (editTargetId) {
      const depth = calculateDepth(items, editTargetId);
      if (depth >= 4) {
        alert('これ以上階層を深くすることはできません（最大5階層まで）');
        return false;
      }
    }
    
    const targetItems = editTargetId 
      ? findItemInTree(items, editTargetId)?.component.type === 'gridLayout'
        ? (findItemInTree(items, editTargetId)?.component.props as GridLayoutProps).children || []
        : []
      : items;

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

    const metadata = componentType === 'gridLayout' 
      ? defaultGridLayoutMetadata
      : componentRegistry.getMetadata(componentType);

    if (!metadata) {
      console.error(`${componentType} component metadata not found`);
      return false;
    }

    const defaultPosition = findAvailablePosition(
      metadata.defaultWidth,
      metadata.defaultHeight,
      targetItems
    );

    const position = !defaultPosition.canPlace && componentType === 'gridLayout'
      ? findAvailablePosition(1, 1, targetItems)
      : defaultPosition;

    if (!position.canPlace) {
      alert('利用可能なスペースがありません。');
      return false;
    }

    const itemId = generateId(idPrefix);
    const newItem = componentType === 'gridLayout'
      ? {
          id: itemId,
          layout: {
            i: `layout_${itemId}`,
            x: position.x,
            y: position.y,
            w: defaultPosition.canPlace ? 2 : 1,
            h: defaultPosition.canPlace ? 2 : 1
          },
          component: {
            type: 'gridLayout' as const,
            props: {
              children: [],
              widthPercentage: 100,
              heightPercentage: 100,
              horizontalAlign: 'center' as ComponentAlignment,
              verticalAlign: 'center' as ComponentAlignment
            }
          }
        } as GridItem
      : createNewComponent(componentType, itemId, position, metadata);

    setItems(prevItems => !editTargetId
      ? [...prevItems, newItem]
      : addChildToTree(prevItems, editTargetId, newItem)
    );

    return true;
  };

  const handleAddGridLayout = () => handleAddComponent('gridLayout', 'grid');
  const handleAddButton = () => handleAddComponent('button', 'btn');
  const handleAddTextField = () => handleAddComponent('textField', 'txt');

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        items,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          if (importData.version !== '1.0') {
            throw new Error('Unsupported version');
          }

          if (!Array.isArray(importData.items)) {
            throw new Error('Invalid layout data');
          }

          setItems(importData.items);
          setSelectedItemId(null);
          setEditTargetId(null);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    } finally {
      setFileInputKey(prev => prev + 1);
    }
  };

  const handleRemoveItem = () => {
    if (!selectedItemId) return;
    setItems(prev => removeFromTree(prev, selectedItemId));
    setSelectedItemId(null);
    if (editTargetId === selectedItemId) {
      setEditTargetId(null);
    }
  };

  const handleSelect = (id: string): void => {
    const selectedItem = findItemInTree(items, id);
    if (!selectedItem) return;

    if (selectingMode) {
      if (selectedItem.component.type === 'gridLayout') {
        setSelectedItemId(id);
        setEditTargetId(id);
        setSelectingMode(false);
      }
      return;
    }

    if (editTargetId) {
      if (isItemInEditTarget(items, id, editTargetId)) {
        setSelectedItemId(id);
      }
      return;
    }

    setSelectedItemId(id);
  };

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
   * グリッドアイテムをレンダリングする
   * アイテムの種類に応じて適切なコンポーネントを生成し、スタイルと配置を設定する
   * @param item - レンダリングするグリッドアイテム
   * @returns レンダリングされたReactノード
   */
  const renderElement = (item: GridItem): React.ReactNode => {
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;

    // 水平・垂直方向の配置設定を計算
    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage } = item.component.props;
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    // グリッドアイテムの基本スタイルとイベントハンドラを設定
    const baseBoxProps = {
      key: item.layout.i,
      'data-grid': item.layout,
      className: "grid-item",
      sx: {
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: isEditTarget ? 'rgba(0, 0, 255, 0.05)' : '#ffffff',
        border: (theme: Theme) => isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems,
        justifyContent,
      },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleSelect(item.id); }
    };

    // コンポーネントの種類に応じてコンテンツをレンダリング（button, textField, gridLayout）
    let content: React.ReactNode = null;

    if (item.component.type in componentMap) {
      const ComponentRenderer = componentMap[item.component.type as keyof ComponentMapType];
      content = ComponentRenderer.render(item.component.props as any);
    } else if (item.component.type === 'gridLayout') {
      content = (
        <GridLayout
          isDraggable={isEditTarget && !selectingMode}
          isResizable={isEditTarget && !selectingMode}
          cols={cols}
          margin={[0, 0]}
          defaultRowHeight={rowHeight}
          onLayoutChange={handleLayoutChange}
          itemId={item.id}
        >
          {item.component.props.children.map(child => renderElement(child))}
        </GridLayout>
      );
    }

    if (!content) return null;

    return (
      <Box {...baseBoxProps}>
        <Box
          sx={{
            width: `${widthPercentage}%`,
            height: `${heightPercentage}%`,
            overflow: 'auto',
            display: 'flex',
            padding: `${item.component.props.paddingPercentage ?? 0}%`,
          }}
        >
          {content}
        </Box>
      </Box>
    );
  };

  const isDraggableAndResizable = (): boolean => {
    if (selectingMode) return false;
    return !editTargetId || !isNestedItemSelected(editTargetId, items);
  };

  const isDraggableResizable = isDraggableAndResizable();

  return (
    /* メインエディタコンテナ */
    <Box
      sx={{
        height: '100%',
        bgcolor: 'background.default',
        p: 2,
        overflow: 'hidden',
        display: 'flex',
        gap: 2,
      }}
      onClick={() => setSelectedItemId(null)}
    >
      {/* 左サイドパネル - コンポーネント追加ツールバー */}
      <Box 
        sx={{ width: 200, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" gutterBottom>コンポーネント追加</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleAddGridLayout}
            startIcon={<AddBoxIcon />}
          >
            領域を追加
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleAddButton}
            startIcon={<AddBoxIcon />}
          >
            ボタンを追加
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleAddTextField}
            startIcon={<AddBoxIcon />}
          >
            テキストフィールドを追加
          </Button>
        </Box>
      </Box>

      {/* メインコンテンツエリア - グリッドレイアウトエディタ */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* ツールバー - 操作ボタン群 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemoveItem}
              disabled={!selectedItemId}
              startIcon={<DeleteIcon />}
            >
              選択した領域を削除
            </Button>
            <Button
              variant="outlined"
              onClick={toggleEditTarget}
              startIcon={selectingMode || editTargetId ? <EditOffIcon /> : <EditIcon />}
            >
              {selectingMode ? "領域選択をキャンセル" : editTargetId ? "編集を終了" : "編集領域を選択"}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<FileUploadIcon />}
            >
              インポート
            </Button>
            <Button
              variant="outlined"
              onClick={handleExport}
              startIcon={<FileDownloadIcon />}
            >
              エクスポート
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              key={fileInputKey}
              onChange={handleImport}
            />
          </Box>
        </Box>
        <Box
          sx={{
            border: '1px dashed #ccc',
            borderRadius: 1,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            p: 1,
          }}
        >
          <ResponsiveReactGridLayout
            isDraggable={isDraggableResizable}
            isResizable={isDraggableResizable}
            cols={cols}
            rowHeight={rowHeight}
            margin={margin}
            onLayoutChange={handleLayoutChange}
            compactType={null}
            preventCollision
            resizeHandles={isDraggableResizable? ['se']:[]}
          >
            {items.map(item => renderElement(item))}
          </ResponsiveReactGridLayout>
        </Box>
      </Box>

      {/* 右サイドパネル - 選択したコンポーネントの設定パネル */}
      <Box 
        sx={{ 
          width: 200, 
          flexShrink: 0,
          height: '100%',
          borderLeft: '1px solid #e0e0e0',
          bgcolor: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ComponentSettingsPanel
          selectedItem={selectedItemId ? findItemInTree(items, selectedItemId) : null}
          onUpdate={(id, newProps) => {
            if (selectedItemId) {
              const selectedItem = findItemInTree(items, selectedItemId);
              if (selectedItem) {
                setItems(prevItems => updateItemProps(prevItems, id, newProps));
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ComponentEditor;
