import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Box, Button, Stack, Typography } from '@mui/material';
import type { Theme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CodeIcon from '@mui/icons-material/Code';
import type { 
  GridItem, 
  ComponentEditorProps,
   } from '../../types';
import ComponentSettingsPanel from './ComponentSettingsPanel';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import RadioGroupComponent from './RadioGroupComponent';
import GridLayout from './layout/GridLayout';
import { useComponentEditor } from "./hooks/useComponentEditor";
import { useSourceCodeGenerator } from "./logic/useSourceCodeGenerator";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  radioGroup: RadioGroupComponent,
};

type ComponentMapType = typeof componentMap;

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
  const {
    // 状態
    items,
    selectedItemId,
    editTargetId,
    selectingMode,
    fileInputKey,
    fileInputRef,
    
    // アクション
    setSelectedItemId,
    
    // メソッド
    handleLayoutChange,
    handleAddComponent,
    handleAddGridLayout,
    handleAddButton,
    handleAddTextField,
    handleAddRadioGroup,
    handleExport,
    handleImport,
    handleRemoveItem,
    handleSelect,
    toggleEditTarget,
    getParentType,
    isDraggableAndResizable,
    handleUpdateProps,
    findItemInTree,
    isLayoutComponent,
    hasChildren,
    isItemInEditTarget,
  } = useComponentEditor(cols, rowHeight, margin);

  const { generateSourceCode } = useSourceCodeGenerator();

  /**
   * ソースコードを生成してダウンロードする
   */
  const handleGenerateCode = () => {
    const sourceCode = generateSourceCode(items);
    const element = document.createElement("a");
    const file = new Blob([sourceCode], { type: "text/javascript" });
    element.href = URL.createObjectURL(file);
    element.download = "GeneratedComponent.tsx";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  /**
   * グリッドアイテムをレンダリングする
   * アイテムの種類に応じて適切なコンポーネントを生成し、スタイルと配置を設定する
   * 
   * レンダリングの種類：
   * 1. 基本コンポーネント（button, textField, radioGroup）
   *    - componentMapから対応するレンダラーを使用
   *    - コンポーネント固有のプロパティを適用
   * 
   * 2. レイアウトコンポーネント（gridLayout, rowStack, colStack）
   *    - 子要素を再帰的にレンダリング
   *    - グリッドまたはスタックレイアウトで配置
   *    - 編集モードに応じてドラッグ＆ドロップを制御
   * 
   * スタイリング：
   * - 選択状態、編集状態に応じたボーダースタイル
   * - 親要素の種類（grid/stack）に応じたサイズ設定
   * - 水平・垂直方向の配置制御
   * 
   * @param item - レンダリングするグリッドアイテム
   * @returns レンダリングされたReactノード
   */
  const renderElement = (item: GridItem): React.ReactNode => {
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;

    // 水平・垂直方向の配置設定を計算
    // コンポーネントのプロパティから配置設定を取得し、Flexboxの配置プロパティに変換
    // - horizontalAlign: 水平方向の配置（'start' | 'center' | 'end'）
    // - verticalAlign: 垂直方向の配置（'start' | 'center' | 'end'）
    // - widthPercentage/heightPercentage: 親要素に対するサイズ（%）
    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage } = item.component.props;
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    // グリッドアイテムの基本スタイルとイベントハンドラを設定
    const sectionProps = {
      'data-grid': item.layout,
      className: "grid-item",
      sx: {
        position: 'relative',
        bgcolor: isEditTarget ? 'rgba(0, 0, 255, 0.05)' : '#ffffff',
        border: (theme: Theme) => {
          // Stack系コンポーネントの直接の子要素が選択されている場合
          const editTargetItem = editTargetId ? findItemInTree(items, editTargetId) : null;
          const isStackChild = editTargetItem && 
            isLayoutComponent(editTargetItem.component.type) &&
            hasChildren(editTargetItem.component.props) &&
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
        alignItems: 'center',
        justifyContent: 'center',
        opacity: selectingMode && !isLayoutComponent(item.component.type) ? 0.5 : 1,
        pointerEvents: (() => {
          if (selectingMode && !isLayoutComponent(item.component.type) && !hasChildren(item.component.props)) {
            return 'none';
          }
          // 編集対象がある場合、その子孫要素のみクリック可能
          if (editTargetId) {
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

    // コンポーネント内部のBoxスタイルを設定
    const wrapperProps = {
      sx: {
        border: '0.5px dotted #e0e0e0',
        borderRadius: '4px',
        ...(getParentType(item) === 'grid' ? {
          width: `${widthPercentage}%`,
          height: `${heightPercentage}%`,
        } : {
          width: item.component.props.width !== undefined ? item.component.props.width : 'auto',
          height: item.component.props.height !== undefined ? item.component.props.height : 'auto',
        }),
        padding: `${item.component.props.paddingPercentage ?? 0}%`,
        overflow: 'auto',
        display: 'flex',
        alignItems,
        justifyContent,
      }
    };

    // コンポーネントの種類に応じてコンテンツをレンダリング
    // 1. 基本コンポーネント: componentMapに登録されたレンダラーを使用
    // 2. gridLayout: 独自のGridLayoutコンポーネントで子要素を配置
    // 3. rowStack/colStack: MUIのStackコンポーネントで子要素を水平/垂直に配置
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
            alignItems: 'center',
            minHeight: 'fit-content',
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
            alignItems: 'center',
            minWidth: 'fit-content',
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
      <Box key={item.layout.i} {...sectionProps}>
        <Box {...wrapperProps}>
          {content}
        </Box>
      </Box>
    );
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
            <Button
              variant="outlined"
              onClick={handleGenerateCode}
              startIcon={<CodeIcon />}
            >
              ソースコード生成(実験中)
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
          onUpdate={handleUpdateProps}
        />
      </Box>
    </Box>
  );
};

export default ComponentEditor;
