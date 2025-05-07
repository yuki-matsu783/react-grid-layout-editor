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
  ButtonProps,
  TextFieldProps,
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

function generateId(prefix = "grid"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

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
 * 複数の入れ子になったグリッドアイテムの配置、サイズ変更、ドラッグ＆ドロップを制御する
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

  // 初期化
  useEffect(() => {
    const rootId = generateId();
    setItems(initializeGridItems(rootId));
  }, [setItems]);

  // カスタムフックを使用
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
  } = useTreeOperations();

  const generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  const extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  const updateItemLayout = (itemId: string, newLayout: Layout) => {
    setItems(prevItems => updateLayoutInTree(prevItems, itemId, newLayout));
  };

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

  const renderElement = (item: GridItem): React.ReactNode => {
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;

    // レイアウトロジック
    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage } = item.component.props;
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    // 共通のスタイルとプロパティを持つBoxコンポーネント
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

    // コンポーネントタイプに応じたコンテンツのレンダリング
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
            alignItems: 'inherit',
            justifyContent: 'inherit',
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
      {/* コンポーネント追加パネル（左側） */}
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

      <Box sx={{ flex: 1, overflow: 'auto' }}>
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

      {/* コンポーネント設定パネル（右側） */}
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
