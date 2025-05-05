import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  FormControl,
} from '@mui/material';
import type { BoxComponent, BoxStyles } from '../../types';

interface BoxSettingsPanelProps {
  selectedBox: BoxComponent;
  onUpdate: (settings: BoxComponent) => void;
}

const BoxSettingsPanel: React.FC<BoxSettingsPanelProps> = ({
  selectedBox,
  onUpdate,
}) => {
  const handleStyleChange = (key: keyof BoxStyles, value: string) => {
    onUpdate({
      ...selectedBox,
      styles: {
        ...selectedBox.styles,
        [key]: value,
      },
    });
  };

  return (
    <Paper
      sx={{
        width: 300,
        height: '100%',
        position: 'fixed',
        right: 0,
        top: 0,
        borderRadius: 0,
        overflow: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        Box設定: {selectedBox.name}
      </Typography>
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          label="Box名"
          value={selectedBox.name}
          onChange={(e) => onUpdate({ ...selectedBox, name: e.target.value })}
          sx={{ mb: 2 }}
        />
      </Box>

      <Box sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="背景色"
            type="color"
            value={selectedBox.styles.background || '#ffffff'}
            onChange={(e) => handleStyleChange('background', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="ボーダー"
            value={selectedBox.styles.border || ''}
            onChange={(e) => handleStyleChange('border', e.target.value)}
            placeholder="1px solid #000"
            sx={{ mb: 2 }}
          />
          <TextField
            label="余白"
            value={selectedBox.styles.padding || ''}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            placeholder="8px"
            sx={{ mb: 2 }}
          />
          <TextField
            label="角丸"
            value={selectedBox.styles.borderRadius || ''}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            placeholder="4px"
          />
        </FormControl>
      </Box>
    </Paper>
  );
};

export default BoxSettingsPanel;
