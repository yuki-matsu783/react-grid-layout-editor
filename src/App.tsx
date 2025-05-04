import React from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Provider } from 'jotai';
import ComponentPalette from './components/editor/ComponentPalette';
import GridLayout from './components/editor/GridLayout';
import PropertyEditor from './components/editor/PropertyEditor';
import Toolbar from './components/editor/Toolbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App: React.FC = () => {
  return (
    <Provider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden',
              bgcolor: 'background.default',
            }}
          >
          <ComponentPalette />
          <GridLayout />
          <PropertyEditor />
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
