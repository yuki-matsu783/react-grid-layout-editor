import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout } from '../../../types';
import type { SxProps, Theme } from '@mui/material';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * グリッドレイアウトのプロパティ定義
 */
interface GridLayoutProps {
  /** カラム数の設定 */
  cols: { [key: string]: number };
  /** グリッドアイテム間のマージン */
  margin: [number, number];
  /** デフォルトの行の高さ */
  defaultRowHeight: number;
  /** 子要素 */
  children: React.ReactNode;
  /** ドラッグ可能かどうか */
  isDraggable?: boolean;
  /** サイズ変更可能かどうか */
  isResizable?: boolean;
  /** レイアウト変更時のコールバック */
  onLayoutChange?: (layout: Layout[]) => void;
  /** コンテナのID */
  itemId?: string;
  /** スタイルプロパティ */
  sx?: SxProps<Theme>;
}

/**
 * 自身の高さを測定し、動的なrowHeight（高さ/12）を提供するグリッドコンテナ
 * 子要素のグリッドレイアウトを管理し、サイズ変更に応じて自動的に調整する
 * @param props グリッドレイアウトのプロパティ
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
  // コンテナの高さを状態として保持
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 高さの測定と更新
   * コンテナの実際の高さを取得し、状態を更新する
   */
  const updateHeight = () => {
    const el = containerRef.current;
    if (el && el.clientHeight !== height) {
      setHeight(el.clientHeight);
    }
  };

  // ResizeObserverの設定
  useEffect(() => {
    // コンテナのサイズ変更を監視
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      // クリーンアップ時に監視を解除
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  /**
   * レイアウト変更ハンドラー
   * 子要素のレイアウトが変更された際にコールバックを呼び出す
   * @param layout - 更新されたレイアウト情報の配列
   */
  const handleNestedLayoutChange = (layout: Layout[]) => {
    if (onLayoutChange) {
      // レイアウトIDの形式を統一（layout_プレフィックスの付加）
      const updatedLayout = layout.map(item => ({
        ...item,
        i: item.i.startsWith('layout_') ? item.i : `layout_${item.i}`
      }));
      onLayoutChange(updatedLayout);
    }
  };

  // コンテナの高さに基づいて行の高さを計算
  const rowHeight = height > 0 ? height / 12 : defaultRowHeight;
  // 固定の列数設定
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