import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { BaseLayoutProps, ComponentAlignment } from '../../../types';

interface CommonLayoutSettingsProps {
  props: BaseLayoutProps;
  onUpdate: (newProps: Partial<BaseLayoutProps>) => void;
}

/**
 * 共通のレイアウト設定UIコンポーネント
 * サイズ（幅・高さ）と配置（水平・垂直）の設定を提供
 */
export const CommonLayoutSettings: React.FC<CommonLayoutSettingsProps> = ({ props, onUpdate }) => {
  return (
    <>
      {/* 配置設定 */}
      {/* サイズ設定 */}
      <Typography variant="body2" gutterBottom>配置</Typography>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          幅: {props.widthPercentage}%
        </Typography>
        <Slider
          size="small"
          value={props.widthPercentage}
          onChange={(_, value) => onUpdate({ widthPercentage: value as number })}
          min={10}
          max={100}
          step={1}
          sx={{ py: 0.5 }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
          高さ: {props.heightPercentage}%
        </Typography>
        <Slider
          size="small"
          value={props.heightPercentage}
          onChange={(_, value) => onUpdate({ heightPercentage: value as number })}
          min={10}
          max={100}
          step={1}
          sx={{ py: 0.5 }}
        />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>水平</InputLabel>
            <Select
              value={props.horizontalAlign}
              label="水平"
              onChange={(e) => onUpdate({ horizontalAlign: e.target.value as ComponentAlignment })}
            >
              <MenuItem value="start">左寄せ</MenuItem>
              <MenuItem value="center">中央</MenuItem>
              <MenuItem value="end">右寄せ</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>垂直</InputLabel>
            <Select
              value={props.verticalAlign}
              label="垂直"
              onChange={(e) => onUpdate({ verticalAlign: e.target.value as ComponentAlignment })}
            >
              <MenuItem value="start">上寄せ</MenuItem>
              <MenuItem value="center">中央</MenuItem>
              <MenuItem value="end">下寄せ</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </>
  );
};
