import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchBar from './SearchBar';
import LanguageSelector from './LanguageSelector';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import KeyIcon from '@mui/icons-material/Key';

export default function Header({ onGeolocate, onToggleFavorites, onToggleApiKey }) {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { units, setUnits } = useSettings();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-card-static !rounded-none !rounded-b-2xl px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">

          {/* Logo & Mobile Controls Wrapper */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-sky-500/20">
                <WbSunnyIcon style={{ fontSize: 20 }} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                {t('app_name')}
              </span>
            </div>

            {/* Mobile Controls (hidden on sm and larger) */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              {/* Unit Toggle */}
              <button
                onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold
                  bg-slate-100/60 dark:bg-slate-700/60
                  hover:bg-slate-200/80 dark:hover:bg-slate-600/80
                  text-slate-600 dark:text-slate-300
                  transition-all duration-200 border border-slate-200/40 dark:border-slate-600/40"
                title={t('units')}
              >
                {units === 'metric' ? '°C' : '°F'}
              </button>

              {/* Language */}
              <LanguageSelector />

              {/* API Key Manager */}
              <button
                onClick={onToggleApiKey}
                className="p-1.5 rounded-lg hover:bg-sky-100/60 dark:hover:bg-sky-900/20 text-slate-500 dark:text-slate-400 transition-all duration-200"
                title={t('api_key_manager')}
              >
                <KeyIcon style={{ fontSize: 20 }} />
              </button>

              {/* Favorites */}
              <button
                onClick={onToggleFavorites}
                className="p-1.5 rounded-lg hover:bg-rose-100/60 dark:hover:bg-rose-900/20 text-slate-500 dark:text-slate-400 transition-all duration-200"
                title={t('favorites')}
              >
                <FavoriteBorderIcon style={{ fontSize: 20 }} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/20 text-slate-500 dark:text-slate-400 transition-all duration-200"
                title={darkMode ? t('light_mode') : t('dark_mode')}
              >
                {darkMode ? (
                  <LightModeIcon style={{ fontSize: 20 }} className="text-amber-400" />
                ) : (
                  <DarkModeIcon style={{ fontSize: 20 }} className="text-slate-500" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:flex-1 sm:max-w-md">
            <SearchBar onGeolocate={onGeolocate} />
          </div>

          {/* Desktop Controls (hidden on mobile, visible on sm and larger) */}
          <div className="hidden sm:flex items-center gap-1 md:gap-2 shrink-0">
            {/* Unit Toggle */}
            <button
              id="unit-toggle"
              onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold
                bg-slate-100/60 dark:bg-slate-700/60
                hover:bg-slate-200/80 dark:hover:bg-slate-600/80
                text-slate-600 dark:text-slate-300
                transition-all duration-200 border border-slate-200/40 dark:border-slate-600/40"
              title={t('units')}
            >
              {units === 'metric' ? '°C' : '°F'}
            </button>

            {/* Language */}
            <LanguageSelector />

            {/* API Key Manager */}
            <button
              id="api-key-btn"
              onClick={onToggleApiKey}
              className="p-2 rounded-lg
                hover:bg-sky-100/60 dark:hover:bg-sky-900/20
                text-slate-500 dark:text-slate-400
                transition-all duration-200"
              title={t('api_key_manager')}
            >
              <KeyIcon style={{ fontSize: 20 }} />
            </button>

            {/* Favorites */}
            <button
              id="favorites-btn"
              onClick={onToggleFavorites}
              className="p-2 rounded-lg
                hover:bg-rose-100/60 dark:hover:bg-rose-900/20
                text-slate-500 dark:text-slate-400
                transition-all duration-200"
              title={t('favorites')}
            >
              <FavoriteBorderIcon style={{ fontSize: 20 }} />
            </button>

            {/* Theme Toggle */}
            <button
              id="theme-toggle"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg
                hover:bg-amber-100/60 dark:hover:bg-amber-900/20
                text-slate-500 dark:text-slate-400
                transition-all duration-200"
              title={darkMode ? t('light_mode') : t('dark_mode')}
            >
              {darkMode ? (
                <LightModeIcon style={{ fontSize: 20 }} className="text-amber-400" />
              ) : (
                <DarkModeIcon style={{ fontSize: 20 }} className="text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
