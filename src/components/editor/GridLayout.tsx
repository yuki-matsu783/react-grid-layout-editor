import React, { useState } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import '../../styles/grid.css';
import { Box, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { createComponentInstance, getComponentDefaultSize } from '../../utils/componentRegistry';
import type { LayoutItem } from '../../types';

const ReactGridLayout = WidthProvider(RGL);

// 初期レイアウト設定
const initialLayoutItems: LayoutItem[] = [
  {
    id: 'TextField-1',
    x: 3,
    y: 2,
    w: 4,
    h: 1,
    component: {
      type: 'TextField',
      props: {
        variant: 'outlined' as const,
        fullWidth: true,
        placeholder: 'サンプルテキスト',
        size: 'medium' as const,
      },
      styles: {
        custom: {},
        mui: {},
      },
    },
  },
  {
    id: 'Button-1',
    x: 7,
    y: 2,
    w: 2,
    h: 1,
    component: {
      type: 'Button',
      props: {
        variant: 'contained' as const,
        color: 'primary' as const,
        size: 'medium' as const,
      },
      styles: {
        custom: {},
        mui: {},
      },
    },
  },
];

const GridLayout: React.FC = () => {
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(initialLayoutItems);
  const [counter, setCounter] = useState(2); // 初期レイアウトが2つあるため2から開始
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const handleComponentClick = (componentType: string) => {
    const id = `${componentType}-${counter}`;
    const defaultSize = getComponentDefaultSize(componentType);
    const component = createComponentInstance(componentType);

    const newLayoutItem: LayoutItem = {
      id,
      x: (layoutItems.length * 2) % 12, // 横幅12グリッドを超えないように
      y: Infinity, // 最下部に配置
      w: defaultSize.w,
      h: defaultSize.h,
      component,
    };

    setLayoutItems([...layoutItems, newLayoutItem]);
    setCounter(counter + 1);
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
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        bgcolor: 'background.default',
        p: 2,
        overflow: 'auto',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => handleComponentClick('TextField')}
        >
          テキストフィールドを追加
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleComponentClick('Button')}
        >
          ボタンを追加
        </Button>
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
  );
};

export default GridLayout;
