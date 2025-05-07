import React, { useRef, useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Box, Button, Stack, Typography } from '@mui/material';
import type { Theme } from '@mui/material';
import { useAtom } from 'jotai';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useLayoutOperations } from '../../hooks/useLayoutOperations';
import { useTreeOperations } from '../../hooks/useTreeOperations';
import type { 
  Layout, 
  GridItem, 
  ComponentConfig, 
  ComponentType,
  GridLayoutProps,
  ComponentEditorProps,
  ComponentAlignment
} from '../../types';
import { gridItemsAtom, selectedItemIdAtom, initializeGridItems } from '../../store/atoms';
import ComponentSettingsPanel from './ComponentSettingsPanel';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import RadioGroupComponent from './RadioGroupComponent';
import componentRegistry, { ComponentMetadata } from '../../utils/componentRegistry';
import GridLayout from './layout/GridLayout';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  radioGroup: RadioGroupComponent,
};

type ComponentMapType = typeof componentMap;

/**
 * ユニークなIDを生成する
 * @param prefix - IDのプレフィックス（デフォルト: "grid"）
 * @returns プレフィックスと乱数を組み合わせたユニークなID
 */
function generateId(prefix = "grid"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 新しいコンポーネントのGridItem設定を生成する
 * @param type - 作成するコンポーネントのタイプ
 * @param itemId - コンポーネントのID
 * @param position - グリッド上の配置位置
 * @param metadata - コンポーネントのメタデータ
 * @returns 新しいGridItem設定
 */
function createNewComponent(
  type: ComponentType,
  itemId: string,
  position: { x: number, y: number },
  metadata: ComponentMetadata<any>
): GridItem {
  return {
    id: itemId,
    layout: {
      i: `layout_${itemId}`,
      x: position.x,
      y: position.y,
      w: metadata.defaultWidth,
      h: metadata.defaultHeight
    },
    component: {
      type,
      props: metadata.defaultProps
    } as ComponentConfig
  };
}

/**
 * ネストされたグリッドレイアウトを管理するメインコンポーネント
 * - グリッドアイテムの配置、サイズ変更、ドラッグ＆ドロップを制御
 * - 最大5階層までのネストに対応
 * - コンポーネントの追加、削除、プロパティ編集機能を提供
 * - レイアウトのインポート/エクスポート機能を提供
 * 
 * @param cols - グリッドの列数
 * @param rowHeight - グリッドの行の高さ（ピクセル）
 * @param margin - グリッドアイテム間のマージン
 */
const ComponentEditor: React.FC<ComponentEditorProps> = ({ 
  cols, 
  rowHeight, 
  margin 
}) => {
  // グローバル状態
  const [items, setItems] = useAtom(gridItemsAtom);
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);

  // ローカル状態
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectingMode, setSelectingMode] = useState(false);

  /**
   * コンポーネントがレイアウト系かどうかを判定する
   * @param type - 判定するコンポーネントのタイプ
   * @returns レイアウト系コンポーネントの場合はtrue
   */
  const isLayoutComponent = (type: ComponentType): boolean => {
    return ['gridLayout', 'rowStack', 'colStack'].includes(type);
  };

  // refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * レイアウトの初期化
   * コンポーネントマウント時に一度だけ実行され、ルートとなるグリッドアイテムを生成する
   */
  useEffect(() => {
    setItems(initializeGridItems());
  }, [setItems]);

  // カスタムフックを使用
  /**
   * レイアウト操作に関する機能を提供するカスタムフック
   * @property findAvailablePosition - 指定されたサイズのコンポーネントを配置可能な位置を探す
   * @property updateLayoutInTree - ツリー内の特定アイテムのレイアウトを更新
   * @property addChildToTree - 指定された親アイテムの子として新しいアイテムを追加
   * @property removeFromTree - ツリーから特定のアイテムを削除
   * @property updateItemProps - 特定アイテムのプロパティを更新
   */
  const {
    findAvailablePosition,
    updateLayoutInTree,
    addChildToTree,
    removeFromTree,
    updateItemProps,
  } = useLayoutOperations();

  /**
   * ツリー構造の操作に関する機能を提供するカスタムフック
   * @property findItemInTree - ツリー内から特定のIDを持つアイテムを検索
   * @property calculateDepth - 指定されたアイテムのツリー内での深さを計算
   * @property isItemInEditTarget - アイテムが現在の編集対象の子孫かどうかを判定
   * @property isNestedItemSelected - 選択されたアイテムが編集対象の子孫かどうかを判定
   */
  const {
    findItemInTree,
    calculateDepth,
    isItemInEditTarget,
    isNestedItemSelected,
  } = useTreeOperations();

  /**
   * アイテムIDからレイアウトIDを生成する
   * @param itemId - 元となるアイテムID
   * @returns レイアウトID（'layout_'プレフィックス付き）
   */
  const generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  /**
   * レイアウトIDからアイテムIDを抽出する
   * @param layoutId - レイアウトID
   * @returns アイテムID（'layout_'プレフィックスを除去）
   */
  const extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  const updateItemLayout = (itemId: string, newLayout: Layout) => {
    setItems(prevItems => updateLayoutInTree(prevItems, itemId, newLayout));
  };

  /**
   * グリッドレイアウトの変更を処理する
   * アイテムの移動やサイズ変更時に呼び出され、新しいレイアウトを状態に反映する
   * @param layout - 更新されたレイアウト情報の配列
   */
  const handleLayoutChange = (layout: Layout[]) => {
    const processedLayout = layout.map(layoutItem => {
      const itemId = extractItemId(layoutItem.i);
      return {
        ...layoutItem,
        i: generateLayoutId(itemId)
      };
    });

    processedLayout.forEach(layoutItem => {
      const itemId = extractItemId(layoutItem.i);
      const affectedItem = findItemInTree(items, itemId);
      if (affectedItem) {
        updateItemLayout(affectedItem.id, layoutItem);
      }
    });
  };

  /**
   * 新しいコンポーネントをグリッドに追加する
   * @param componentType - 追加するコンポーネントの種類
   * @param idPrefix - 生成するIDのプレフィックス
   * @returns 追加に成功した場合はtrue、失敗した場合はfalse
   */
  const handleAddComponent = (
    componentType: ComponentType,
    idPrefix: string
  ): boolean => {
    // 編集対象が選択されている場合、ネストの深さをチェック（最大5階層まで）
    if (editTargetId) {
      const depth = calculateDepth(items, editTargetId);
      if (depth >= 4) {
        alert('これ以上階層を深くすることはできません（最大5階層まで）');
        return false;
      }
    }
    
    // 新しいコンポーネントを追加する対象のアイテム配列を決定
    const targetItems = editTargetId
      ? (() => {
          const targetItem = findItemInTree(items, editTargetId);
          if (!targetItem) return [];
          
          // GridLayoutとRowStackの子要素として追加可能
          if (targetItem.component.type === 'gridLayout' || 
              targetItem.component.type === 'rowStack' || 
              targetItem.component.type === 'colStack') {
            console.log(`Adding to ${targetItem.component.type}, current children:`, targetItem.component.props.children);
            return targetItem.component.props.children || [];
          }
          return [];
        })()
      : items;

    // 子要素を持つコンポーネントへの追加かどうかを判定
    const isAddingToParent = editTargetId && (() => {
      const targetType = findItemInTree(items, editTargetId)?.component.type;
      return targetType === 'rowStack' || targetType === 'colStack';
    })();

    // グリッドレイアウト用のデフォルトメタデータを定義
    const defaultGridLayoutMetadata = { 
      displayName: 'Grid Layout',
      icon: 'grid_view',
      defaultWidth: 2, 
      defaultHeight: 2, 
      defaultProps: {
        children: [] as GridItem[],
        widthPercentage: 100,
        heightPercentage: 100,
        horizontalAlign: 'center',
        verticalAlign: 'center'
      } 
    } as ComponentMetadata<GridLayoutProps>;

    // コンポーネントのメタデータを取得
    const metadata = componentType === 'gridLayout' 
      ? defaultGridLayoutMetadata
      : componentRegistry.getMetadata(componentType);

    if (!metadata) {
      console.error(`${componentType} component metadata not found`);
      return false;
    }

    // 位置を決定
    const position = (() => {
      // RowStackの子要素として追加する場合
      if (isAddingToParent) {
        const targetItem = findItemInTree(items, editTargetId);
        if (targetItem && 'children' in targetItem.component.props) {
          const currentChildren = targetItem.component.props.children;
          // RowStackの場合は横方向、ColStackの場合は縦方向に配置
          if (targetItem.component.type === 'rowStack') {
            return { x: currentChildren.length, y: 0, canPlace: true };
          } else if (targetItem.component.type === 'colStack') {
            return { x: 0, y: currentChildren.length, canPlace: true };
          }
        }
      }

      // グリッドレイアウトの場合
      const findResult = findAvailablePosition(
        metadata.defaultWidth,
        metadata.defaultHeight,
        targetItems
      );

      // グリッドレイアウトの場合、1x1でも配置を試みる
      if (!findResult.canPlace && componentType === 'gridLayout') {
        return findAvailablePosition(1, 1, targetItems);
      }

      return findResult;
    })();

    if (!position.canPlace) {
      alert('利用可能なスペースがありません。');
      return false;
    }

    // 新しいアイテムの作成
    const itemId = generateId(idPrefix);
    let newItem: GridItem;

    if (componentType === 'gridLayout' || componentType === 'rowStack' || componentType === 'colStack') {
      newItem = {
        id: itemId,
        layout: {
          i: `layout_${itemId}`,
          x: position.x,
          y: position.y,
          w: metadata.defaultWidth,
          h: metadata.defaultHeight
        },
        component: {
          type: componentType,
          props: {
            children: [],
            widthPercentage: 100,
            heightPercentage: 100,
            horizontalAlign: 'center' as ComponentAlignment,
            verticalAlign: 'center' as ComponentAlignment
          }
        }
      } as GridItem;
    } else {
      newItem = createNewComponent(componentType, itemId, position, metadata);
    }

    // アイテムを追加（編集対象があれば子要素として、なければルートレベルに）
    setItems(prevItems => {
      console.log('Adding new item:', newItem, 'to parent:', editTargetId);
      return !editTargetId
        ? [...prevItems, newItem]
        : addChildToTree(prevItems, editTargetId, newItem);
    });

    return true;
  };

  /**
   * 新しいグリッドレイアウトコンポーネントを追加する
   */
  const handleAddGridLayout = () => handleAddComponent('gridLayout', 'grid');

  /**
   * 新しいボタンコンポーネントを追加する
   */
  const handleAddButton = () => handleAddComponent('button', 'btn');

  /**
   * 新しいテキストフィールドコンポーネントを追加する
   */
  const handleAddTextField = () => handleAddComponent('textField', 'txt');

  /**
   * 新しいラジオグループコンポーネントを追加する
   */
  const handleAddRadioGroup = () => handleAddComponent('radioGroup', 'radio');

  /**
   * 現在のレイアウトをJSONファイルとしてエクスポートする
   */
  const handleExport = () => {
    try {
      // バージョン情報とアイテムデータを含むエクスポートデータを作成
      const exportData = {
        version: '1.0',
        items,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // ダウンロードリンクを作成して自動クリック
      const a = document.createElement('a');
      a.href = url;
      a.download = 'layout-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  /**
   * JSONファイルからレイアウトをインポートする
   * @param event - ファイル選択イベント
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          // バージョンチェック
          if (importData.version !== '1.0') {
            throw new Error('Unsupported version');
          }

          // データ形式チェック
          if (!Array.isArray(importData.items)) {
            throw new Error('Invalid layout data');
          }

          // インポートデータを適用し、選択状態をリセット
          setItems(importData.items);
          setSelectedItemId(null);
          setEditTargetId(null);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    } finally {
      // ファイル入力をリセット（同じファイルを再度選択可能にする）
      setFileInputKey(prev => prev + 1);
    }
  };

  /**
   * 選択中のアイテムを削除する
   */
  const handleRemoveItem = () => {
    if (!selectedItemId) return;
    
    // アイテムを削除し、選択状態をリセット
    setItems(prev => removeFromTree(prev, selectedItemId));
    setSelectedItemId(null);
    if (editTargetId === selectedItemId) {
      setEditTargetId(null);
    }
  };

  /**
   * グリッドアイテムを選択する
   * @param id - 選択するアイテムのID
   */
  const handleSelect = (id: string): void => {
    const selectedItem = findItemInTree(items, id);
    if (!selectedItem) return;

    // 編集対象選択モードの場合
    if (selectingMode) {
      if (selectedItem.component.type === 'gridLayout' || 
          selectedItem.component.type === 'rowStack' || 
          selectedItem.component.type === 'colStack') {
        setSelectedItemId(id);
        setEditTargetId(id);
        setSelectingMode(false);
        console.log('編集対象に設定:', id, selectedItem.component.type);
      }
      return;
    }

    // 編集対象が設定されている場合
    if (editTargetId) {
      const editTargetItem = findItemInTree(items, editTargetId);
      if (editTargetItem) {
        // Stack系コンポーネントの場合は、子要素の選択を許可
        if (editTargetItem.component.type === 'rowStack' || editTargetItem.component.type === 'colStack') {
          // 直接の子要素かどうかをチェック
          const isDirectChild = editTargetItem.component.props.children.some(child => child.id === id);
          if (isDirectChild) {
            console.log('Stack子要素を選択:', id, '親:', editTargetId);
            setSelectedItemId(id);
            return;
          }
        }
        // GridLayoutの場合は従来通り
        if (isItemInEditTarget(items, id, editTargetId)) {
          setSelectedItemId(id);
          console.log('編集対象内のアイテムを選択:', id);
        }
      }
      return;
    }

    // 通常の選択
    console.log('通常選択:', id);
    setSelectedItemId(id);
  };

  /**
   * 編集対象の選択モードを切り替える
   */
  const toggleEditTarget = () => {
    if (editTargetId) {
      // 編集モードを終了
      setEditTargetId(null);
      setSelectingMode(false);
    } else if (selectingMode) {
      // 選択モードをキャンセル
      setSelectingMode(false);
    } else {
      // 選択モードを開始
      setSelectingMode(true);
    }
  };

  /**
   * グリッドアイテムをレンダリングする
   * アイテムの種類に応じて適切なコンポーネントを生成し、スタイルと配置を設定する
   * @param item - レンダリングするグリッドアイテム
   * @returns レンダリングされたReactノード
   */
  const renderElement = (item: GridItem): React.ReactNode => {
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;

    // 水平・垂直方向の配置設定を計算
    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage } = item.component.props;
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    // グリッドアイテムの基本スタイルとイベントハンドラを設定
    const baseBoxProps = {
      key: item.layout.i,
      'data-grid': item.layout,
      className: "grid-item",
      sx: {
        position: 'relative',
        bgcolor: isEditTarget ? 'rgba(0, 0, 255, 0.05)' : '#ffffff',
        border: (theme: Theme) => {
          // Stack系コンポーネントの直接の子要素が選択されている場合
          const editTargetItem = editTargetId ? findItemInTree(items, editTargetId) : null;
          const isStackChild = editTargetItem && 
            (editTargetItem.component.type === 'rowStack' || editTargetItem.component.type === 'colStack') &&
            editTargetItem.component.props.children.some(child => child.id === item.id);

          if (isSelected && isStackChild) {
            return `2px solid ${theme.palette.primary.main}`;
          }
          // 選択状態を最優先
          if (isSelected || (selectingMode && isEditTarget)) {
            return `2px solid ${theme.palette.primary.main}`;
          }
          // 選択モード時のレイアウトコンポーネント
          if (selectingMode && isLayoutComponent(item.component.type)) {
            return `2px solid ${theme.palette.info.main}`;
          }
          return '1px solid #e0e0e0';
        },
        borderRadius: '4px',
        cursor: selectingMode && !isLayoutComponent(item.component.type) ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems,
        justifyContent,
        opacity: selectingMode && !isLayoutComponent(item.component.type) ? 0.5 : 1,
        // Stack系コンポーネントの子要素は常にクリック可能に
        pointerEvents: (() => {
          if (selectingMode && !isLayoutComponent(item.component.type)) {
            return 'none';
          }
          // 編集対象がある場合
          if (editTargetId) {
            const editTargetItem = findItemInTree(items, editTargetId);
            // Stack系の子要素は常にクリック可能
            if (editTargetItem && 
                (editTargetItem.component.type === 'rowStack' || 
                 editTargetItem.component.type === 'colStack') &&
                editTargetItem.component.props.children.some(child => child.id === item.id)) {
              return 'auto';
            }
            // それ以外は編集対象の子孫でない場合はクリック不可
            return isItemInEditTarget(items, item.id, editTargetId) ? 'auto' : 'none';
          }
          return 'auto';
        })(),
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: (theme: Theme) => {
            // 選択状態の場合はホバー効果を適用しない
            if (isSelected || (selectingMode && isEditTarget)) {
              return theme.palette.primary.main;
            }
            // 選択モード時のレイアウトコンポーネント
            if (selectingMode && isLayoutComponent(item.component.type)) {
              return theme.palette.info.dark;
            }
            return theme.palette.grey[300];
          }
        },
      },
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleSelect(item.id); }
    };

    // コンポーネントの種類に応じてコンテンツをレンダリング（button, textField, gridLayout）
    let content: React.ReactNode = null;

    if (item.component.type in componentMap) {
      const ComponentRenderer = componentMap[item.component.type as keyof ComponentMapType];
      content = ComponentRenderer.render(item.component.props as any);
    } else if (item.component.type === 'gridLayout') {
      content = (
          <GridLayout
          isDraggable={isEditTarget && !selectingMode}
          isResizable={isEditTarget && !selectingMode}
          cols={cols}
          margin={[0, 0]}
          defaultRowHeight={rowHeight}
          onLayoutChange={handleLayoutChange}
          itemId={item.id}
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 40px)
            `,
          }}
        >
          {item.component.props.children.map(child => renderElement(child))}
        </GridLayout>
      );
    } else if (item.component.type === 'rowStack') {
      content = (
        <Stack
          direction="row"
          spacing={0}
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            justifyContent: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 40px)',
          }}
        >
          {item.component.props.children.map(child => renderElement(child))}
        </Stack>
      );
    } else if (item.component.type === 'colStack') {
      content = (
        <Stack
          direction="column"
          spacing={0}
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            justifyContent: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 40px)',
          }}
        >
          {item.component.props.children.map(child => renderElement(child))}
        </Stack>
      );
    }

    if (!content) return null;

    return (
      <Box {...baseBoxProps}>
        <Box
          sx={{
            width: `${widthPercentage}%`,
            height: `${heightPercentage}%`,
            overflow: 'auto',
            display: 'flex',
            padding: `${item.component.props.paddingPercentage ?? 0}%`,
          }}
        >
          {content}
        </Box>
      </Box>
    );
  };

  const isDraggableAndResizable = (): boolean => {
    if (selectingMode) return false;
    return !editTargetId || !isNestedItemSelected(editTargetId, items);
  };

  const isDraggableResizable = isDraggableAndResizable();

  return (
    /* メインエディタコンテナ */
    <Box
      sx={{
        height: '100vh',
        bgcolor: 'background.default',
        p: 2,
        display: 'flex',
        gap: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
      onClick={() => setSelectedItemId(null)}
    >
      {/* 左サイドパネル - コンポーネント追加ツールバー */}
      <Box 
        sx={{
          width: 240,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー部分 */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            コンポーネント追加
          </Typography>
        </Box>
        {/* コンテンツ部分 */}
        <Box sx={{ 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'auto',
          flex: 1,
        }}>
          {/* レイアウトコンポーネントセクション */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              レイアウト
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddGridLayout}
                startIcon={<AddBoxIcon />}
              >
                グリッドレイアウト
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleAddComponent('rowStack', 'row')}
                startIcon={<AddBoxIcon />}
              >
                RowStack
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleAddComponent('colStack', 'col')}
                startIcon={<AddBoxIcon />}
              >
                ColStack
              </Button>
            </Box>
          </Box>

          {/* その他のコンポーネントセクション */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              コンポーネント
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddButton}
                startIcon={<AddBoxIcon />}
              >
                ボタン
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddTextField}
                startIcon={<AddBoxIcon />}
              >
                テキストフィールド
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddRadioGroup}
                startIcon={<AddBoxIcon />}
              >
                ラジオグループ
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* メインコンテンツエリア - グリッドレイアウトエディタ */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* ツールバー - 操作ボタン群 */}
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          gap: 1,
          p: 2,
          bgcolor: '#ffffff',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemoveItem}
              disabled={!selectedItemId}
              startIcon={<DeleteIcon />}
            >
              選択した領域を削除
            </Button>
            <Button
              variant="outlined"
              onClick={toggleEditTarget}
              startIcon={selectingMode || editTargetId ? <EditOffIcon /> : <EditIcon />}
            >
              {selectingMode ? "領域選択をキャンセル" : editTargetId ? "編集を終了" : "レイアウト領域を選択"}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<FileUploadIcon />}
            >
              インポート
            </Button>
            <Button
              variant="outlined"
              onClick={handleExport}
              startIcon={<FileDownloadIcon />}
            >
              エクスポート
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              key={fileInputKey}
              onChange={handleImport}
            />
          </Box>
        </Box>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            border: '1px dashed #ccc',
            borderRadius: 1,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            p: 1,
            overflow: 'auto'
          }}>
            <ResponsiveReactGridLayout
            isDraggable={isDraggableResizable}
            isResizable={isDraggableResizable}
            cols={cols}
            rowHeight={rowHeight}
            margin={margin}
            onLayoutChange={handleLayoutChange}
            compactType={null}
            preventCollision
            resizeHandles={isDraggableResizable? ['se']:[]}
          >
            {items.map(item => renderElement(item))}
            </ResponsiveReactGridLayout>
          </Box>
        </Box>
      </Box>

      {/* 右サイドパネル - 選択したコンポーネントの設定パネル */}
      <Box 
        sx={{ 
          width: 240,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ComponentSettingsPanel
          selectedItem={selectedItemId ? findItemInTree(items, selectedItemId) : null}
          onUpdate={(id, newProps) => {
            if (selectedItemId) {
              const selectedItem = findItemInTree(items, selectedItemId);
              if (selectedItem) {
                setItems(prevItems => updateItemProps(prevItems, id, newProps));
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ComponentEditor;
