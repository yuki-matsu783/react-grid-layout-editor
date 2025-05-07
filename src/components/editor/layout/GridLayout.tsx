import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout } from '../../../types';
import type { SxProps, Theme } from '@mui/material';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface GridLayoutProps {
  cols: { [key: string]: number };  // カラム数の設定
  margin: [number, number];         // グリッドアイテム間のマージン
  defaultRowHeight: number;         // デフォルトの行の高さ
  children: React.ReactNode;        // 子要素
  isDraggable?: boolean;           // ドラッグ可能かどうか
  isResizable?: boolean;           // サイズ変更可能かどうか
  onLayoutChange?: (layout: Layout[]) => void;  // レイアウト変更時のコールバック
  itemId?: string;                 // コンテナのID
  sx?: SxProps<Theme>;             // スタイルプロパティ
}

/**
 * 自身の高さを測定し、動的なrowHeight（高さ/12）を提供するグリッドコンテナ
 * 子要素のグリッドレイアウトを管理し、サイズ変更に応じて自動的に調整する
 */
const GridLayout: React.FC<GridLayoutProps> = ({
  defaultRowHeight,
  children,
  cols,
  margin,
  isDraggable,
  isResizable,
  onLayoutChange,
  sx,
  ...rest
}) => {
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 高さの測定と更新
  const updateHeight = () => {
    const el = containerRef.current;
    if (el && el.clientHeight !== height) {
      setHeight(el.clientHeight);
    }
  };

  // ResizeObserverの設定
  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // レイアウト変更ハンドラー
  const handleNestedLayoutChange = (layout: Layout[]) => {
    if (onLayoutChange) {
      const updatedLayout = layout.map(item => ({
        ...item,
        i: item.i.startsWith('layout_') ? item.i : `layout_${item.i}`
      }));
      onLayoutChange(updatedLayout);
    }
  };

  const rowHeight = height > 0 ? height / 12 : defaultRowHeight;
  const fixedCols = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 };

  return (
    <Box 
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        ...(sx || {})
      }}
    >
      <ResponsiveReactGridLayout
        {...rest}
        cols={fixedCols}
        rowHeight={rowHeight}
        onLayoutChange={handleNestedLayoutChange}
        compactType={null}
        preventCollision
        margin={margin}
        resizeHandles={isResizable ? ['se'] : []}
      >
        {children}
      </ResponsiveReactGridLayout>
    </Box>
  );
};

export default GridLayout;