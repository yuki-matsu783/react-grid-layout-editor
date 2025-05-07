import React from 'react';
import { 
  Box, 
  Typography,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Paper
} from '@mui/material';
import type { BaseLayoutProps, ComponentAlignment, ParentType } from '../../../types';

/**
 * 共通レイアウト設定のプロパティ
 * @property props - 現在の設定値を含むベースレイアウトプロパティ
 * @property onUpdate - 設定値が変更された時のコールバック関数
 */
interface CommonLayoutSettingsProps {
  props: BaseLayoutProps;
  onUpdate: (newProps: Partial<BaseLayoutProps>) => void;
  parentType: ParentType;
}

/**
 * 共通のレイアウト設定UIコンポーネント
 * グリッドレイアウト内のコンポーネントの表示設定を管理する
 * 
 * 提供する設定:
 * - サイズ設定: コンポーネントの幅と高さをパーセンテージで指定
 * - 配置設定: 水平・垂直方向の配置位置を指定
 * - パディング設定: コンポーネント内部の余白をパーセンテージで指定
 * 
 * @param props - 現在の設定値
 * @param onUpdate - 設定値が更新された時のコールバック
 */
export const CommonLayoutSettings: React.FC<CommonLayoutSettingsProps> = ({ props, onUpdate, parentType }) => {
  // ローカルの状態を追加して値の変更をトラッキング
  const [stackWidthValue, setStackWidthValue] = React.useState<string>(
    props.stackWidth !== undefined ? props.stackWidth.toString() : 'auto'
  );
  const [stackHeightValue, setStackHeightValue] = React.useState<string>(
    props.stackHeight !== undefined ? props.stackHeight.toString() : 'auto'
  );

  // 親プロパティが変化したらローカル状態を更新
  React.useEffect(() => {
    setStackWidthValue(props.stackWidth !== undefined ? props.stackWidth.toString() : 'auto');
    setStackHeightValue(props.stackHeight !== undefined ? props.stackHeight.toString() : 'auto');
  }, [props.stackWidth, props.stackHeight]);

  // Stack内のサイズ設定を処理する関数
  const handleStackSizeChange = (
    type: 'width' | 'height',
    value: string
  ) => {
    const prop = type === 'width' ? 'stackWidth' : 'stackHeight';
    
    console.log(`Updating ${prop} to:`, value);
    
    // ローカル状態を更新
    if (type === 'width') {
      setStackWidthValue(value);
    } else {
      setStackHeightValue(value);
    }
    
    // 空またはautoの場合は'auto'に設定
    if (!value || value === 'auto') {
      onUpdate({ [prop]: 'auto' });
      return;
    }
    
    // 数値の場合はrem単位として処理
    // 数値だけ入力された場合は、自動的にrem単位を付与
    if (/^\d*\.?\d+$/.test(value)) {
      const remValue = `${value}rem`;
      onUpdate({ [prop]: remValue });
      return;
    }
    
    // すでに単位がついている場合（rem, px, em, %など）はそのまま渡す
    if (/^\d*\.?\d+(rem|px|em|%|vh|vw)$/.test(value)) {
      onUpdate({ [prop]: value });
    }
  };

  return (
    <Stack spacing={2}>
      {/* サイズ設定セクション */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
        <Box>
          {/* セクションタイトル */}
          <Typography variant="subtitle2" gutterBottom>サイズ設定</Typography>
          {parentType === 'grid' ? (
            <>
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
              {/* 高さ設定スライダー */}
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
            </>
          ) : (
            <>
              {/* Stack用のサイズ設定（rem単位またはauto） */}
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  幅（rem または "auto"）
                </Typography>
                <TextField
                  value={stackWidthValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    console.log('前: stackWidth =', props.stackWidth);
                    handleStackSizeChange('width', e.target.value);
                    // 遅延してログを出力して値の変更を確認
                    setTimeout(() => {
                      console.log('後: stackWidth =', props.stackWidth);
                    }, 100);
                  }}
                  size="small"
                  fullWidth
                  placeholder="auto"
                  helperText="「auto」または数値（単位: rem）を入力"
                />
              </Box>
              {/* 高さ設定 */}
              <Box sx={{ px: 1, mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  高さ（rem または "auto"）
                </Typography>
                <TextField
                  value={stackHeightValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    console.log('前: stackHeight =', props.stackHeight);
                    handleStackSizeChange('height', e.target.value);
                    // 遅延してログを出力して値の変更を確認
                    setTimeout(() => {
                      console.log('後: stackHeight =', props.stackHeight);
                    }, 100);
                  }}
                  size="small"
                  fullWidth
                  placeholder="auto"
                  helperText="「auto」または数値（単位: rem）を入力"
                />
              </Box>
              
              {/* 従来のパーセンテージの幅高さも保持（内部用） */}
              <Box sx={{ px: 1, mt: 2, display: 'none' }}>
                <TextField
                  type="hidden"
                  value={props.widthPercentage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    onUpdate({ widthPercentage: value });
                  }}
                />
                <TextField
                  type="hidden"
                  value={props.heightPercentage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    onUpdate({ heightPercentage: value });
                  }}
                />
              </Box>
            </>
          )}
          {/* パディング設定スライダー */}
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              パディング ({props.paddingPercentage ?? 0}%)
            </Typography>
            <Slider
              value={props.paddingPercentage ?? 0}
              min={0}
              max={10}
              step={0.1}
              onChange={(_, value) => onUpdate({ paddingPercentage: value as number })}
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
