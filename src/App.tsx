import React, { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box, Tabs, Tab } from '@mui/material';
import GridLayout from './components/editor/GridLayout';
import ComponentLayout from './components/editor/ComponentLayout';

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
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="ページレイアウト" />
            <Tab label="コンポーネント" />
          </Tabs>
        </Box>
        {activeTab === 0 ? <GridLayout /> : <ComponentLayout />}
      </Box>
    </ThemeProvider>
  );
};

export default App;
