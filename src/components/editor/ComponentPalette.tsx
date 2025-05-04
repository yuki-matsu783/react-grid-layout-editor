import React from 'react';
import { useAtom } from 'jotai';
import { Paper, List, ListSubheader, ListItem, ListItemText, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchQueryAtom } from '../../store/atoms';
import { componentCategories, componentsByCategory, availableComponents } from '../../utils/componentRegistry';
import type { ComponentDefinition } from '../../types';

const ComponentPalette: React.FC = () => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('component', componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filterComponents = (components: string[], query: string) => {
    if (!query) return components;
    return components.filter(comp => 
      comp.toLowerCase().includes(query.toLowerCase()) ||
      availableComponents[comp].type.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <Paper
      sx={{
        width: 280,
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="コンポーネントを検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {Object.entries(componentCategories).map(([category, label]) => {
          const components = filterComponents(componentsByCategory[category as keyof typeof componentCategories], searchQuery);
          
          if (components.length === 0) return null;

          return (
            <List
              key={category}
              subheader={
                <ListSubheader sx={{ bgcolor: 'background.paper' }}>
                  {label}
                </ListSubheader>
              }
              dense
            >
              {components.map((componentType) => {
                const component = availableComponents[componentType];
                return (
                  <ListItem
                    key={componentType}
                    draggable
                    onDragStart={(e) => handleDragStart(e, componentType)}
                    sx={{
                      cursor: 'move',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={componentType}
                      secondary={getComponentDescription(component)}
                    />
                  </ListItem>
                );
              })}
            </List>
          );
        })}
      </Box>
    </Paper>
  );
};

const getComponentDescription = (component: ComponentDefinition): string => {
  const props = [];
  if (component.props.variant) props.push(`variant: ${component.props.variant}`);
  if (component.props.color) props.push(`color: ${component.props.color}`);
  if (component.props.size) props.push(`size: ${component.props.size}`);
  return props.join(', ') || '基本設定';
};

export default ComponentPalette;
