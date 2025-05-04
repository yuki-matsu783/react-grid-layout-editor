import React from 'react';
import { useAtom } from 'jotai';
import RGL, { WidthProvider } from 'react-grid-layout';
import '../../styles/grid.css';
import { Box, Paper } from '@mui/material';
import { layoutAtom, selectionAtom, currentBreakpointLayoutAtom, gridSettingsAtom } from '../../store/atoms';
import { createComponentInstance, getComponentDefaultSize } from '../../utils/componentRegistry';
import type { LayoutItem } from '../../types';

const ReactGridLayout = WidthProvider(RGL);

const GridLayout: React.FC = () => {
  const [pageLayout, setPageLayout] = useAtom(layoutAtom);
  const [selection, setSelection] = useAtom(selectionAtom);
  const [currentLayout] = useAtom(currentBreakpointLayoutAtom);
  const [gridSettings] = useAtom(gridSettingsAtom);

  const handleDrop = (layout: RGL.Layout[], layoutItem: RGL.Layout, event: DragEvent) => {
    const componentType = event.dataTransfer?.getData('component');
    if (!componentType) return;

    const id = `${componentType}-${Date.now()}`;
    const defaultSize = getComponentDefaultSize(componentType);
    const component = createComponentInstance(componentType, id);

    const newLayoutItem: LayoutItem = {
      id,
      x: layoutItem.x,
      y: layoutItem.y,
      w: defaultSize.w,
      h: defaultSize.h,
      component,
    };

    const updatedLayouts = {
      ...pageLayout.settings.responsive.layouts,
      [selection.breakpoint]: [...currentLayout, newLayoutItem],
    };

    setPageLayout({
      ...pageLayout,
      settings: {
        ...pageLayout.settings,
        responsive: {
          ...pageLayout.settings.responsive,
          layouts: updatedLayouts,
        },
      },
    });
  };

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    const updatedLayout = currentLayout.map(item => {
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

    const updatedLayouts = {
      ...pageLayout.settings.responsive.layouts,
      [selection.breakpoint]: updatedLayout,
    };

    setPageLayout({
      ...pageLayout,
      settings: {
        ...pageLayout.settings,
        responsive: {
          ...pageLayout.settings.responsive,
          layouts: updatedLayouts,
        },
      },
    });
  };

  const handleComponentClick = (id: string) => {
    setSelection({
      ...selection,
      componentId: id,
    });
  };

  const renderComponent = (item: LayoutItem) => {
    return (
      <Paper
        key={item.id}
        elevation={selection.componentId === item.id ? 3 : 1}
        onClick={() => handleComponentClick(item.id)}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: theme => 
            selection.componentId === item.id 
              ? `2px solid ${theme.palette.primary.main}`
              : 'none',
        }}
      >
        {item.component.type}
      </Paper>
    );
  };

  const gridLayoutProps = {
    className: 'layout',
    layout: currentLayout.map(({ id, x, y, w, h }) => ({ i: id, x, y, w, h })),
    cols: gridSettings.columns,
    rowHeight: gridSettings.rowHeight,
    containerPadding: [gridSettings.padding, gridSettings.padding] as [number, number],
    margin: [gridSettings.padding, gridSettings.padding] as [number, number],
    onLayoutChange: handleLayoutChange,
    onDrop: handleDrop,
    isDroppable: true,
    useCSSTransforms: true,
    preventCollision: false,
    compactType: 'vertical' as const,
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
      <ReactGridLayout {...gridLayoutProps}>
        {currentLayout.map(renderComponent)}
      </ReactGridLayout>
    </Box>
  );
};

export default GridLayout;
