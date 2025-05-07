import React from 'react';
import { 
  Box, 
  Typography,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Paper
} from '@mui/material';
import type { BaseLayoutProps, ComponentAlignment } from '../../../types';

/**
 * 共通レイアウト設定のプロパティ
 * @property props - 現在の設定値を含むベースレイアウトプロパティ
 * @property onUpdate - 設定値が変更された時のコールバック関数
 */
interface CommonLayoutSettingsProps {
  props: BaseLayoutProps;
  onUpdate: (newProps: Partial<BaseLayoutProps>) => void;
}

/**
 * 共通のレイアウト設定UIコンポーネント
 * グリッドレイアウト内のコンポーネントの表示設定を管理する
 * 
 * 提供する設定:
 * - サイズ設定: コンポーネントの幅と高さをパーセンテージで指定
 * - 配置設定: 水平・垂直方向の配置位置を指定
 * 
 * @param props - 現在の設定値
 * @param onUpdate - 設定値が更新された時のコールバック
 */
export const CommonLayoutSettings: React.FC<CommonLayoutSettingsProps> = ({ props, onUpdate }) => {
  return (
    <Stack spacing={2}>
      {/* サイズ設定セクション */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
        <Box>
          {/* セクションタイトル */}
          <Typography variant="subtitle2" gutterBottom>サイズ設定</Typography>
          {/* 幅設定スライダー */}
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              幅 ({props.widthPercentage}%)
            </Typography>
            <Slider
              value={props.widthPercentage}
              min={1}
              max={100}
              onChange={(_, value) => onUpdate({ widthPercentage: value as number })}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              高さ ({props.heightPercentage}%)
            </Typography>
            <Slider
              value={props.heightPercentage}
              min={1}
              max={100}
              onChange={(_, value) => onUpdate({ heightPercentage: value as number })}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
        </Box>
      </Paper>

      {/* 配置設定セクション */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
        <Box>
          {/* セクションタイトル */}
          <Typography variant="subtitle2" gutterBottom>配置設定</Typography>
          {/* 水平方向の配置設定 */}
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              水平方向の配置
            </Typography>
            <ToggleButtonGroup
              value={props.horizontalAlign}
              exclusive
              onChange={(_, value) => value && onUpdate({ horizontalAlign: value as ComponentAlignment })}
              fullWidth
              size="small"
            >
              <ToggleButton value="start">左</ToggleButton>
              <ToggleButton value="center">中央</ToggleButton>
              <ToggleButton value="end">右</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 垂直方向の配置設定 */}
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              垂直方向の配置
            </Typography>
            <ToggleButtonGroup
              value={props.verticalAlign}
              exclusive
              onChange={(_, value) => value && onUpdate({ verticalAlign: value as ComponentAlignment })}
              fullWidth
              size="small"
            >
              <ToggleButton value="start">上</ToggleButton>
              <ToggleButton value="center">中央</ToggleButton>
              <ToggleButton value="end">下</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
};
