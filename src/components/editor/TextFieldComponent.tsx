import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import type { TextFieldProps, BaseComponent } from '../../types';

/**
 * テキストフィールドコンポーネントの実装
 */
class TextFieldComponent implements BaseComponent<TextFieldProps> {
  /**
   * テキストフィールドをレンダリングする
   * @param props テキストフィールドのプロパティ
   */
  render(props: TextFieldProps): React.ReactNode {
    const {
      label,
      placeholder,
      variant,
      type,
      multiline,
      rows,
      disabled,
      required,
      widthPercentage,
      heightPercentage,
      horizontalAlign,
      verticalAlign,
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
        <TextField
          label={label}
          placeholder={placeholder}
          variant={variant}
          type={type}
          multiline={multiline}
          rows={rows}
          disabled={disabled}
          required={required}
          sx={{
            width: `${widthPercentage}%`,
            height: multiline ? `${heightPercentage}%` : 'auto',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </Box>
    );
  }

  /**
   * テキストフィールドの設定UIをレンダリングする
   * @param props 現在のプロパティ
   * @param onUpdate プロパティ更新時のコールバック
   */
  renderSettings(
    props: TextFieldProps,
    onUpdate: (newProps: Partial<TextFieldProps>) => void
  ): React.ReactNode | null {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 基本設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>基本設定</Typography>
          <TextField
            size="small"
            fullWidth
            label="ラベル"
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            sx={{ mb: 1 }}
          />
          <TextField
            size="small"
            fullWidth
            label="プレースホルダー"
            value={props.placeholder ?? ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </Box>

        {/* スタイル設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>スタイル設定</Typography>
          <FormControl size="small" fullWidth sx={{ mb: 1 }}>
            <InputLabel>スタイル</InputLabel>
            <Select
              value={props.variant}
              label="スタイル"
              onChange={(e) => onUpdate({ variant: e.target.value as 'outlined' | 'filled' | 'standard' })}
            >
              <MenuItem value="outlined">枠線付き</MenuItem>
              <MenuItem value="filled">塗りつぶし</MenuItem>
              <MenuItem value="standard">標準</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>入力タイプ</InputLabel>
            <Select
              value={props.type}
              label="入力タイプ"
              onChange={(e) => onUpdate({ type: e.target.value as 'text' | 'password' | 'number' | 'email' })}
            >
              <MenuItem value="text">テキスト</MenuItem>
              <MenuItem value="password">パスワード</MenuItem>
              <MenuItem value="number">数値</MenuItem>
              <MenuItem value="email">メール</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* マルチライン設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>テキストエリア設定</Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={props.multiline}
                onChange={(e) => onUpdate({ multiline: e.target.checked })}
              />
            }
            label={<Typography variant="body2">複数行入力を許可</Typography>}
          />
          {props.multiline && (
            <TextField
              size="small"
              fullWidth
              type="number"
              label="行数"
              value={props.rows ?? 3}
              onChange={(e) => onUpdate({ rows: parseInt(e.target.value, 10) })}
              sx={{ mt: 1 }}
            />
          )}
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

        {/* その他の設定 */}
        <Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={props.disabled ?? false}
                  onChange={(e) => onUpdate({ disabled: e.target.checked })}
                />
              }
              label={<Typography variant="body2">入力を無効化</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={props.required ?? false}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                />
              }
              label={<Typography variant="body2">必須入力</Typography>}
            />
          </Box>
        </Box>
      </Box>
    );
  }
}

// シングルトンインスタンスをエクスポート
export default new TextFieldComponent();