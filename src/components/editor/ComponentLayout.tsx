import React, { useState, useRef } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import '../../styles/grid.css';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Radio,
  Switch,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { createComponentInstance, getComponentDefaultSize } from '../../utils/componentRegistry';
import type { LayoutItem, ComponentDefinition } from '../../types';

const ReactGridLayout = WidthProvider(RGL);

// 初期レイアウト設定
const initialLayoutItems: LayoutItem[] = [];

// 利用可能なコンポーネント一覧
const availableComponents = [
  {
    type: 'GridContainer',
    label: 'グリッドコンテナ',
    preview: <Box sx={{ 
      width: '100%',
      height: 40,
      bgcolor: '#ffffff',
      border: '1px dashed #1976d2',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="caption">Grid Container</Typography>
    </Box>
  },
  {
    type: 'TextField',
    label: 'テキストフィールド',
    preview: <TextField size="small" placeholder="プレビュー" />
  },
  {
    type: 'Button',
    label: 'ボタン',
    preview: <Button variant="contained" size="small">プレビュー</Button>
  },
  {
    type: 'Select',
    label: 'セレクトボックス',
    preview: <FormControl size="small" fullWidth>
      <Select value="option1">
        <MenuItem value="option1">オプション1</MenuItem>
      </Select>
    </FormControl>
  },
  {
    type: 'Checkbox',
    label: 'チェックボックス',
    preview: <FormControlLabel control={<Checkbox size="small" />} label="チェックボックス" />
  },
  {
    type: 'Radio',
    label: 'ラジオボタン',
    preview: <FormControlLabel control={<Radio size="small" />} label="ラジオボタン" />
  },
  {
    type: 'Switch',
    label: 'スイッチ',
    preview: <FormControlLabel control={<Switch size="small" />} label="スイッチ" />
  }
];

const ComponentLayout: React.FC = () => {
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(initialLayoutItems);
  const [counter, setCounter] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedComponent = selectedId 
    ? layoutItems.find(item => item.id === selectedId)?.component 
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
    
    layoutItems.forEach(item => {
      for (let i = item.x; i < item.x + item.w; i++) {
        for (let j = item.y; j < item.y + item.h; j++) {
          if (i < 12 && j < 20) {
            grid[i][j] = true;
          }
        }
      }
    });

    for (let y = 0; y < 20; y++) {
      for (let x = 0; x <= 12 - w; x++) {
        let canPlace = true;
        
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

    return { x: 0, y: layoutItems.length > 0 ? Math.max(...layoutItems.map(item => item.y + item.h)) : 0 };
  };

  const handleAddComponent = (type: string) => {
    const id = `${type}-${counter}`;
    const defaultSize = getComponentDefaultSize(type);
    const component = createComponentInstance(type);
    const position = findAvailablePosition(defaultSize.w, defaultSize.h);

    const newLayoutItem: LayoutItem = {
      id,
      ...position,
      w: defaultSize.w,
      h: defaultSize.h,
      component,
    };

    // 選択中のコンポーネントがGridContainerの場合は、その中に追加
    if (selectedId) {
      const parentComponent = layoutItems.find(item => item.id === selectedId)?.component;
      if (parentComponent?.type === 'GridContainer') {
        setLayoutItems(layoutItems.map(item => {
          if (item.id === selectedId && item.component) {
            return {
              ...item,
              component: {
                ...item.component,
                props: {
                  ...item.component.props,
                  children: [...(item.component.props.children || []), newLayoutItem]
                }
              }
            };
          }
          return item;
        }));
        setCounter(counter + 1);
        return;
      }
    }

    // そうでない場合は、ルートレベルに追加
    setLayoutItems([...layoutItems, newLayoutItem]);
    setCounter(counter + 1);
  };

  const handleUpdateComponentSettings = (updatedSettings: ComponentDefinition) => {
    setLayoutItems(layoutItems.map(item => 
      item.id === selectedId
        ? { ...item, component: updatedSettings }
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
      a.download = 'component-layout-export.json';
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
    if (!item.component) return null;

    const isSelected = item.id === selectedId;

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
              fullWidth={item.component.props.fullWidth}
              sx={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {item.component.props.label || 'Button'}
            </Button>
          )}
          {item.component.type === 'Select' && (
            <FormControl fullWidth>
              <InputLabel>{item.component.props.label}</InputLabel>
              <Select
                variant={item.component.props.variant as any}
                size={item.component.props.size as any}
                label={item.component.props.label}
                value={(item.component.props.options?.[0]?.value) || ''}
                sx={{ pointerEvents: 'auto' }}
              >
                {item.component.props.options?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {item.component.type === 'Checkbox' && (
            <FormControlLabel
              control={
                <Checkbox
                  color={item.component.props.color as any}
                  size={item.component.props.size as any}
                  sx={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={item.component.props.label}
            />
          )}
          {item.component.type === 'Radio' && (
            <FormControlLabel
              control={
                <Radio
                  color={item.component.props.color as any}
                  size={item.component.props.size as any}
                  sx={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={item.component.props.label}
            />
          )}
          {item.component.type === 'Switch' && (
            <FormControlLabel
              control={
                <Switch
                  color={item.component.props.color as any}
                  size={item.component.props.size as any}
                  sx={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={item.component.props.label}
            />
          )}
          {item.component.type === 'GridContainer' && (
            <Box sx={{
              width: '100%',
              height: '100%',
              bgcolor: item.component.props.background || '#ffffff',
              border: item.component.props.border || '1px dashed #1976d2',
              borderRadius: item.component.props.borderRadius || '4px',
              p: 0,
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '.react-grid-layout': {
                position: 'absolute',
                inset: 0,
                padding: item.component.props.padding || 16,
                '&.layout': {
                  height: '100%'
                }
              }
            }}>
              <Box sx={{ 
                flex: 1, 
                position: 'relative', 
                minHeight: '200px',
                '& .react-grid-item': {
                  position: 'absolute',
                  transition: 'transform 200ms ease',
                  width: 'auto !important',
                  '&.react-draggable-dragging': {
                    transition: 'none',
                    zIndex: 3
                  },
                  '&.resizing': {
                    zIndex: 2,
                    '& > div': {
                      width: '100%',
                      height: '100%'
                    }
                  },
                  '& > div': {
                    width: '100%',
                    height: '100%'
                  }
                }
              }}>
                <ReactGridLayout
                  className="layout"
                  layout={(item.component?.props.children || []).map(child => ({
                    i: child.id,
                    x: child.x,
                    y: child.y,
                    w: child.w,
                    h: child.h,
                  }))}
                  cols={12}
                  rowHeight={30}
                  containerPadding={[10, 10]}
                  margin={[10, 10]}
                isDraggable
                isResizable
                onLayoutChange={(layout) => {
                  if (item.component) {
                    const updatedChildren = (item.component.props.children || []).map(child => {
                      const layoutItem = layout.find(l => l.i === child.id);
                      if (!layoutItem) return child;
                      return {
                        ...child,
                        x: layoutItem.x,
                        y: layoutItem.y,
                        w: layoutItem.w,
                        h: layoutItem.h,
                      };
                    });
                    handleUpdateComponentSettings({
                      ...item.component,
                      type: item.component.type,
                      props: {
                        ...item.component.props,
                        children: updatedChildren
                      }
                    });
                  }
                }}
                useCSSTransforms
                preventCollision={false}
                compactType={null}
                isDroppable={true}
                droppingItem={{ i: 'new', w: 2, h: 2 }}
              >
                {(item.component?.props.children || []).map(child => renderComponent(child))}
                </ReactGridLayout>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
      }}
    >
      {/* コンポーネントパレット */}
      <Paper
        sx={{
          width: 250,
          height: '100vh',
          borderRadius: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          コンポーネント
        </Typography>
        <Box sx={{ p: 2 }}>
          {availableComponents.map(comp => (
            <Paper
              key={comp.type}
              sx={{
                mb: 1,
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleAddComponent(comp.type)}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {comp.label}
              </Typography>
              {comp.preview}
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* メインエリア */}
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          bgcolor: 'background.default',
          p: 2,
          overflow: 'auto',
          mr: selectedComponent ? '300px' : 0,
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
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

      {/* コンポーネント設定パネル */}
      {selectedComponent && (
        <Paper
          sx={{
            width: 300,
            height: '100vh',
            position: 'fixed',
            right: 0,
            top: 0,
            borderRadius: 0,
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ p: 2 }}>
            {selectedComponent.type}の設定
          </Typography>
          <Box sx={{ p: 2 }}>
            {selectedComponent.type === 'TextField' && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>バリアント</InputLabel>
                  <Select
                    value={selectedComponent.props.variant || 'outlined'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, variant: e.target.value }
                    })}
                    label="バリアント"
                  >
                    <MenuItem value="outlined">outlined</MenuItem>
                    <MenuItem value="filled">filled</MenuItem>
                    <MenuItem value="standard">standard</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="プレースホルダー"
                    value={selectedComponent.props.placeholder || ''}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, placeholder: e.target.value }
                    })}
                  />
                </FormControl>
              </>
            )}
            {selectedComponent.type === 'Button' && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>バリアント</InputLabel>
                  <Select
                    value={selectedComponent.props.variant || 'contained'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, variant: e.target.value }
                    })}
                    label="バリアント"
                  >
                    <MenuItem value="contained">contained</MenuItem>
                    <MenuItem value="outlined">outlined</MenuItem>
                    <MenuItem value="text">text</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>色</InputLabel>
                  <Select
                    value={selectedComponent.props.color || 'primary'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, color: e.target.value }
                    })}
                    label="色"
                  >
                    <MenuItem value="primary">primary</MenuItem>
                    <MenuItem value="secondary">secondary</MenuItem>
                    <MenuItem value="success">success</MenuItem>
                    <MenuItem value="error">error</MenuItem>
                    <MenuItem value="info">info</MenuItem>
                    <MenuItem value="warning">warning</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="ラベル"
                    value={selectedComponent.props.label || 'Button'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, label: e.target.value }
                    })}
                  />
                </FormControl>
              </>
            )}
            {selectedComponent.type === 'Select' && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>バリアント</InputLabel>
                  <Select
                    value={selectedComponent.props.variant || 'outlined'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, variant: e.target.value }
                    })}
                    label="バリアント"
                  >
                    <MenuItem value="outlined">outlined</MenuItem>
                    <MenuItem value="filled">filled</MenuItem>
                    <MenuItem value="standard">standard</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="ラベル"
                    value={selectedComponent.props.label || ''}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, label: e.target.value }
                    })}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="オプション（JSON形式）"
                    multiline
                    rows={4}
                    value={JSON.stringify(selectedComponent.props.options || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const options = JSON.parse(e.target.value);
                        handleUpdateComponentSettings({
                          ...selectedComponent,
                          props: { ...selectedComponent.props, options }
                        });
                      } catch (error) {
                        // JSON解析エラーは無視
                      }
                    }}
                  />
                </FormControl>
              </>
            )}
            {(selectedComponent.type === 'Checkbox' || selectedComponent.type === 'Radio' || selectedComponent.type === 'Switch') && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>色</InputLabel>
                  <Select
                    value={selectedComponent.props.color || 'primary'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, color: e.target.value }
                    })}
                    label="色"
                  >
                    <MenuItem value="primary">primary</MenuItem>
                    <MenuItem value="secondary">secondary</MenuItem>
                    <MenuItem value="success">success</MenuItem>
                    <MenuItem value="error">error</MenuItem>
                    <MenuItem value="info">info</MenuItem>
                    <MenuItem value="warning">warning</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="ラベル"
                    value={selectedComponent.props.label || ''}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, label: e.target.value }
                    })}
                  />
                </FormControl>
              </>
            )}
            {selectedComponent.type === 'GridContainer' && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="背景色"
                    type="color"
                    value={selectedComponent.props.background || '#ffffff'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, background: e.target.value }
                    })}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="ボーダー"
                    value={selectedComponent.props.border || '1px solid #e0e0e0'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, border: e.target.value }
                    })}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="パディング"
                    type="number"
                    value={selectedComponent.props.padding || 2}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, padding: Number(e.target.value) }
                    })}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="角丸"
                    value={selectedComponent.props.borderRadius || '4px'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, borderRadius: e.target.value }
                    })}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Flexの方向</InputLabel>
                  <Select
                    value={selectedComponent.props.flexDirection || 'row'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, flexDirection: e.target.value as 'row' | 'column' }
                    })}
                    label="Flexの方向"
                  >
                    <MenuItem value="row">横方向</MenuItem>
                    <MenuItem value="column">縦方向</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>水平方向の配置</InputLabel>
                  <Select
                    value={selectedComponent.props.justifyContent || 'flex-start'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, justifyContent: e.target.value as 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' }
                    })}
                    label="水平方向の配置"
                  >
                    <MenuItem value="flex-start">左寄せ</MenuItem>
                    <MenuItem value="center">中央</MenuItem>
                    <MenuItem value="flex-end">右寄せ</MenuItem>
                    <MenuItem value="space-between">均等配置</MenuItem>
                    <MenuItem value="space-around">周囲均等配置</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>垂直方向の配置</InputLabel>
                  <Select
                    value={selectedComponent.props.alignItems || 'flex-start'}
                    onChange={(e) => handleUpdateComponentSettings({
                      ...selectedComponent,
                      props: { ...selectedComponent.props, alignItems: e.target.value as 'flex-start' | 'center' | 'flex-end' | 'stretch' }
                    })}
                    label="垂直方向の配置"
                  >
                    <MenuItem value="flex-start">上寄せ</MenuItem>
                    <MenuItem value="center">中央</MenuItem>
                    <MenuItem value="flex-end">下寄せ</MenuItem>
                    <MenuItem value="stretch">引き伸ばし</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {selectedComponent.type !== 'GridContainer' && selectedComponent.type !== 'Checkbox' && selectedComponent.type !== 'Radio' && selectedComponent.type !== 'Switch' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>サイズ</InputLabel>
                <Select
                  value={selectedComponent.props.size || 'medium'}
                  onChange={(e) => handleUpdateComponentSettings({
                    ...selectedComponent,
                    props: { ...selectedComponent.props, size: e.target.value }
                  })}
                  label="サイズ"
                >
                  <MenuItem value="small">small</MenuItem>
                  <MenuItem value="medium">medium</MenuItem>
                  <MenuItem value="large">large</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ComponentLayout;
