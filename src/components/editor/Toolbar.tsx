import React from 'react';
import { useAtom } from 'jotai';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CodeIcon from '@mui/icons-material/Code';
import SaveIcon from '@mui/icons-material/Save';
import {
  layoutAtom,
  selectionAtom,
  canUndoAtom,
  canRedoAtom,
  historyAtom,
  historyIndexAtom,
} from '../../store/atoms';
import { generateCode } from '../../utils/exportHelpers';

const Toolbar: React.FC = () => {
  const [pageLayout] = useAtom(layoutAtom);
  const [selection, setSelection] = useAtom(selectionAtom);
  const [canUndo] = useAtom(canUndoAtom);
  const [canRedo] = useAtom(canRedoAtom);
  const [history] = useAtom(historyAtom);
  const [historyIndex, setHistoryIndex] = useAtom(historyIndexAtom);

  const handleBreakpointChange = (event: SelectChangeEvent) => {
    setSelection({
      ...selection,
      breakpoint: event.target.value as string,
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleExport = () => {
    const code = generateCode(pageLayout);
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedLayout.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveLayout = () => {
    const layoutData = JSON.stringify(pageLayout, null, 2);
    const blob = new Blob([layoutData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <MuiToolbar variant="dense">
        <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>ブレークポイント</InputLabel>
          <Select
            value={selection.breakpoint}
            label="ブレークポイント"
            onChange={handleBreakpointChange}
          >
            <MenuItem value="xs">XS (&lt;600px)</MenuItem>
            <MenuItem value="sm">SM (≥600px)</MenuItem>
            <MenuItem value="md">MD (≥960px)</MenuItem>
            <MenuItem value="lg">LG (≥1280px)</MenuItem>
            <MenuItem value="xl">XL (≥1920px)</MenuItem>
          </Select>
        </FormControl>

        <ButtonGroup size="small" sx={{ mr: 2 }}>
          <Tooltip title="元に戻す">
            <span>
              <IconButton
                size="small"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="やり直し">
            <span>
              <IconButton
                size="small"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup size="small">
          <Tooltip title="コードを生成">
            <Button
              startIcon={<CodeIcon />}
              onClick={handleExport}
            >
              エクスポート
            </Button>
          </Tooltip>
          <Tooltip title="レイアウトを保存">
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSaveLayout}
            >
              保存
            </Button>
          </Tooltip>
        </ButtonGroup>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
