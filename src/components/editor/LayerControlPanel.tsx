import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Slider,
  Button,
  TextField,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAtom } from 'jotai';
import { layersAtom, activeLayerIdAtom } from '../../store/atoms';
import type { Layer } from '../../types';

/**
 * レイヤー管理パネルのコンポーネント
 */
export const LayerControlPanel: React.FC = () => {
  const [layers, setLayers] = useAtom(layersAtom);
  const [activeLayerId, setActiveLayerId] = useAtom(activeLayerIdAtom);

  // レイヤーの表示/非表示を切り替える
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer =>
      layer.id === layerId
        ? { ...layer, isVisible: !layer.isVisible }
        : layer
    ));
  };

  // レイヤーの透明度を変更する
  const handleOpacityChange = (layerId: string, newValue: number) => {
    setLayers(layers.map(layer =>
      layer.id === layerId
        ? { ...layer, opacity: newValue }
        : layer
    ));
  };

  // レイヤーの名前を変更する
  const handleNameChange = (layerId: string, newName: string) => {
    setLayers(layers.map(layer =>
      layer.id === layerId
        ? { ...layer, name: newName }
        : layer
    ));
  };

  // 新しいレイヤーを追加する
  const addNewLayer = () => {
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: `新規レイヤー ${layers.length + 1}`,
      isVisible: true,
      opacity: 1,
      gridItems: []
    };
    setLayers([...layers, newLayer]);
  };

  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={addNewLayer}
        fullWidth
        sx={{ mb: 2 }}
      >
        新規レイヤー
      </Button>

      <List>
        {layers.map((layer) => (
          <ListItem
            key={layer.id}
            sx={{
              border: layer.id === activeLayerId ? '2px solid #1976d2' : '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 1,
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
              <IconButton
                onClick={() => toggleLayerVisibility(layer.id)}
                size="small"
              >
                {layer.isVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>

              <TextField
                value={layer.name}
                onChange={(e) => handleNameChange(layer.id, e.target.value)}
                variant="standard"
                sx={{ ml: 1, flex: 1 }}
              />
            </Box>

            <Box sx={{ px: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText
                  primary="透明度"
                  sx={{ mr: 2, flex: '0 0 auto' }}
                />
                <Slider
                  value={layer.opacity}
                  onChange={(_, value) => handleOpacityChange(layer.id, value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            <Button
              variant={layer.id === activeLayerId ? "contained" : "outlined"}
              onClick={() => setActiveLayerId(layer.id)}
              sx={{ mt: 1 }}
              fullWidth
            >
              {layer.id === activeLayerId ? "編集中" : "編集する"}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
