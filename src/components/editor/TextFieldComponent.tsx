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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 基本設定 */}
        <Box>
          <Typography gutterBottom variant="subtitle2">基本設定</Typography>
          <TextField
            fullWidth
            label="ラベル"
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="プレースホルダー"
            value={props.placeholder ?? ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </Box>

        {/* スタイル設定 */}
        <Box>
          <Typography gutterBottom variant="subtitle2">スタイル設定</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
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

          <FormControl fullWidth>
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
          <Typography gutterBottom variant="subtitle2">テキストエリア設定</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={props.multiline}
                onChange={(e) => onUpdate({ multiline: e.target.checked })}
              />
            }
            label="複数行入力を許可"
          />
          {props.multiline && (
            <TextField
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
          <Typography gutterBottom variant="subtitle2">サイズ設定</Typography>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            幅 ({props.widthPercentage}%)
          </Typography>
          <Slider
            value={props.widthPercentage}
            onChange={(_, value) => onUpdate({ widthPercentage: value as number })}
            min={10}
            max={100}
            step={1}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="textSecondary" gutterBottom>
            高さ ({props.heightPercentage}%)
          </Typography>
          <Slider
            value={props.heightPercentage}
            onChange={(_, value) => onUpdate({ heightPercentage: value as number })}
            min={10}
            max={100}
            step={1}
          />
        </Box>

        {/* 配置設定 */}
        <Box>
          <Typography gutterBottom variant="subtitle2">配置設定</Typography>
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
        </Box>

        {/* その他の設定 */}
        <Box>
          <Typography gutterBottom variant="subtitle2">その他の設定</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={props.disabled ?? false}
                  onChange={(e) => onUpdate({ disabled: e.target.checked })}
                />
              }
              label="入力を無効化"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={props.required ?? false}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                />
              }
              label="必須入力"
            />
          </Box>
        </Box>
      </Box>
    );
  }
}

// シングルトンインスタンスをエクスポート
export default new TextFieldComponent();