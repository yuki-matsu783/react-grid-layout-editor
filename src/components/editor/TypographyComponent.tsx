import React from 'react';
import { 
  Box, 
  Typography,
  FormControl, 
  InputLabel,
  Select, 
  MenuItem, 
  TextField, 
  FormControlLabel, 
  Switch 
} from '@mui/material';
import type { TypographyProps, BaseComponent, ParentType } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';

/**
 * Typographyコンポーネントの実装
 * MUIのTypographyコンポーネントをラップし、エディタ用の機能を追加
 */
const TypographyComponent: BaseComponent<TypographyProps> = {
  /**
   * コンポーネントのレンダリング
   * @param props Typographyコンポーネントのプロパティ
   */
  render: (props: TypographyProps) => {
    const { 
      variant,
      text,
      color,
      align,
      gutterBottom,
    } = props;
    
    return (
      <Typography
        variant={variant}
        color={color}
        align={align}
        gutterBottom={gutterBottom}
      >
        {text}
      </Typography>
    );
  },

  /**
   * 設定パネルのレンダリング
   * @param props 現在のプロパティ
   * @param onUpdate プロパティ更新時のコールバック
   * @param parentType 親要素のタイプ
   */
  renderSettings: (props: TypographyProps, onUpdate: (newProps: Partial<TypographyProps>) => void, parentType: ParentType) => {
    // コンソール出力で設定変更を確認できるようにする
    const handleUpdate = (newProps: Partial<TypographyProps>) => {
      console.log('Typography settings before update:', props);
      console.log('Typography settings updating with:', newProps);
      onUpdate(newProps);
      console.log('Typography settings after update called');
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <CommonLayoutSettings props={props} onUpdate={handleUpdate} parentType={parentType} />
        
        <Typography variant="body2" gutterBottom>基本設定</Typography>

        {/* テキストの入力 */}
        <Box>
          <TextField
            size="small"
            fullWidth
            label="テキスト"
            value={props.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            sx={{ mb: 1 }}
          />
        </Box>

        {/* スタイル設定 */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>スタイル設定</Typography>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel>テキストの種類</InputLabel>
          <Select
            value={props.variant}
            label="テキストの種類"
            onChange={(e) => handleUpdate({ variant: e.target.value as TypographyProps['variant'] })}
          >
            <MenuItem value="h1">見出し1</MenuItem>
            <MenuItem value="h2">見出し2</MenuItem>
            <MenuItem value="h3">見出し3</MenuItem>
            <MenuItem value="h4">見出し4</MenuItem>
            <MenuItem value="h5">見出し5</MenuItem>
            <MenuItem value="h6">見出し6</MenuItem>
            <MenuItem value="subtitle1">サブタイトル1</MenuItem>
            <MenuItem value="subtitle2">サブタイトル2</MenuItem>
            <MenuItem value="body1">本文1</MenuItem>
            <MenuItem value="body2">本文2</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel>文字色</InputLabel>
          <Select
            value={props.color || 'text.primary'}
            label="文字色"
            onChange={(e) => handleUpdate({ color: e.target.value as TypographyProps['color'] })}
          >
            <MenuItem value="primary">プライマリ</MenuItem>
            <MenuItem value="secondary">セカンダリ</MenuItem>
            <MenuItem value="error">エラー</MenuItem>
            <MenuItem value="text.primary">テキスト（標準）</MenuItem>
            <MenuItem value="text.secondary">テキスト（薄色）</MenuItem>
          </Select>
        </FormControl>

        {/* テキストの配置 */}
        <FormControl fullWidth size="small">
          <InputLabel>テキスト配置</InputLabel>
          <Select
            value={props.align || 'left'}
            label="テキスト配置"
            onChange={(e) => handleUpdate({ align: e.target.value as TypographyProps['align'] })}
          >
            <MenuItem value="left">左寄せ</MenuItem>
            <MenuItem value="center">中央寄せ</MenuItem>
            <MenuItem value="right">右寄せ</MenuItem>
            <MenuItem value="justify">両端揃え</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>追加設定</Typography>

        <FormControlLabel
          control={
            <Switch
              checked={props.gutterBottom || false}
              onChange={(e) => handleUpdate({ gutterBottom: e.target.checked })}
            />
          }
          label="下部マージンを追加"
        />
      </Box>
    );
  }
};

export default TypographyComponent;
