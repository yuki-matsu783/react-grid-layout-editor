import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  ButtonGroup,
  TextField,
} from '@mui/material';
import type { ButtonConfig } from '../../types';

interface BoxSettingsPanelProps {
  selectedItem: {
    id: string;
    component: {
      type: 'button';
      props: ButtonConfig['props'];
    };
  } | null;
  onUpdate: (id: string, newProps: Partial<ButtonConfig['props']>) => void;
}

/**
 * ボタンの設定を編集するパネルコンポーネント
 */
const BoxSettingsPanel: React.FC<BoxSettingsPanelProps> = ({ selectedItem, onUpdate }) => {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">ボタン設定</Typography>
      {selectedItem && selectedItem.component.type === 'button' ? (
        <>
          {/* 選択中のボタンのprops */}
          {(() => {
            const props = selectedItem.component.props;
            return (

              <>
                {/* テキスト設定 */}
                <Box>
        <TextField
          fullWidth
          label="ラベル"
          value={props.label}
          onChange={(e) => onUpdate(selectedItem.id, { label: e.target.value })}
        />
                </Box>

                {/* サイズ設定 */}
                <Box>
        <Typography gutterBottom>幅 ({props.widthPercentage}%)</Typography>
        <Slider
          value={props.widthPercentage}
          onChange={(_, value) => 
            onUpdate(selectedItem.id, { widthPercentage: value as number })}
          min={10}
          max={100}
          step={1}
        />
        <Typography gutterBottom>高さ ({props.heightPercentage}%)</Typography>
        <Slider
          value={props.heightPercentage}
          onChange={(_, value) => 
            onUpdate(selectedItem.id, { heightPercentage: value as number })}
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
            onChange={(e) => onUpdate(selectedItem.id, { horizontalAlign: e.target.value as 'start' | 'center' | 'end' })}
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
            onChange={(e) => onUpdate(selectedItem.id, { verticalAlign: e.target.value as 'start' | 'center' | 'end' })}
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
              onClick={() => onUpdate(selectedItem.id, { variant: v })}
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
              onClick={() => onUpdate(selectedItem.id, { color: c })}
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
              onClick={() => onUpdate(selectedItem.id, { size: s })}
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
          onClick={() => onUpdate(selectedItem.id, { disabled: !props.disabled })}
          color={props.disabled ? 'primary' : 'inherit'}
        >
          無効化 {props.disabled ? 'ON' : 'OFF'}
        </Button>
                </Box>
              </>
            );
          })()}
        </>
      ) : (
        <Typography color="text.secondary">
          ボタンを選択してください
        </Typography>
      )}
    </Box>
  );
};

export default BoxSettingsPanel;
