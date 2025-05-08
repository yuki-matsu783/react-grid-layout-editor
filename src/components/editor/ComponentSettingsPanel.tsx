import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import type { ComponentSettingsPanelProps, ParentType } from '../../types';
import { gridItemsAtom } from '../../store/atoms';
import { useTreeOperations } from '../../hooks/useTreeOperations';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import GridLayoutComponent from './GridLayoutComponent';
import RadioGroupComponent from './RadioGroupComponent';
import ColStackComponent from './ColStackComponent';
import RowStackComponent from './RowStackComponent';
import TypographyComponent from './TypographyComponent';

/**
 * コンポーネントタイプごとの設定コンポーネントマッピング
 * 各コンポーネントタイプに対応する設定用コンポーネントを定義
 * 新しいコンポーネントタイプを追加する際は、ここにマッピングを追加する
 */
const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  gridLayout: GridLayoutComponent,
  radioGroup: RadioGroupComponent,
  rowStack: RowStackComponent,
  colStack: ColStackComponent,
  typography: TypographyComponent
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
  const items = useAtomValue(gridItemsAtom);
  const { findParentItem } = useTreeOperations();

  /**
   * 親要素のタイプを判定
   * @returns 'grid' または 'stack'
   */
  const getParentType = (): ParentType => {
    if (!selectedItem) return 'grid';
    
    const parentItem = findParentItem(items, selectedItem.id);
    if (!parentItem) return 'grid';

    return parentItem.component.type === 'gridLayout' ? 'grid' : 'stack';
  };

  const parentType = getParentType();
  
  /**
   * プロパティの更新をハンドルする関数
   * @param newProps - 更新するプロパティ
   */
  const handleUpdateProps = (newProps: Partial<any>) => {
    if (!selectedItem) return;
    
    console.log('更新前のプロパティ:', selectedItem.component.props);
    console.log('更新するプロパティ:', newProps);
    
    // 親コンポーネントへの更新を通知
    onUpdate(selectedItem.id, newProps);
  };

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
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* ヘッダー部分 */}
      <Box sx={{ 
        p: 2,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
          コンポーネント設定
        </Typography>
      </Box>
      {/* コンテンツ部分 */}
      <Box sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'auto',
        flex: 1
      }}>
        {selectedItem && settingsComponent ? (
          settingsComponent.renderSettings(
            selectedItem.component.props as any,
            (newProps: Partial<typeof selectedItem.component.props>) => handleUpdateProps(newProps),
            parentType
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            設定可能なコンポーネントを選択してください
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ComponentSettingsPanel;
