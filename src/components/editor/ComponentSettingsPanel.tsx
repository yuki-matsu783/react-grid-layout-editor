import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ComponentSettingsPanelProps } from '../../types';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import GridLayoutComponent from './GridLayoutComponent';

/**
 * コンポーネントタイプごとの設定コンポーネントマッピング
 */
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  gridLayout: GridLayoutComponent,
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
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>コンポーネント設定</Typography>
      {selectedItem && settingsComponent ? (
        settingsComponent.renderSettings(
          selectedItem.component.props as any,
          (newProps: Partial<typeof selectedItem.component.props>) => onUpdate(selectedItem.id, newProps)
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          設定可能なコンポーネントを選択してください
        </Typography>
      )}
    </Box>
  );
};

export default ComponentSettingsPanel;
