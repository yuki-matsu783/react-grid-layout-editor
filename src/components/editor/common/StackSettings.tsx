import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { StackBaseProps } from '../../../types';

/**
 * Stack特有の設定UIコンポーネントのプロパティ
 * @property props - 現在の設定値を含むStackプロパティ
 * @property onUpdate - 設定値が変更された時のコールバック関数
 */
interface StackSettingsProps {
  props: StackBaseProps;
  onUpdate: (newProps: Partial<StackBaseProps>) => void;
}

/**
 * Stack特有の設定UIコンポーネント
 * - アイテム間のスペース設定
 * - アイテムの配置設定
 * - 主軸方向の配置設定
 * - 折り返し設定
 */
export const StackSettings: React.FC<StackSettingsProps> = ({ props, onUpdate }) => {
  // アコーディオンの展開状態を管理
  const [expanded, setExpanded] = React.useState(false);

  // スタックコンポーネント特有の設定値の初期値
  const defaultProps = {
    spacing: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    wrap: 'nowrap'
  } as const;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      elevation={0}
      sx={{ bgcolor: 'background.default' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">Stack設定</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* アイテム間のスペース設定 */}
        <Box sx={{ px: 1, mb: 3 }}>
          <FormControl fullWidth size="small">

            <TextField
            label="スペース (rem)"
              value={props.spacing ?? defaultProps.spacing}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 10) {
                  onUpdate({ spacing: value });
                }
              }}
              type="number"
              inputProps={{
                min: 0,
                max: 10,
                step: 0.1
              }}
              size="small"
            />
          </FormControl>
        </Box>

        {/* アイテムの配置設定 */}
        <Box sx={{ px: 1, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>アイテムの配置</InputLabel>
            <Select
              value={props.alignItems ?? defaultProps.alignItems}
              onChange={(e) => onUpdate({ alignItems: e.target.value as 'flex-start' | 'center' | 'flex-end' | 'stretch' })}
              label="アイテムの配置"
            >
              <MenuItem value="flex-start">上/左</MenuItem>
              <MenuItem value="center">中央</MenuItem>
              <MenuItem value="flex-end">下/右</MenuItem>
              <MenuItem value="stretch">広げる</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 主軸方向の配置設定 */}
        <Box sx={{ px: 1, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>主軸方向の配置</InputLabel>
            <Select
              value={props.justifyContent ?? defaultProps.justifyContent}
              onChange={(e) => onUpdate({ justifyContent: e.target.value as 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' })}
              label="主軸方向の配置"
            >
              <MenuItem value="flex-start">開始</MenuItem>
              <MenuItem value="center">中央</MenuItem>
              <MenuItem value="flex-end">終了</MenuItem>
              <MenuItem value="space-between">均等</MenuItem>
              <MenuItem value="space-around">周囲均等</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 折り返し設定 */}
        <Box sx={{ px: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={(props.wrap ?? defaultProps.wrap) === 'wrap'}
                onChange={(e) => onUpdate({ wrap: e.target.checked ? 'wrap' : 'nowrap' })}
              />
            }
            label="折り返し"
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
