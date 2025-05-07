import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ComponentSettingsPanelProps } from '../../types';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import GridLayoutComponent from './GridLayoutComponent';

/**
 * コンポーネントタイプごとの設定コンポーネントマッピング
 * 各コンポーネントタイプに対応する設定用コンポーネントを定義
 * 新しいコンポーネントタイプを追加する際は、ここにマッピングを追加する
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
 * 選択されたコンポーネントの設定UIを表示し、プロパティの編集を可能にする
 * 
 * @param selectedItem - 現在選択されているグリッドアイテム
 * @param onUpdate - プロパティが更新された時のコールバック関数
 */
const ComponentSettingsPanel: React.FC<ComponentSettingsPanelProps> = ({
  selectedItem,
  onUpdate
}) => {
  /**
   * 選択されたコンポーネントに対応する設定コンポーネントを取得
   * @returns 設定コンポーネントのインスタンス、未選択または未対応の場合はnull
   */
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
