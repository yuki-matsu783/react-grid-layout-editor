import React from 'react';
import { 
  Box, 
  Typography,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  const [widthValue, setWidthValue] = React.useState<string>(
    props.width !== undefined ? props.width.toString() : 'auto'
  );
  const [heightValue, setHeightValue] = React.useState<string>(
    props.height !== undefined ? props.height.toString() : 'auto'
  );

  // 親プロパティが変化したらローカル状態を更新
  React.useEffect(() => {
    setWidthValue(props.width !== undefined ? props.width.toString() : 'auto');
    setHeightValue(props.height !== undefined ? props.height.toString() : 'auto');
  }, [props.width, props.height]);

  // サイズ設定を処理する関数
  const handleSizeChange = (
    type: 'width' | 'height',
    value: string
  ) => {
    const prop = type === 'width' ? 'width' : 'height';
    
    console.log(`Updating ${prop} to:`, value);
    
    // ローカル状態を更新
    if (type === 'width') {
      setWidthValue(value);
    } else {
      setHeightValue(value);
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

  // アコーディオンの展開状態を管理
  const [absoluteExpanded, setAbsoluteExpanded] = React.useState(false);
  const [relativeExpanded, setRelativeExpanded] = React.useState(false);

  return (
    <Stack spacing={1}>
      {/* 絶対サイズ設定 */}
      <Accordion
        expanded={absoluteExpanded}
        onChange={(_, isExpanded) => setAbsoluteExpanded(isExpanded)}
        elevation={0}
        sx={{ bgcolor: 'background.default' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">絶対サイズ設定</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              幅（rem または "auto"）
            </Typography>
            <TextField
              value={widthValue}
              onChange={(e) => setWidthValue(e.target.value)}
              onFocus={() => {
                if (widthValue === 'auto') {
                  setWidthValue('');
                }
              }}
              onBlur={() => {
                if (!widthValue || widthValue === '') {
                  setWidthValue('auto');
                  onUpdate({ width: 'auto' });
                } else if (/^\d*\.?\d+$/.test(widthValue)) {
                  const withUnit = `${widthValue}rem`;
                  setWidthValue(withUnit);
                  onUpdate({ width: withUnit });
                }
              }}
              size="small"
              fullWidth
              placeholder="auto"
              helperText="「auto」または数値（単位: rem）を入力"
            />
          </Box>
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              高さ（rem または "auto"）
            </Typography>
            <TextField
              value={heightValue}
              onChange={(e) => setHeightValue(e.target.value)}
              onFocus={() => {
                if (heightValue === 'auto') {
                  setHeightValue('');
                }
              }}
              onBlur={() => {
                if (!heightValue || heightValue === '') {
                  setHeightValue('auto');
                  onUpdate({ height: 'auto' });
                } else if (/^\d*\.?\d+$/.test(heightValue)) {
                  const withUnit = `${heightValue}rem`;
                  setHeightValue(withUnit);
                  onUpdate({ height: withUnit });
                }
              }}
              size="small"
              fullWidth
              placeholder="auto"
              helperText="「auto」または数値（単位: rem）を入力"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 相対サイズ・パディング・配置設定 */}
      <Accordion
        expanded={relativeExpanded}
        onChange={(_, isExpanded) => setRelativeExpanded(isExpanded)}
        elevation={0}
        sx={{ bgcolor: 'background.default' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">相対サイズ・配置設定</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* 相対サイズ設定 */}
          <Box sx={{ px: 1, mb: 3 }}>
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
          <Box sx={{ px: 1, mb: 3 }}>
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

          {/* パディング設定 */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>パディング設定</Typography>
          <Box sx={{ px: 1, mb: 3 }}>
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

          {/* 配置設定 */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>配置設定</Typography>
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
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
