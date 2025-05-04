import React from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { BoxComponent, BoxStyles, BoxLayout } from '../../types';

interface BoxSettingsPanelProps {
  selectedBox: BoxComponent;
  onUpdate: (settings: BoxComponent) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`box-tabpanel-${index}`}
    aria-labelledby={`box-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const BoxSettingsPanel: React.FC<BoxSettingsPanelProps> = ({
  selectedBox,
  onUpdate,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStyleChange = (key: keyof BoxStyles, value: string) => {
    onUpdate({
      ...selectedBox,
      styles: {
        ...selectedBox.styles,
        [key]: value,
      },
    });
  };

  const handleLayoutChange = (key: keyof BoxLayout, value: string) => {
    onUpdate({
      ...selectedBox,
      layout: {
        ...selectedBox.layout,
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
        Box設定: {selectedBox.id}
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
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="スタイル" />
        <Tab label="レイアウト" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>配置位置</InputLabel>
          <Select
            value={selectedBox.layout.position || 'start'}
            onChange={(e) => handleLayoutChange('position', e.target.value)}
            label="配置位置"
          >
            <MenuItem value="start">start</MenuItem>
            <MenuItem value="center">center</MenuItem>
            <MenuItem value="end">end</MenuItem>
            <MenuItem value="stretch">stretch</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>フレックス方向</InputLabel>
          <Select
            value={selectedBox.layout.flexDirection || 'row'}
            onChange={(e) => handleLayoutChange('flexDirection', e.target.value)}
            label="フレックス方向"
          >
            <MenuItem value="row">row</MenuItem>
            <MenuItem value="column">column</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>水平方向の配置</InputLabel>
          <Select
            value={selectedBox.layout.justifyContent || 'flex-start'}
            onChange={(e) => handleLayoutChange('justifyContent', e.target.value)}
            label="水平方向の配置"
          >
            <MenuItem value="flex-start">flex-start</MenuItem>
            <MenuItem value="center">center</MenuItem>
            <MenuItem value="flex-end">flex-end</MenuItem>
            <MenuItem value="space-between">space-between</MenuItem>
            <MenuItem value="space-around">space-around</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>垂直方向の配置</InputLabel>
          <Select
            value={selectedBox.layout.alignItems || 'flex-start'}
            onChange={(e) => handleLayoutChange('alignItems', e.target.value)}
            label="垂直方向の配置"
          >
            <MenuItem value="flex-start">flex-start</MenuItem>
            <MenuItem value="center">center</MenuItem>
            <MenuItem value="flex-end">flex-end</MenuItem>
            <MenuItem value="stretch">stretch</MenuItem>
          </Select>
        </FormControl>
      </TabPanel>
    </Paper>
  );
};

export default BoxSettingsPanel;
