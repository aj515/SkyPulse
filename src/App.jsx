import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeatherContext } from './context/WeatherContext';
import { useSettings } from './context/SettingsContext';
import { useGeolocation } from './hooks/useGeolocation';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { DEFAULT_CITIES } from './utils/constants';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherMap from './components/WeatherMap';
import WeatherCompare from './components/WeatherCompare';
import WeatherAlerts from './components/WeatherAlerts';
import FavoritesList from './components/FavoritesList';
import Skeleton from './components/Skeleton';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CloudIcon from '@mui/icons-material/Cloud';

export default function App() {
  const { t } = useTranslation();
  const { current, loading, error, fetchWeather, city, source } = useWeatherContext();
  const { units, language } = useSettings();
  const { position, requestPosition } = useGeolocation();
  const isOnline = useOnlineStatus();
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fetch weather on geolocation or default city
  useEffect(() => {
    if (initialized) return;

    if (position) {
      fetchWeather(position.lat, position.lon);
      setInitialized(true);
    }
  }, [position, fetchWeather, initialized]);

  // Auto-request geolocation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      requestPosition();
    }, 500);

    // Fallback: if no geolocation after 5s, use default city
    const fallback = setTimeout(() => {
      if (!initialized) {
        const defaultCity = DEFAULT_CITIES[0]; // Manila
        fetchWeather(defaultCity.lat, defaultCity.lon, defaultCity);
        setInitialized(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallback);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when units or language changes
  useEffect(() => {
    if (current && initialized && city) {
      fetchWeather(city.lat, city.lon, city);
    }
  }, [units, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGeolocate = useCallback(() => {
    requestPosition();
    if (position) {
      fetchWeather(position.lat, position.lon);
    }
  }, [position, requestPosition, fetchWeather]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner flex items-center justify-center gap-2 animate-fade-in">
          <WifiOffIcon style={{ fontSize: 16 }} />
          <span>{t('offline_message')}</span>
        </div>
      )}

      {/* Demo Mode Banners */}
      {source === 'demo' && (
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 text-white text-center py-1.5 px-4 text-xs font-semibold animate-fade-in shadow-sm tracking-wide">
          🎨 Demo Mode — Set your OpenWeatherMap API key in <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono">.env</code> for live data
        </div>
      )}

      {source === 'demo_unauthorized' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 px-4 text-xs font-semibold animate-fade-in shadow-sm tracking-wide flex items-center justify-center gap-1.5">
          ⚠️ Key Pending / Unauthorized — Your new OpenWeatherMap key is not yet active (activation takes 10 to 60 minutes) or requires One Call activation. Running in offline demo mode.
        </div>
      )}

      {source === 'demo_error_fallback' && (
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-center py-2 px-4 text-xs font-semibold animate-fade-in shadow-sm tracking-wide flex items-center justify-center gap-1.5">
          ⚠️ Live Connection Issue — Unable to reach weather servers right now. Running in offline demo fallback mode.
        </div>
      )}

      {/* Header */}
      <Header
        onGeolocate={handleGeolocate}
        onToggleFavorites={() => setFavoritesOpen(!favoritesOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 px-3 md:px-6 py-4 md:py-6 max-w-7xl mx-auto w-full">
        {/* Loading State */}
        {loading && !current && <Skeleton />}

        {/* Error State */}
        {error && !current && (
          <div className="glass-card-static p-8 text-center animate-fade-in">
            <ErrorOutlineIcon style={{ fontSize: 48 }} className="text-rose-400 mb-3" />
            <h2 className="font-display font-bold text-xl text-slate-700 dark:text-slate-200 mb-2">
              {t('error_fetch')}
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => {
                const defaultCity = DEFAULT_CITIES[0];
                fetchWeather(defaultCity.lat, defaultCity.lon, defaultCity);
              }}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold
                hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-200"
            >
              Try Manila Instead
            </button>
          </div>
        )}

        {/* Welcome State */}
        {!loading && !error && !current && (
          <div className="glass-card-static p-12 text-center animate-fade-in">
            <CloudIcon style={{ fontSize: 64 }} className="text-sky-300 dark:text-sky-700 mb-4 animate-float" />
            <h2 className="font-display font-bold text-2xl text-slate-700 dark:text-slate-200 mb-2">
              {t('app_name')}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 mb-6">
              Search for a city or allow location access to get started
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEFAULT_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => fetchWeather(city.lat, city.lon, city)}
                  className="px-4 py-2 rounded-xl text-sm font-medium
                    bg-white/50 dark:bg-slate-800/50
                    border border-white/40 dark:border-slate-700/30
                    text-slate-600 dark:text-slate-300
                    hover:bg-sky-50/60 dark:hover:bg-sky-900/20
                    hover:border-sky-200/40 dark:hover:border-sky-700/30
                    transition-all duration-200"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weather Data */}
        {current && (
          <div className="space-y-4 md:space-y-5">
            {/* Current + loading overlay */}
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                  <div className="animate-pulse-gentle text-sky-500 font-semibold text-sm">
                    {t('loading')}
                  </div>
                </div>
              )}
              <CurrentWeather />
            </div>

            {/* Two Column Layout for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
              <HourlyForecast />
              <DailyForecast />
            </div>

            {/* Map + Compare & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              <div className="lg:col-span-2">
                <WeatherMap />
              </div>
              <div className="space-y-4 md:space-y-5">
                <WeatherCompare />
                <WeatherAlerts />
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-600 font-medium">
              {t('powered_by')} · {new Date().getFullYear()}
            </footer>
          </div>
        )}
      </main>

      {/* Favorites Drawer */}
      <FavoritesList open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </div>
  );
}
