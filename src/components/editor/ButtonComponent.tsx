import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import type { ButtonProps, BaseComponent, ParentType } from '../../types';
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
          height: '2rem'
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
    onUpdate: (newProps: Partial<ButtonProps>) => void,
    parentType: ParentType
  ) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 共通レイアウト設定 */}
        <CommonLayoutSettings props={props} onUpdate={onUpdate} parentType={parentType} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>基本設定</Typography>

          {/* テキスト設定 */}
          <TextField
            size="small"
            fullWidth
            label="ボタンテキスト"
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            sx={{ mb: 1.5 }}
          />
        </Box>

        {/* スタイル設定 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>スタイル設定</Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>ボタンの種類</InputLabel>
            <Select
              value={props.variant}
              label="ボタンの種類"
              onChange={(e) => onUpdate({ variant: e.target.value as 'contained' | 'outlined' | 'text' })}
            >
              <MenuItem value="contained">塗りつぶし</MenuItem>
              <MenuItem value="outlined">枠線付き</MenuItem>
              <MenuItem value="text">テキスト</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>サイズ</InputLabel>
            <Select
              value={props.size}
              label="サイズ"
              onChange={(e) => onUpdate({ size: e.target.value as 'small' | 'medium' | 'large' })}
            >
              <MenuItem value="small">小</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="large">大</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" gutterBottom>カラー</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={props.color}
              onChange={(e) => onUpdate({ color: e.target.value as 'primary' | 'secondary' | 'error' })}
            >
              <MenuItem value="primary">プライマリ</MenuItem>
              <MenuItem value="secondary">セカンダリ</MenuItem>
              <MenuItem value="error">エラー</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* その他の設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>その他の設定</Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={props.disabled || false}
                onChange={(e) => onUpdate({ disabled: e.target.checked })}
              />
            }
            label={<Typography variant="body2">無効化</Typography>}
          />
        </Box>
      </Box>
    );
  }
};

export default ButtonComponent;
