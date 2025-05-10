import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Box, Button, Stack, Typography, Tooltip, TextField } from '@mui/material';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import type { Theme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { 
  GridItem, 
  ComponentEditorProps,
  StackBaseProps,
} from '../../types';
import ComponentSettingsPanel from './ComponentSettingsPanel';
import ButtonComponent from './ButtonComponent';
import TextFieldComponent from './TextFieldComponent';
import RadioGroupComponent from './RadioGroupComponent';
import TypographyComponent from './TypographyComponent';
import GridLayout from './layout/GridLayout';
import { useComponentEditor } from "./hooks/useComponentEditor";
import { useSourceCodeGenerator } from "./logic/useSourceCodeGenerator";
import { getDefaultGridItems } from "../../store/atoms";
import ViewComfyIcon from '@mui/icons-material/ViewComfy';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const componentMap = {
  button: ButtonComponent,
  textField: TextFieldComponent,
  radioGroup: RadioGroupComponent,
  typography: TypographyComponent,
};

type ComponentMapType = typeof componentMap;

interface GridItemWithExplanation extends GridItem {
  explanationNumber?: string;
  explanation?: {
    title?: string;
    description?: string;
  } | null;
}

const NumberLabel: React.FC<{ 
  number: string;
  explanation?: { title?: string; description?: string } | null;
  isTopLeft?: boolean;
}> = ({ number, explanation, isTopLeft }) => {
  const position = isTopLeft ? {
    top: 'auto',
    left: 'auto',
    bottom: 8,
    right: 8,
  } : {
    top: 8,
    left: 8,
  };

  return (
    <Tooltip
      title={
        explanation?.title && explanation.description ? (
          <Box sx={{ p: 1, maxWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {explanation.title}
            </Typography>
            <Typography variant="body2">
              {explanation.description}
            </Typography>
          </Box>
        ) : ""
      }
      arrow
      placement="right"
    >
      <Box
        sx={{
          position: 'absolute',
          backgroundColor: '#1976d2',
          color: '#ffffff',
          borderRadius: '50%',
          minWidth: 24,
          height: 24,
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          opacity: 1,
          zIndex: 1001,
          boxShadow: 1,
          ...position
        }}
      >
        {number}
      </Box>
    </Tooltip>
  );
};

const assignNumbersToItems = (items: GridItem[], parentNumber?: string): GridItemWithExplanation[] => {
  const sortedItems = [...items].sort((a, b) => {
    if (a.layout.y === b.layout.y) {
      return a.layout.x - b.layout.x;
    }
    return a.layout.y - b.layout.y;
  });

  return sortedItems.map((item, index) => {
    const currentNumber = parentNumber 
      ? `${parentNumber}-${index + 1}` 
      : `${index + 1}`;

    if (item.component.type === 'gridLayout' && item.component.props.children) {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component.props,
            children: assignNumbersToItems(item.component.props.children, currentNumber)
          }
        },
        explanationNumber: currentNumber
      };
    }

    return {
      ...item,
      explanationNumber: currentNumber
    };
  });
};

const ComponentEditor: React.FC<ComponentEditorProps> = ({ 
  cols, 
  rowHeight, 
  margin 
}) => {
  const [isScreenExplanationMode, setIsScreenExplanationMode] = React.useState(false);
  const {
    items,
    selectedItemId,
    editTargetId,
    selectingMode,
    fileInputKey,
    fileInputRef,
    setSelectedItemId,
    setEditTargetId,
    setItems,
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
    isDraggableAndResizable,
    handleUpdateProps,
    findItemInTree,
    isLayoutComponent,
    hasChildren,
    isItemInEditTarget,
  } = useComponentEditor(cols, rowHeight, margin);

  const { generateSourceCode } = useSourceCodeGenerator();

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

  const handleShowSampleLayout = () => {
    setSelectedItemId(null);
    setEditTargetId(null);
    setItems(getDefaultGridItems());
  };

  const renderElement = (item: GridItem): React.ReactNode => {
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;

    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage, width, height } = item.component.props;
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    return (
      <Box
        key={item.layout.i}
        data-grid={item.layout}
        sx={{
          width: width ?? '100%',
          height: height ?? '100%',
          position: 'relative',
          bgcolor: '#ffffff',
          border: (theme: Theme) => {
            if (isSelected) return `2px solid ${theme.palette.primary.main}`;
            if (selectingMode && isLayoutComponent(item.component.type)) {
              return `2px solid ${theme.palette.info.main}`;
            }
            return '1px solid #e0e0e0';
          },
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={(e) => { e.stopPropagation(); handleSelect(item.id); }}
      >
        {isScreenExplanationMode && (item as GridItemWithExplanation).explanationNumber && (
          <NumberLabel 
            number={(item as GridItemWithExplanation).explanationNumber!}
            explanation={(item as GridItemWithExplanation).explanation}
            isTopLeft={item.component.type === 'gridLayout' && item.component.props.children && item.layout.x === 0 && item.layout.y === 0}
          />
        )}
        <Box sx={{
          width: widthPercentage ? `${widthPercentage}%` : 'auto',
          height: heightPercentage ? `${heightPercentage}%` : 'auto',
          padding: `${item.component.props.paddingPercentage ?? 0}%`,
          display: 'flex',
          alignItems,
          justifyContent,
        }}>
          {item.component.type === 'gridLayout' ? (
            <GridLayout
              isDraggable={isEditTarget && !selectingMode && !isScreenExplanationMode}
              isResizable={isEditTarget && !selectingMode && !isScreenExplanationMode}
              cols={cols}
              margin={[0, 0]}
              defaultRowHeight={rowHeight}
              onLayoutChange={handleLayoutChange}
              itemId={item.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundImage: `
                  repeating-linear-gradient(0deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 2.5rem),
                  repeating-linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 2.5rem)
                `,
              }}
            >
              {item.component.props.children.map(renderElement)}
            </GridLayout>
          ) : item.component.type === 'rowStack' ? (
            <Stack
              direction="row"
              spacing={item.component.props.spacing ?? 1}
              sx={{
                height: '100%',
                width: '100%',
                overflow: 'auto',
                justifyContent: item.component.props.justifyContent ?? 'flex-start',
                alignItems: item.component.props.alignItems ?? 'center',
                flexWrap: item.component.props.wrap ?? 'nowrap',
                minHeight: 'fit-content',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 2.5rem)',
              }}
            >
              {item.component.props.children.map(renderElement)}
            </Stack>
          ) : item.component.type === 'colStack' ? (
            <Stack
              direction="column"
              spacing={item.component.props.spacing ?? 1}
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                justifyContent: item.component.props.justifyContent ?? 'flex-start',
                alignItems: item.component.props.alignItems ?? 'center',
                flexWrap: item.component.props.wrap ?? 'nowrap',
                minWidth: 'fit-content',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(25, 118, 210, 0.08) 0px, rgba(25, 118, 210, 0.08) 1px, transparent 1px, transparent 2.5rem)',
              }}
            >
              {item.component.props.children.map(renderElement)}
            </Stack>
          ) : item.component.type in componentMap ? (
            componentMap[item.component.type as keyof ComponentMapType].render(item.component.props as any)
          ) : null}
        </Box>
      </Box>
    );
  };

  return (
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
      {/* Left panel */}
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
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            {isScreenExplanationMode ? "レイアウト調整" : "コンポーネント追加"}
          </Typography>
        </Box>
        
        {isScreenExplanationMode ? (
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setItems(assignNumbersToItems(items))}
              startIcon={<FormatListNumberedIcon />}
              sx={{ mb: 2 }}
            >
              Z字に自動付番
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflow: 'auto',
            flex: 1,
          }}>
            {/* Layout components section */}
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
                  グリッド
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddComponent('colStack', 'col')}
                  startIcon={<AddBoxIcon />}
                >
                  縦スタック
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddComponent('rowStack', 'row')}
                  startIcon={<AddBoxIcon />}
                >
                  横スタック
                </Button>
              </Box>
            </Box>

            {/* Other components section */}
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
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddComponent('typography', 'typography')}
                  startIcon={<AddBoxIcon />}
                >
                  テキスト
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Main content area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
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
            <Button
              variant="outlined"
              onClick={handleShowSampleLayout}
              startIcon={<ViewComfyIcon/>}
            >
              サンプルレイアウト
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsScreenExplanationMode(prev => !prev)}
              startIcon={<HelpOutlineIcon />}
            >
              {isScreenExplanationMode ? "説明モード終了" : "説明モード開始"}
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

        {/* Grid layout area */}
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
            {isScreenExplanationMode && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}
              />
            )}
            <ResponsiveReactGridLayout
              isDraggable={isDraggableAndResizable() && !isScreenExplanationMode}
              isResizable={isDraggableAndResizable() && !isScreenExplanationMode}
              cols={cols}
              rowHeight={rowHeight}
              margin={margin}
              onLayoutChange={handleLayoutChange}
              compactType={null}
              preventCollision
              resizeHandles={isDraggableAndResizable() && !isScreenExplanationMode ? ['se'] : []}
            >
              {(isScreenExplanationMode ? assignNumbersToItems(items) : items).map(renderElement)}
            </ResponsiveReactGridLayout>
          </Box>
        </Box>
      </Box>

      {/* Right panel */}
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
        {isScreenExplanationMode ? (
          <Box>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                説明入力
              </Typography>
            </Box>
            {selectedItemId && (
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="番号"
                  size="small"
                  value={(findItemInTree(items, selectedItemId) as GridItemWithExplanation)?.explanationNumber ?? ''}
                  onChange={(e) => {
                    if (!selectedItemId) return;
                    const newItems = [...items];
                    const item = findItemInTree(newItems, selectedItemId) as GridItemWithExplanation;
                    if (!item) return;
                    item.explanationNumber = e.target.value || undefined;
                    setItems(newItems);
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="項目名称"
                  size="small"
                  value={(findItemInTree(items, selectedItemId) as GridItemWithExplanation)?.explanation?.title ?? ''}
                  onChange={(e) => {
                    if (!selectedItemId) return;
                    const newItems = [...items];
                    const item = findItemInTree(newItems, selectedItemId) as GridItemWithExplanation;
                    if (!item) return;
                    item.explanation = {
                      ...item.explanation ?? {},
                      title: e.target.value || undefined
                    };
                    setItems(newItems);
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="説明"
                  multiline
                  rows={4}
                  size="small"
                  value={(findItemInTree(items, selectedItemId) as GridItemWithExplanation)?.explanation?.description ?? ''}
                  onChange={(e) => {
                    if (!selectedItemId) return;
                    const newItems = [...items];
                    const item = findItemInTree(newItems, selectedItemId) as GridItemWithExplanation;
                    if (!item) return;
                    item.explanation = {
                      ...item.explanation ?? {},
                      description: e.target.value || undefined
                    };
                    setItems(newItems);
                  }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <ComponentSettingsPanel
            selectedItem={selectedItemId ? findItemInTree(items, selectedItemId) : null}
            onUpdate={handleUpdateProps}
          />
        )}
      </Box>
    </Box>
  );
};

export default ComponentEditor;
