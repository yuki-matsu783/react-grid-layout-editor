import React from 'react';
import type { 
  GridLayoutProps,
  BaseComponent,
  ParentType
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

  renderSettings: (props: GridLayoutProps, onUpdate: (newProps: Partial<GridLayoutProps>) => void, parentType: ParentType) => {
    return (
      <CommonLayoutSettings props={props} onUpdate={onUpdate} parentType={parentType} />
    );
  }
};

export default GridLayoutComponent;
