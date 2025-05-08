import React from 'react';
import type { BaseComponent, RowStackProps, ParentType } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';
import { StackSettings } from './common/StackSettings';
import { Stack } from '@mui/material';

/**
 * RowStackコンポーネント
 * - 子要素を水平方向に配置する
 * - CommonLayoutSettingsを使用して基本的なレイアウト設定を提供
 */
const RowStackComponent: BaseComponent<RowStackProps> = {
  render: (_props: RowStackProps) => {
    return null; // 実際のレンダリングはComponentEditorで行われる
  },

  renderSettings: (props: RowStackProps, onUpdate: (newProps: Partial<RowStackProps>) => void, parentType: ParentType) => {
    return (
      <Stack spacing={1}>
        <CommonLayoutSettings props={props} onUpdate={onUpdate} parentType={parentType} />
        <StackSettings props={props} onUpdate={onUpdate} />
      </Stack>
    );
  }
};

export default RowStackComponent;
