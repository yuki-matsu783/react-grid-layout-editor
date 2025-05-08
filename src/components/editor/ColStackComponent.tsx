import React from 'react';
import type { BaseComponent, ColStackProps, ParentType } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';
import { StackSettings } from './common/StackSettings';
import { Stack } from '@mui/material';

/**
 * ColStackコンポーネント
 * - 子要素を垂直方向に配置する
 * - CommonLayoutSettingsを使用して基本的なレイアウト設定を提供
 */
const ColStackComponent: BaseComponent<ColStackProps> = {
  render: (_props: ColStackProps) => {
    return null; // 実際のレンダリングはComponentEditorで行われる
  },

  renderSettings: (props: ColStackProps, onUpdate: (newProps: Partial<ColStackProps>) => void, parentType: ParentType) => {
    return (
      <Stack spacing={1}>
        <CommonLayoutSettings props={props} onUpdate={onUpdate} parentType={parentType} />
        <StackSettings props={props} onUpdate={onUpdate} />
      </Stack>
    );
  }
};

export default ColStackComponent;
