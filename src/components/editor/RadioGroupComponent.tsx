import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  ButtonGroup,
  TextField,
  IconButton,
  Stack,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { RadioGroupProps, BaseComponent } from '../../types';
import { CommonLayoutSettings } from './common/CommonLayoutSettings';

/**
 * ラジオグループコンポーネントの実装
 * グリッドレイアウト内で使用できるラジオグループコンポーネントを提供する
 */
const RadioGroupComponent: BaseComponent<RadioGroupProps> = {
  /**
   * ラジオグループコンポーネントをレンダリングする
   * @param props - ラジオグループのプロパティ（オプション、レイアウト、状態など）
   * @returns レンダリングされたラジオグループコンポーネント
   */
  render: (props: RadioGroupProps) => {
    const {
      label,
      options,
      value,
      row,
      disabled,
      required,
      color = 'primary'
    } = props;

    return (
      <FormControl
        required={required}
        disabled={disabled}
        sx={{
          display: 'flex',
          p: 1
        }}
      >
        <FormLabel>{label}</FormLabel>
          <RadioGroup
            row={row}
            value={value || ''}
            onChange={(e) => {
              console.log('ラジオグループの選択値:', e.target.value);
            }}
            sx={{
              alignItems: row ? 'center' : 'flex-start',
              justifyContent: 'flex-start'
            }}
          >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio color={color} />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  },

  /**
   * ラジオグループコンポーネントの設定UIをレンダリングする
   * @param props - 現在のラジオグループのプロパティ
   * @param onUpdate - プロパティ更新時のコールバック関数
   * @returns レンダリングされた設定UI
   */
  renderSettings: (
    props: RadioGroupProps,
    onUpdate: (newProps: Partial<RadioGroupProps>) => void
  ) => {
    /**
     * オプションを追加する
     */
    const handleAddOption = () => {
      const newOptions = [...props.options];
      const newIndex = newOptions.length + 1;
      newOptions.push({
        value: `option${newIndex}`,
        label: `オプション${newIndex}`
      });
      onUpdate({ options: newOptions });

      // 新規作成時はコンソールに追加を表示
      console.log('ラジオオプションを追加:', `option${newIndex}`);
    };

    /**
     * オプションを削除する
     * @param index 削除するオプションのインデックス
     */
    const handleDeleteOption = (index: number) => {
      const newOptions = [...props.options];
      const deletedOption = newOptions[index];
      newOptions.splice(index, 1);
      onUpdate({ options: newOptions });

      // 削除時はコンソールに表示
      console.log('ラジオオプションを削除:', deletedOption.value);
    };

    /**
     * オプションを更新する
     * @param index 更新するオプションのインデックス
     * @param field 更新するフィールド（'value' or 'label'）
     * @param value 新しい値
     */
    const handleUpdateOption = (index: number, field: 'value' | 'label', value: string) => {
      const newOptions = [...props.options];
      newOptions[index] = {
        ...newOptions[index],
        [field]: value
      };
      onUpdate({ options: newOptions });

      // 更新時はコンソールに表示
      console.log(`ラジオオプションの${field}を更新:`, `${newOptions[index].value} -> ${value}`);
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 共通レイアウト設定 */}
        <CommonLayoutSettings props={props} onUpdate={onUpdate} />

        <Typography variant="body2" gutterBottom>基本設定</Typography>

        {/* ラベル設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>ラベル</Typography>
          <TextField
            size="small"
            fullWidth
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </Box>

        {/* オプション設定 */}
          {/* 現在の選択値 */}
          <Box>
            <Typography variant="body2" gutterBottom>現在の選択</Typography>
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <Select
                value={props.value || ''}
                onChange={(e: SelectChangeEvent<string>) => onUpdate({ value: e.target.value })}
              >
                {props.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* オプション設定 */}
          <Box>
            <Typography variant="body2" gutterBottom>オプション</Typography>
            <Stack spacing={1}>
            {props.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  label="値"
                  value={option.value}
                  onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  size="small"
                  label="ラベル"
                  value={option.label}
                  onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteOption(index)}
                  disabled={props.options.length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              size="small"
              variant="outlined"
            >
              オプションを追加
            </Button>
          </Stack>
        </Box>

        {/* レイアウト設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>レイアウト</Typography>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => onUpdate({ row: !props.row })}
            color={props.row ? 'primary' : 'inherit'}
          >
            水平配置 {props.row ? 'ON' : 'OFF'}
          </Button>
        </Box>

        {/* カラー設定 */}
        <Box>
          <Typography variant="body2" gutterBottom>カラー</Typography>
          <ButtonGroup size="small" variant="outlined" fullWidth>
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
        </Box>

        {/* その他の設定 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => onUpdate({ disabled: !props.disabled })}
            color={props.disabled ? 'primary' : 'inherit'}
          >
            無効化 {props.disabled ? 'ON' : 'OFF'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => onUpdate({ required: !props.required })}
            color={props.required ? 'primary' : 'inherit'}
          >
            必須 {props.required ? 'ON' : 'OFF'}
          </Button>
        </Box>
      </Box>
    );
  }
};

export default RadioGroupComponent;
