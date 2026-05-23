import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { WeatherProvider } from './context/WeatherContext';
import './i18n';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <SettingsProvider>
        <ThemeProvider>
          <WeatherProvider>
            <App />
          </WeatherProvider>
        </ThemeProvider>
      </SettingsProvider>
    </StyledEngineProvider>
  </StrictMode>
);
