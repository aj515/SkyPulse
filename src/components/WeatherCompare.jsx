import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import { fetchAllWeatherData } from '../api/weather';
import { getDemoWeatherData, MOCK_CITIES } from '../utils/demoData';
import { API_KEY, OWM_ICON_URL } from '../utils/constants';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp, formatWind, formatHumidity, formatPressure, formatTime } from '../utils/formatters';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import CloudIcon from '@mui/icons-material/Cloud';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Tooltip from '@mui/material/Tooltip';

export default function WeatherCompare() {
  const { t } = useTranslation();
  const { units, language, addFavorite, removeFavorite, isFavorite } = useSettings();
  const { current: primaryCurrent, city: primaryCity, fetchWeather } = useWeatherContext();

  const [compareCity, setCompareCity] = useState(MOCK_CITIES[4]); // Default to Tokyo
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Prevent comparing a city with itself when primaryCity is updated
  useEffect(() => {
    if (primaryCity && compareCity && primaryCity.name === compareCity.name) {
      const fallback = MOCK_CITIES.find(c => c.name !== primaryCity.name);
      if (fallback) {
        setCompareCity(fallback);
      }
    }
  }, [primaryCity, compareCity]);

  // Fetch weather data for the compared city
  useEffect(() => {
    if (!compareCity) return;
    
    let active = true;
    const loadCompareData = async () => {
      setLoading(true);
      try {
        if (API_KEY === 'demo_key_replace_me' || API_KEY === 'your_openweathermap_api_key_here') {
          // Demo fallback
          const data = getDemoWeatherData(units, compareCity.name);
          if (active) {
            setCompareData(data.current);
            setLoading(false);
          }
        } else {
          // Live API call
          const data = await fetchAllWeatherData(compareCity.lat, compareCity.lon, units, language);
          if (active) {
            setCompareData(data.current);
            setLoading(false);
          }
        }
      } catch (err) {
        // Safe fallback in case of error
        const data = getDemoWeatherData(units, compareCity.name);
        if (active) {
          setCompareData(data.current);
          setLoading(false);
        }
      }
    };

    loadCompareData();
    return () => { active = false; };
  }, [compareCity, units, language]);

  if (!primaryCurrent || !primaryCity) return null;

  const primaryTemp = primaryCurrent.temp;
  const compareTemp = compareData?.temp;

  // Swap Primary City and Compared City
  const handleSwap = () => {
    if (!compareCity) return;
    const oldPrimary = primaryCity;
    setCompareCity(oldPrimary);
    fetchWeather(compareCity.lat, compareCity.lon, compareCity);
  };

  // Natural Language Comparison Generator
  const getComparisonSummary = () => {
    if (!compareData || compareTemp === undefined) return '';

    const tempDiff = Math.round(Math.abs(primaryTemp - compareTemp) * 10) / 10;
    const isPrimaryWarmer = primaryTemp > compareTemp;
    const unitLabel = units === 'metric' ? '°C' : '°F';

    let desc = '';
    if (tempDiff === 0) {
      desc = `Both cities have the exact same temperature of ${formatTemp(primaryTemp, units)}. `;
    } else {
      desc = `${compareCity.name} is ${tempDiff}${unitLabel} ${isPrimaryWarmer ? 'cooler' : 'warmer'} than ${primaryCity.name}. `;
    }

    const humDiff = Math.abs(primaryCurrent.humidity - compareData.humidity);
    if (humDiff > 10) {
      desc += `${compareCity.name} is ${primaryCurrent.humidity > compareData.humidity ? 'drier' : 'more humid'} (humidity: ${compareData.humidity}%) than ${primaryCity.name} (${primaryCurrent.humidity}%).`;
    } else {
      desc += `Both experience similar humidity levels.`;
    }

    return desc;
  };

  const primaryWeather = primaryCurrent.weather?.[0] || {};
  const compareWeather = compareData?.weather?.[0] || {};
  const isCompareFav = isFavorite(compareCity);

  return (
    <div className="glass-card-static flex flex-col overflow-hidden animate-fade-in-up">
      
      {/* CARD HEADER */}
      <div className="bg-white/50 dark:bg-slate-800/40 px-4 py-3 md:px-5 md:py-4 border-b border-slate-200/50 dark:border-slate-700/30 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <CompareArrowsIcon style={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm md:text-base text-slate-800 dark:text-slate-200">
              {t('compare_weather', 'Compare Weather')}
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-400 font-medium">
              {t('compare_desc', 'Compare current city conditions side-by-side')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Swap Cities Button */}
          {expanded && (
            <Tooltip title={t('swap_cities', 'Swap Cities')} arrow classes={{ tooltip: 'custom-tooltip' }}>
              <button
                onClick={handleSwap}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all"
              >
                <SwapHorizIcon style={{ fontSize: 18 }} />
              </button>
            </Tooltip>
          )}

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-all"
          >
            <ChevronRightIcon
              className={`transition-transform duration-300 ${
                expanded ? 'rotate-90' : ''
              }`}
              style={{ fontSize: 18 }}
            />
          </button>
        </div>
      </div>

      {/* CARD BODY */}
      {expanded && (
        <div className="p-4 md:p-5 space-y-4 animate-fade-in flex-1">
          {/* City Selection Dropdown */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('compare_with', 'Compare with:')}
            </label>
            <select
              value={compareCity.name}
              onChange={(e) => {
                const selected = MOCK_CITIES.find(c => c.name === e.target.value);
                if (selected) setCompareCity(selected);
              }}
              className="pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg
                bg-slate-100/60 dark:bg-slate-700/60
                text-slate-700 dark:text-slate-200
                border border-slate-200/40 dark:border-slate-600/40
                focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            >
              {MOCK_CITIES.filter(c => c.name !== primaryCity.name).map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name} ({city.country})
                </option>
              ))}
            </select>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Primary City Column */}
            <div className="p-3.5 rounded-xl bg-white/40 dark:bg-slate-800/20 border border-white/20 dark:border-slate-800/10">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-300 font-extrabold block mb-1">
                {t('current_city', 'Current City')}
              </span>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white truncate">
                {primaryCity.name}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <WeatherIcon
                  iconCode={primaryWeather.icon || '01d'}
                  className="w-10 h-10"
                />
                <div>
                  <div className="font-display font-bold text-xl text-slate-800 dark:text-white">
                    {formatTemp(primaryTemp, units)}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-300 truncate capitalize font-semibold">
                    {primaryWeather.description}
                  </div>
                </div>
              </div>

              {/* Stats Stack */}
              <div className="mt-3.5 space-y-2 text-xs border-t border-slate-200/40 dark:border-slate-700/20 pt-2.5">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <WaterDropIcon style={{ fontSize: 13 }} /> {t('humidity')}
                  </span>
                  <span>{formatHumidity(primaryCurrent.humidity)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <AirIcon style={{ fontSize: 13 }} /> {t('wind')}
                  </span>
                  <span>{formatWind(primaryCurrent.wind_speed, units)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CloudIcon style={{ fontSize: 13 }} /> {t('clouds')}
                  </span>
                  <span>{primaryCurrent.clouds}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CompressIcon style={{ fontSize: 13 }} /> {t('pressure')}
                  </span>
                  <span>{formatPressure(primaryCurrent.pressure)}</span>
                </div>
              </div>
            </div>

            {/* Compared City Column */}
            <div className="p-3.5 rounded-xl bg-white/40 dark:bg-slate-800/20 border border-white/20 dark:border-slate-800/10 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
                  <div className="animate-pulse-gentle text-xs font-semibold text-sky-500">
                    {t('loading')}
                  </div>
                </div>
              )}
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-300 font-extrabold block mb-1">
                {t('compared_city', 'Compared City')}
              </span>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white truncate">
                {compareCity.name}
              </h4>
              {compareData && (
                <>
                  <div className="flex items-center gap-2 mt-2 animate-fade-in">
                    <WeatherIcon
                       iconCode={compareWeather.icon || '01d'}
                       className="w-10 h-10"
                    />
                    <div>
                      <div className="font-display font-bold text-xl text-slate-800 dark:text-white">
                        {formatTemp(compareTemp, units)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-300 truncate capitalize font-semibold">
                        {compareWeather.description}
                      </div>
                    </div>
                  </div>

                  {/* Stats Stack */}
                  <div className="mt-3.5 space-y-2 text-xs border-t border-slate-200/40 dark:border-slate-700/20 pt-2.5">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <WaterDropIcon style={{ fontSize: 13 }} /> {t('humidity')}
                      </span>
                      <span>{formatHumidity(compareData.humidity)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <AirIcon style={{ fontSize: 13 }} /> {t('wind')}
                      </span>
                      <span>{formatWind(compareData.wind_speed, units)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <CloudIcon style={{ fontSize: 13 }} /> {t('clouds')}
                      </span>
                      <span>{compareData.clouds}%</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <CompressIcon style={{ fontSize: 13 }} /> {t('pressure')}
                      </span>
                      <span>{formatPressure(compareData.pressure)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Insights Bar */}
          {compareData && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-500/10 via-sky-500/10 to-indigo-500/10 dark:from-violet-500/5 dark:via-sky-500/5 dark:to-indigo-500/5 border border-sky-400/20 dark:border-sky-500/10">
              <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-wider block mb-1">
                🤖 SkyPulse Insight
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                {getComparisonSummary()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CARD FOOTER */}
      {expanded && compareData && (
        <div className="bg-slate-50/40 dark:bg-slate-800/20 px-4 py-2.5 md:px-5 md:py-3 border-t border-slate-200/50 dark:border-slate-700/30 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-300 font-semibold">
          <span>
            {t('last_updated', 'Updated')}: {formatTime(compareData.dt)}
          </span>

          {/* Quick Favorite Action */}
          <button
            onClick={() => isCompareFav ? removeFavorite(compareCity) : addFavorite(compareCity)}
            className="flex items-center gap-1 hover:text-rose-500 transition-colors"
          >
            {isCompareFav ? (
              <>
                <FavoriteIcon style={{ fontSize: 13 }} className="text-rose-500" />
                <span>{t('favorited', 'Favorited')}</span>
              </>
            ) : (
              <>
                <FavoriteBorderIcon style={{ fontSize: 13 }} />
                <span>{t('add_favorite', 'Favorite')}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
