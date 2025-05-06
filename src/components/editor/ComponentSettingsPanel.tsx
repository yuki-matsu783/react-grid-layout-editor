import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ComponentSettingsPanelProps, ButtonProps } from '../../types';
import ButtonComponent from './ButtonComponent';

/**
 * コンポーネントタイプごとの設定コンポーネントマッピング
 */
const componentMap = {
  button: ButtonComponent,
  // 新しいコンポーネントタイプはここに追加
};

type ComponentMapType = typeof componentMap;

/**
 * コンポーネントの設定パネル
 * 選択されたコンポーネントの種類に応じて適切な設定UIを表示する
 */
const ComponentSettingsPanel: React.FC<ComponentSettingsPanelProps> = ({
  selectedItem,
  onUpdate
}) => {
  // 選択中のコンポーネントの設定UIコンポーネントを取得
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

  // コンポーネントの型に応じて適切な設定UIをレンダリング
  const renderSettings = () => {
    if (!selectedItem || !settingsComponent) return null;

    switch (selectedItem.component.type) {
      case 'button':
        return settingsComponent.renderSettings(
          selectedItem.component.props,
          (newProps: Partial<ButtonProps>) => onUpdate(selectedItem.id, newProps)
        );
      case 'gridLayout':
        // グリッドレイアウトは設定不要
        return null;
      default:
        console.warn(`Unsupported component type: ${(selectedItem.component as any).type}`);
        return null;
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">コンポーネント設定</Typography>
      {selectedItem && settingsComponent ? (
        renderSettings()
      ) : (
        <Typography color="text.secondary">
          設定可能なコンポーネントを選択してください
        </Typography>
      )}
    </Box>
  );
};

export default ComponentSettingsPanel;
