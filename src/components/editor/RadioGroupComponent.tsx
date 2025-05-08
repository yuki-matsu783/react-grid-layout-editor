import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  TextField,
  IconButton,
  Stack,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { RadioGroupProps, BaseComponent, ParentType } from '../../types';
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
   * @param parentType - 親コンポーネントのタイプ
   * @returns レンダリングされた設定UI
   */
  renderSettings: (
    props: RadioGroupProps,
    onUpdate: (newProps: Partial<RadioGroupProps>) => void,
    parentType: ParentType
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
    };

    /**
     * オプションを削除する
     * @param index 削除するオプションのインデックス
     */
    const handleDeleteOption = (index: number) => {
      const newOptions = [...props.options];
      newOptions.splice(index, 1);
      onUpdate({ options: newOptions });
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
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 共通レイアウト設定 */}
        <CommonLayoutSettings props={props} onUpdate={onUpdate} parentType={parentType} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>基本設定</Typography>

          {/* ラベル設定 */}
          <TextField
            size="small"
            fullWidth
            label="グループラベル"
            value={props.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            sx={{ mb: 1.5 }}
          />
        </Box>

        {/* 現在の選択値 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>現在の選択</Typography>
          <FormControl size="small" fullWidth>
            <InputLabel>選択されている値</InputLabel>
            <Select
              value={props.value || ''}
              label="選択されている値"
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>オプション設定</Typography>
          <Stack spacing={1.5}>
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>レイアウト設定</Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={props.row}
                onChange={(e) => onUpdate({ row: e.target.checked })}
              />
            }
            label={<Typography variant="body2">水平配置</Typography>}
          />
        </Box>

        {/* カラー設定 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>カラー設定</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>カラー</InputLabel>
            <Select
              value={props.color ?? 'primary'}
              label="カラー"
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
          <Stack spacing={1.5}>
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
          </Stack>
        </Box>
      </Box>
    );
  }
};

export default RadioGroupComponent;
