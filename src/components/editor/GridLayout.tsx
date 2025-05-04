import React, { useState, useRef } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import '../../styles/grid.css';
import { Box, Button, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { createBoxInstance, getComponentDefaultSize } from '../../utils/componentRegistry';
import type { LayoutItem, BoxComponent } from '../../types';
import BoxSettingsPanel from './BoxSettingsPanel';

const ReactGridLayout = WidthProvider(RGL);

// 初期レイアウト設定
const initialLayoutItems: LayoutItem[] = [];

const GridLayout: React.FC = () => {
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(initialLayoutItems);
  const [counter, setCounter] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBox = selectedId 
    ? layoutItems.find(item => item.id === selectedId)?.boxSettings
    : null;

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    const updatedLayout = layoutItems.map(item => {
      const layoutItem = layout.find(l => l.i === item.id);
      if (!layoutItem) return item;

      return {
        ...item,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
      };
    });

    setLayoutItems(updatedLayout);
  };

  const findAvailablePosition = (w: number, h: number) => {
    const grid = Array(12).fill(null).map(() => Array(20).fill(false));
    
    // 既存のボックスで占有されているグリッドをマーク
    layoutItems.forEach(item => {
      for (let i = item.x; i < item.x + item.w; i++) {
        for (let j = item.y; j < item.y + item.h; j++) {
          if (i < 12 && j < 20) {
            grid[i][j] = true;
          }
        }
      }
    });

    // 利用可能な位置を探す
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x <= 12 - w; x++) {
        let canPlace = true;
        
        // 指定のサイズが配置可能かチェック
        for (let i = x; i < x + w && canPlace; i++) {
          for (let j = y; j < y + h && canPlace; j++) {
            if (grid[i][j]) {
              canPlace = false;
            }
          }
        }

        if (canPlace) {
          return { x, y };
        }
      }
    }

    // デフォルトポジション（最下部）
    return { x: 0, y: layoutItems.length > 0 ? Math.max(...layoutItems.map(item => item.y + item.h)) : 0 };
  };

  const handleAddBox = () => {
    const id = `Box-${counter}`;
    const defaultSize = getComponentDefaultSize('Box');
    const boxSettings = createBoxInstance(id);
    const position = findAvailablePosition(defaultSize.w, defaultSize.h);

    const newLayoutItem: LayoutItem = {
      id,
      ...position,
      w: defaultSize.w,
      h: defaultSize.h,
      isBox: true,
      boxSettings,
    };

    setLayoutItems([...layoutItems, newLayoutItem]);
    setCounter(counter + 1);
  };

  const handleUpdateBoxSettings = (updatedSettings: BoxComponent) => {
    setLayoutItems(layoutItems.map(item => 
      item.id === selectedId
        ? { ...item, boxSettings: updatedSettings }
        : item
    ));
  };

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        layouts: layoutItems,
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
          
          // バージョンチェック
          if (importData.version !== '1.0') {
            throw new Error('Unsupported version');
          }

          // レイアウトデータの検証
          if (!Array.isArray(importData.layouts)) {
            throw new Error('Invalid layout data');
          }

          setLayoutItems(importData.layouts);
          setCounter(Math.max(...importData.layouts.map((item: LayoutItem) => 
            parseInt(item.id.split('-')[1] || '0')
          )) + 1);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    } finally {
      // ファイル入力をリセット
      setFileInputKey(k => k + 1);
    }
  };

  const handleRemoveItem = () => {
    if (selectedId) {
      setLayoutItems(layoutItems.filter(item => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const renderComponent = (item: LayoutItem) => {
    const isSelected = item.id === selectedId;

    if (item.isBox && item.boxSettings) {
      return (
        <Box
          key={item.id}
          onClick={() => handleSelectItem(item.id)}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: item.boxSettings.layout.flexDirection,
            justifyContent: item.boxSettings.layout.justifyContent,
            alignItems: item.boxSettings.layout.alignItems,
            position: 'relative',
            bgcolor: item.boxSettings.styles.background,
            border: item.boxSettings.styles.border,
            borderRadius: item.boxSettings.styles.borderRadius,
            padding: item.boxSettings.styles.padding,
            cursor: 'pointer',
            outline: theme => 
              isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              px: 1,
              py: 0.5,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {item.boxSettings.name}
            </Typography>
          </Box>
        </Box>
      );
    }

    if (item.component) {
      return (
        <Box
          key={item.id}
          onClick={() => handleSelectItem(item.id)}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            border: theme => 
              isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
            cursor: 'pointer',
          }}
        >
          <Box sx={{ width: '100%', pointerEvents: 'none' }}>
            {item.component.type === 'TextField' && (
              <TextField
                variant={item.component.props.variant as any}
                fullWidth={item.component.props.fullWidth}
                placeholder={item.component.props.placeholder}
                size={item.component.props.size as any}
                sx={{ pointerEvents: 'auto' }}
                inputProps={{ onClick: (e) => e.stopPropagation() }}
              />
            )}
            {item.component.type === 'Button' && (
              <Button
                variant={item.component.props.variant as any}
                color={item.component.props.color as any}
                size={item.component.props.size as any}
                sx={{ pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                Button
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        bgcolor: 'background.default',
        p: 2,
        overflow: 'auto',
        display: 'flex',
      }}
    >
      <Box sx={{ flex: 1, mr: selectedBox ? '300px' : 0 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleAddBox}
              startIcon={<AddBoxIcon />}
            >
              Boxを追加
            </Button>
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
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveItem}
            disabled={!selectedId}
            startIcon={<DeleteIcon />}
          >
            選択したコンポーネントを削除
          </Button>
        </Box>
        <Box
          sx={{
            border: '1px dashed #ccc',
            borderRadius: 1,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            p: 1,
          }}
        >
          <ReactGridLayout
            className="layout"
            layout={layoutItems.map(({ id, x, y, w, h }) => ({ i: id, x, y, w, h }))}
            cols={12}
            rowHeight={60}
            containerPadding={[10, 10]}
            margin={[10, 10]}
            onLayoutChange={handleLayoutChange}
            useCSSTransforms
            preventCollision={false}
            compactType={null}
          >
            {layoutItems.map(renderComponent)}
          </ReactGridLayout>
        </Box>
      </Box>
      
      {selectedBox && (
        <BoxSettingsPanel
          selectedBox={selectedBox}
          onUpdate={handleUpdateBoxSettings}
        />
      )}
    </Box>
  );
};

export default GridLayout;
