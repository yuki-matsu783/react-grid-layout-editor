import type { Theme } from '@mui/material';
import type { GridItem, BaseLayoutProps } from '../../../types';
import { useTreeOperations } from '../../../hooks/useTreeOperations';

/**
 * レンダリング関連の操作を提供するカスタムフック
 */
export const useRenderOperations = () => {
  const { isLayoutComponent, hasChildren } = useTreeOperations();

  /**
   * グリッドアイテムのスタイルを計算する
   * @param item - グリッドアイテム
   * @param isSelected - 選択状態かどうか
   * @param isEditTarget - 編集対象かどうか
   * @param selectingMode - 選択モードかどうか
   */
  const calculateGridItemStyle = (
    item: GridItem,
    isSelected: boolean,
    isEditTarget: boolean,
    selectingMode: boolean
  ) => {
    return {
      position: 'relative',
      bgcolor: isEditTarget ? 'rgba(0, 0, 255, 0.05)' : '#ffffff',
      border: (theme: Theme) => {
        if (isSelected || (selectingMode && isEditTarget)) {
          return `2px solid ${theme.palette.primary.main}`;
        }
        if (selectingMode && isLayoutComponent(item.component.type)) {
          return `2px solid ${theme.palette.info.main}`;
        }
        return '1px solid #e0e0e0';
      },
      borderRadius: '4px',
      cursor: selectingMode && !isLayoutComponent(item.component.type) ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: selectingMode && !isLayoutComponent(item.component.type) ? 0.5 : 1,
      pointerEvents: (() => {
        if (selectingMode && !isLayoutComponent(item.component.type) && !hasChildren(item.component.props)) {
          return 'none';
        }
        return 'auto';
      })(),
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: (theme: Theme) => {
          if (isSelected || (selectingMode && isEditTarget)) {
            return theme.palette.primary.main;
          }
          if (selectingMode && isLayoutComponent(item.component.type)) {
            return theme.palette.info.dark;
          }
          return theme.palette.grey[300];
        }
      },
    };
  };

  /**
   * コンポーネント内部のBoxのスタイルを計算する
   * @param item - グリッドアイテム
   * @param parentType - 親要素のタイプ
   */
  const calculateWrapperStyle = (
    item: GridItem,
    parentType: 'grid' | 'stack'
  ) => {
    const props = item.component.props as BaseLayoutProps;
    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage, paddingPercentage, width, height } = props;

    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    return {
      border: '0.5px dotted #e0e0e0',
      borderRadius: '4px',
      ...(parentType === 'grid' ? {
        width: `${widthPercentage}%`,
        height: `${heightPercentage}%`,
      } : {
        width: width !== undefined ? width : 'auto',
        height: height !== undefined ? height : 'auto',
      }),
      padding: `${paddingPercentage ?? 0}%`,
      overflow: 'auto',
      display: 'flex',
      alignItems,
      justifyContent,
    };
  };

  return {
    calculateGridItemStyle,
    calculateWrapperStyle
  };
};
