import React from 'react';
import {
  Box,
  Button,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ButtonGroup,
  TextField,
} from '@mui/material';
import type { ButtonProps, BaseComponent } from '../../types';

/**
 * ボタンコンポーネントの実装
 */
class ButtonComponent implements BaseComponent<ButtonProps> {
  /**
   * ボタンをレンダリングする
   * @param props ボタンのプロパティ
   */
  render(props: ButtonProps): React.ReactNode {
    const {
      variant,
      color,
      label,
      size,
      widthPercentage,
      heightPercentage,
      horizontalAlign,
      verticalAlign,
      disabled
    } = props;

    // 水平・垂直方向の配置設定をflexboxのalignmentに変換
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    return (
      <Box sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems,
        justifyContent
      }}>
        <Button
          variant={variant}
          color={color}
          size={size}
          disabled={disabled}
          sx={{
            width: `${widthPercentage}%`,
            height: `${heightPercentage}%`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          {label}
        </Button>
      </Box>
    );
  }

  /**
   * ボタンの設定UIをレンダリングする
   * @param props 現在のプロパティ
   * @param onUpdate プロパティ更新時のコールバック
   */
  renderSettings(
    props: ButtonProps,
    onUpdate: (newProps: Partial<ButtonProps>) => void
  ): React.ReactNode | null {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* テキスト設定 */}
        <Box>
          <TextField
            fullWidth
            label="ラベル"
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </Box>

        {/* サイズ設定 */}
        <Box>
          <Typography gutterBottom>幅 ({props.widthPercentage}%)</Typography>
          <Slider
            value={props.widthPercentage}
            onChange={(_, value) => onUpdate({ widthPercentage: value as number })}
            min={10}
            max={100}
            step={1}
          />
          <Typography gutterBottom>高さ ({props.heightPercentage}%)</Typography>
          <Slider
            value={props.heightPercentage}
            onChange={(_, value) => onUpdate({ heightPercentage: value as number })}
            min={10}
            max={100}
            step={1}
          />
        </Box>

        {/* 配置設定 */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>水平方向</InputLabel>
            <Select
              value={props.horizontalAlign}
              label="水平方向"
              onChange={(e) => onUpdate({ horizontalAlign: e.target.value as 'start' | 'center' | 'end' })}
            >
              <MenuItem value="start">左寄せ</MenuItem>
              <MenuItem value="center">中央</MenuItem>
              <MenuItem value="end">右寄せ</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>垂直方向</InputLabel>
            <Select
              value={props.verticalAlign}
              label="垂直方向"
              onChange={(e) => onUpdate({ verticalAlign: e.target.value as 'start' | 'center' | 'end' })}
            >
              <MenuItem value="start">上寄せ</MenuItem>
              <MenuItem value="center">中央</MenuItem>
              <MenuItem value="end">下寄せ</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* スタイル設定 */}
        <Box>
          <Typography gutterBottom>スタイル</Typography>
          <ButtonGroup variant="outlined" fullWidth sx={{ mb: 1 }}>
            {(['contained', 'outlined', 'text'] as const).map((v) => (
              <Button
                key={v}
                onClick={() => onUpdate({ variant: v })}
                color={props.variant === v ? 'primary' : 'inherit'}
              >
                {v}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup variant="outlined" fullWidth sx={{ mb: 1 }}>
            {(['primary', 'secondary', 'error'] as const).map((c) => (
              <Button
                key={c}
                onClick={() => onUpdate({ color: c })}
                color={props.color === c ? c : 'inherit'}
              >
                {c}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup variant="outlined" fullWidth>
            {(['small', 'medium', 'large'] as const).map((s) => (
              <Button
                key={s}
                onClick={() => onUpdate({ size: s })}
                color={props.size === s ? 'primary' : 'inherit'}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        {/* その他の設定 */}
        <Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onUpdate({ disabled: !props.disabled })}
            color={props.disabled ? 'primary' : 'inherit'}
          >
            無効化 {props.disabled ? 'ON' : 'OFF'}
          </Button>
        </Box>
      </Box>
    );
  }
}

// シングルトンインスタンスをエクスポート
export default new ButtonComponent();
