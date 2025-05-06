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
import type { 
  GridLayoutProps,
  ComponentAlignment,
  BaseComponent 
} from '../../types';

const GridLayoutComponent: BaseComponent<GridLayoutProps> = {
  render: (props: GridLayoutProps) => {
    return null; // レンダリングは不要（GridLayoutは独自にレンダリング）
  },

  renderSettings: (props: GridLayoutProps, onUpdate: (newProps: Partial<GridLayoutProps>) => void) => {
    return (
      <Stack spacing={2}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>サイズ設定</Typography>
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

        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>配置設定</Typography>
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
                <ToggleButton value="start">
                  左
                </ToggleButton>
                <ToggleButton value="center">
                  中央
                </ToggleButton>
                <ToggleButton value="end">
                  右
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

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
                <ToggleButton value="start">
                  上
                </ToggleButton>
                <ToggleButton value="center">
                  中央
                </ToggleButton>
                <ToggleButton value="end">
                  下
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Paper>
      </Stack>
    );
  }
};

export default GridLayoutComponent;