import React from 'react';
import type { BaseComponent, ColStackProps } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';

/**
 * ColStackコンポーネント
 * - 子要素を垂直方向に配置する
 * - CommonLayoutSettingsを使用して基本的なレイアウト設定を提供
 */
const ColStackComponent: BaseComponent<ColStackProps> = {
  render: (_props: ColStackProps) => {
    return null; // 実際のレンダリングはComponentEditorで行われる
  },

  renderSettings: (props: ColStackProps, onUpdate: (newProps: Partial<ColStackProps>) => void) => {
    return (
      <CommonLayoutSettings props={props} onUpdate={onUpdate} />
    );
  }
};

export default ColStackComponent;
