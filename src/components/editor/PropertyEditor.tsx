import React from 'react';
import { useAtom } from 'jotai';
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { layoutAtom, selectionAtom, selectedComponentAtom } from '../../store/atoms';
import type { EditMode } from '../../types';

const PropertyEditor: React.FC = () => {
  const [editMode, setEditMode] = React.useState<EditMode>('layout');
  const [pageLayout, setPageLayout] = useAtom(layoutAtom);
  const [selection] = useAtom(selectionAtom);
  const [selectedComponent] = useAtom(selectedComponentAtom);

  if (!selectedComponent) {
    return (
      <Paper
        sx={{
          width: 280,
          height: '100%',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">
          コンポーネントを選択してください
        </Typography>
      </Paper>
    );
  }

  const handlePropertyChange = (key: string, value: string | number | boolean) => {
    if (!selection.componentId || !selection.breakpoint) return;

    const updatedLayout = pageLayout.settings.responsive.layouts[selection.breakpoint].map(item => {
      if (item.id !== selection.componentId) return item;

      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component.props,
            [key]: value,
          },
        },
      };
    });

    setPageLayout({
      ...pageLayout,
      settings: {
        ...pageLayout.settings,
        responsive: {
          ...pageLayout.settings.responsive,
          layouts: {
            ...pageLayout.settings.responsive.layouts,
            [selection.breakpoint]: updatedLayout,
          },
        },
      },
    });
  };

  const handleStyleChange = (key: string, value: string) => {
    if (!selection.componentId || !selection.breakpoint) return;

    const updatedLayout = pageLayout.settings.responsive.layouts[selection.breakpoint].map(item => {
      if (item.id !== selection.componentId) return item;

      return {
        ...item,
        component: {
          ...item.component,
          styles: {
            ...item.component.styles,
            custom: {
              ...item.component.styles.custom,
              [key]: value,
            },
          },
        },
      };
    });

    setPageLayout({
      ...pageLayout,
      settings: {
        ...pageLayout.settings,
        responsive: {
          ...pageLayout.settings.responsive,
          layouts: {
            ...pageLayout.settings.responsive.layouts,
            [selection.breakpoint]: updatedLayout,
          },
        },
      },
    });
  };

  const renderPropertyFields = () => {
    const { props } = selectedComponent.component;
    
    return Object.entries(props).map(([key, value]) => {
      if (typeof value === 'boolean') {
        return (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={value}
                onChange={(e) => handlePropertyChange(key, e.target.checked)}
              />
            }
            label={key}
          />
        );
      }

      if (key === 'variant') {
        return (
          <FormControl key={key} fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>{key}</InputLabel>
            <Select
              value={value || ''}
              label={key}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
            >
              <MenuItem value="text">text</MenuItem>
              <MenuItem value="outlined">outlined</MenuItem>
              <MenuItem value="contained">contained</MenuItem>
            </Select>
          </FormControl>
        );
      }

      if (key === 'color') {
        return (
          <FormControl key={key} fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>{key}</InputLabel>
            <Select
              value={value || ''}
              label={key}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
            >
              <MenuItem value="primary">primary</MenuItem>
              <MenuItem value="secondary">secondary</MenuItem>
              <MenuItem value="error">error</MenuItem>
              <MenuItem value="warning">warning</MenuItem>
              <MenuItem value="info">info</MenuItem>
              <MenuItem value="success">success</MenuItem>
            </Select>
          </FormControl>
        );
      }

      return (
        <TextField
          key={key}
          fullWidth
          size="small"
          label={key}
          value={value || ''}
          onChange={(e) => handlePropertyChange(key, e.target.value)}
          sx={{ mt: 1 }}
        />
      );
    });
  };

  const renderStyleFields = () => {
    const { custom } = selectedComponent.component.styles;
    
    return (
      <>
        <TextField
          fullWidth
          size="small"
          label="width"
          value={custom.width || ''}
          onChange={(e) => handleStyleChange('width', e.target.value)}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          size="small"
          label="height"
          value={custom.height || ''}
          onChange={(e) => handleStyleChange('height', e.target.value)}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          size="small"
          label="margin"
          value={custom.margin || ''}
          onChange={(e) => handleStyleChange('margin', e.target.value)}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          size="small"
          label="padding"
          value={custom.padding || ''}
          onChange={(e) => handleStyleChange('padding', e.target.value)}
          sx={{ mt: 1 }}
        />
        <TextField
          fullWidth
          size="small"
          label="backgroundColor"
          value={custom.backgroundColor || ''}
          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
          sx={{ mt: 1 }}
        />
      </>
    );
  };

  return (
    <Paper
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={editMode}
          onChange={(_, newValue: EditMode) => setEditMode(newValue)}
          aria-label="property editor tabs"
        >
          <Tab label="プロパティ" value="layout" />
          <Tab label="スタイル" value="style" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2, overflow: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>
          {selectedComponent.component.type}
        </Typography>

        {editMode === 'layout' && renderPropertyFields()}
        {editMode === 'style' && renderStyleFields()}
      </Box>
    </Paper>
  );
};

export default PropertyEditor;
