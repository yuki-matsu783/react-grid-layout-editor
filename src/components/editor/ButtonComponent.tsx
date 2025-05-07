import React from 'react';
import {
  Box,
  Button,
  Typography,
  ButtonGroup,
  TextField,
} from '@mui/material';
import type { ButtonProps, BaseComponent } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';

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
        {/* 共通レイアウト設定 */}
        <CommonLayoutSettings props={props} onUpdate={onUpdate} />
          <Typography variant="body2" gutterBottom>基本設定</Typography>

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
