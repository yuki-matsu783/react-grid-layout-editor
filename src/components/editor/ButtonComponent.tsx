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
 * グリッドレイアウト内で使用できるボタンコンポーネントを提供する
 */
const ButtonComponent: BaseComponent<ButtonProps> = {
  /**
   * ボタンコンポーネントをレンダリングする
   * @param props - ボタンのプロパティ（スタイル、テキスト、状態など）
   * @returns レンダリングされたボタンコンポーネント
   */
  render: (props: ButtonProps) => {
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
  },

  /**
   * ボタンコンポーネントの設定UIをレンダリングする
   * @param props - 現在のボタンのプロパティ
   * @param onUpdate - プロパティ更新時のコールバック関数
   * @returns レンダリングされた設定UI
   */
  renderSettings: (
    props: ButtonProps,
    onUpdate: (newProps: Partial<ButtonProps>) => void
  ) => {
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
          {/* ボタンの種類（variant）設定 */}
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

          {/* 色（color）設定 */}
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

          {/* サイズ（size）設定 */}
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
};

export default ButtonComponent;
