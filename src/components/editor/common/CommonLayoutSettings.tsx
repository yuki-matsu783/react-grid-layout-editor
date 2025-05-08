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
 * @property parentType - 親要素のタイプ（grid または stack）
 */
interface CommonLayoutSettingsProps {
  props: BaseLayoutProps;
  onUpdate: (newProps: Partial<BaseLayoutProps>) => void;
  parentType: ParentType;
}

/**
 * 親タイプに基づいたデフォルト値を取得
 * root: width/height = 100%, percentage = 100%　　(エディタ全体のサイズをベース)
 * grid: width/height = 100%, percentage = 90%　　(グリッドの大きさをベースにしている)
 * stack: width/height = auto, percentage = 100%　(含まれる要素の大きさをベースにしている)
 */
const getDefaultProps = (parentType: ParentType): Partial<BaseLayoutProps> => {
  if (parentType === 'root') {
    return {
      width: '100%',
      height: '100%',
      widthPercentage: 100,
      heightPercentage: 100
    };
  }
  
  if (parentType === 'grid') {
    return {
      width: '100%',
      height: '100%',
      widthPercentage: 90,
      heightPercentage: 90
    };
  }
  
  // stack
  return {
    width: 'auto',
    height: 'auto',
    widthPercentage: 100,
    heightPercentage: 100
  };
};

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
  const defaults = getDefaultProps(parentType);

  // ローカルの状態を追加して値の変更をトラッキング
  const [widthValue, setWidthValue] = React.useState<string>(
    props.width ?? defaults.width as string
  );
  const [heightValue, setHeightValue] = React.useState<string>(
    props.height ?? defaults.height as string
  );

  // 親プロパティまたは親タイプが変化したらローカル状態を更新
  React.useEffect(() => {
    const defaults = getDefaultProps(parentType);
    setWidthValue(props.width ?? defaults.width as string);
    setHeightValue(props.height ?? defaults.height as string);
  }, [props.width, props.height, parentType]);

  // プロパティが未設定の場合のデフォルト値
  const defaultBaseProps = {
    widthPercentage: 100,
    heightPercentage: 100,
    horizontalAlign: 'center' as const,
    verticalAlign: 'center' as const
  };

  // コンポーネントのマウント時と親タイプの変更時に適切なデフォルト値を設定
  React.useEffect(() => {
    const updates: Partial<BaseLayoutProps> = {};
    if (props.widthPercentage === undefined) updates.widthPercentage = defaultBaseProps.widthPercentage;
    if (props.heightPercentage === undefined) updates.heightPercentage = defaultBaseProps.heightPercentage;
    if (props.horizontalAlign === undefined) updates.horizontalAlign = defaultBaseProps.horizontalAlign;
    if (props.verticalAlign === undefined) updates.verticalAlign = defaultBaseProps.verticalAlign;

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
  }, []);

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
              幅(rem または "auto")
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
              disabled={parentType === 'root' || parentType === 'grid'}
            />
          </Box>
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              高さ(rem または "auto")
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
              disabled={parentType === 'root' || parentType === 'grid'}
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
          幅 ({props.widthPercentage ?? getDefaultProps(parentType).widthPercentage}%)
        </Typography>
        <Slider
          value={props.widthPercentage ?? defaultBaseProps.widthPercentage}
          min={1}
          max={100}
          onChange={(_, value) => onUpdate({ widthPercentage: value as number })}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>
      <Box sx={{ px: 1, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          高さ ({props.heightPercentage ?? getDefaultProps(parentType).heightPercentage}%)
        </Typography>
        <Slider
          value={props.heightPercentage ?? defaultBaseProps.heightPercentage}
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
              value={props.horizontalAlign ?? defaultBaseProps.horizontalAlign}
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
              value={props.verticalAlign ?? defaultBaseProps.verticalAlign}
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
