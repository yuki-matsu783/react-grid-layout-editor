import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ComponentSettingsPanelProps } from '../../types';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';

/**
 * コンポーネントタイプごとの設定コンポーネントマッピング
 */
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  // 新しいコンポーネントタイプはここに追加
};

type ComponentMapType = typeof componentMap;

/**
 * コンポーネントの設定パネル
 */
const ComponentSettingsPanel: React.FC<ComponentSettingsPanelProps> = ({
  selectedItem,
  onUpdate
}) => {
  const getSettingsComponent = () => {
    if (!selectedItem) return null;
    const component = componentMap[selectedItem.component.type as keyof ComponentMapType];
    if (!component) {
      console.warn(`No settings component found for type: ${selectedItem.component.type}`);
      return null;
    }
    return component;
  };

  const settingsComponent = getSettingsComponent();

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">コンポーネント設定</Typography>
      {selectedItem && settingsComponent ? (
        settingsComponent.renderSettings(
          selectedItem.component.props,
          (newProps) => onUpdate(selectedItem.id, newProps)
        )
      ) : (
        <Typography color="text.secondary">
          設定可能なコンポーネントを選択してください
        </Typography>
      )}
    </Box>
  );
};

export default ComponentSettingsPanel;
