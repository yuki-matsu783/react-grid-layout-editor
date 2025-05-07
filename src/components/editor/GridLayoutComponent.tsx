import React from 'react';
import type { 
  GridLayoutProps,
  BaseComponent 
} from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';

/**
 * グリッドレイアウトコンポーネント
 * レイアウトの配置とサイズを制御するためのコンポーネント
 */
const GridLayoutComponent: BaseComponent<GridLayoutProps> = {
  render: (_props: GridLayoutProps) => {
    return null; // レンダリングは不要（GridLayoutは独自にレンダリング）
  },

  renderSettings: (props: GridLayoutProps, onUpdate: (newProps: Partial<GridLayoutProps>) => void) => {
    return (
      <CommonLayoutSettings props={props} onUpdate={onUpdate} />
    );
  }
};

export default GridLayoutComponent;
