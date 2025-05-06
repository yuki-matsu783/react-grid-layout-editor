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
      disabled
    } = props;

    return (
      <Button
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        sx={{
          width: '100%',
          height: '100%'
        }}
      >
        {label}
      </Button>
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* テキスト設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>テキスト</Typography>
          <TextField
            size="small"
            fullWidth
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            sx={{ mb: 1 }}
          />
        </Box>

        {/* サイズ設定 */}
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

        {/* 配置設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>配置</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>水平</InputLabel>
              <Select
                value={props.horizontalAlign}
                label="水平"
                onChange={(e) => onUpdate({ horizontalAlign: e.target.value as 'start' | 'center' | 'end' })}
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
                onChange={(e) => onUpdate({ verticalAlign: e.target.value as 'start' | 'center' | 'end' })}
              >
                <MenuItem value="start">上寄せ</MenuItem>
                <MenuItem value="center">中央</MenuItem>
                <MenuItem value="end">下寄せ</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* スタイル設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>スタイル</Typography>
          <ButtonGroup size="small" variant="outlined" fullWidth sx={{ mb: 1 }}>
            {(['contained', 'outlined', 'text'] as const).map((v) => (
              <Button
                key={v}
                onClick={() => onUpdate({ variant: v })}
                color={props.variant === v ? 'primary' : 'inherit'}
                sx={{ fontSize: '0.75rem' }}
              >
                {v}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined" fullWidth sx={{ mb: 1 }}>
            {(['primary', 'secondary', 'error'] as const).map((c) => (
              <Button
                key={c}
                onClick={() => onUpdate({ color: c })}
                color={props.color === c ? c : 'inherit'}
                sx={{ fontSize: '0.75rem' }}
              >
                {c}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined" fullWidth>
            {(['small', 'medium', 'large'] as const).map((s) => (
              <Button
                key={s}
                onClick={() => onUpdate({ size: s })}
                color={props.size === s ? 'primary' : 'inherit'}
                sx={{ fontSize: '0.75rem' }}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        {/* その他の設定 */}
        <Box>
          <Button
            size="small"
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
