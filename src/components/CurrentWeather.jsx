import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import { OWM_ICON_URL, WEATHER_BACKGROUNDS } from '../utils/constants';
import { WeatherIcon } from './WeatherIcon';
import {
  formatTemp,
  formatWind,
  formatWindDirection,
  formatPressure,
  formatVisibility,
  formatHumidity,
  formatUV,
  formatTime,
  formatDate,
  capitalizeFirst,
} from '../utils/formatters';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import CloudIcon from '@mui/icons-material/Cloud';
import ShieldIcon from '@mui/icons-material/Shield';
import NavigationIcon from '@mui/icons-material/Navigation';

export default function CurrentWeather() {
  const { t } = useTranslation();
  const { units } = useSettings();
  const { current, city, timezone_offset } = useWeatherContext();
  const { addFavorite, removeFavorite, isFavorite } = useSettings();

  if (!current || !city) return null;

  const weather = current.weather?.[0] || {};
  const condition = weather.main || 'Clear';
  const bg = WEATHER_BACKGROUNDS[condition] || WEATHER_BACKGROUNDS.default;
  const uv = formatUV(current.uvi || 0);
  const isFav = isFavorite(city);

  const statItems = [
    { icon: <WaterDropIcon style={{ fontSize: 18 }} />, label: t('humidity'), value: formatHumidity(current.humidity), color: 'text-sky-500' },
    { icon: <AirIcon style={{ fontSize: 18 }} />, label: t('wind'), value: `${formatWind(current.wind_speed, units)} ${formatWindDirection(current.wind_deg || 0)}`, color: 'text-teal-500' },
    { icon: <CompressIcon style={{ fontSize: 18 }} />, label: t('pressure'), value: formatPressure(current.pressure), color: 'text-violet-500' },
    { icon: <VisibilityIcon style={{ fontSize: 18 }} />, label: t('visibility'), value: formatVisibility(current.visibility || 10000), color: 'text-amber-500' },
    { icon: <ShieldIcon style={{ fontSize: 18 }} />, label: t('uv_index'), value: `${uv.value} ${uv.label}`, color: 'text-orange-500', customColor: uv.color },
    { icon: <CloudIcon style={{ fontSize: 18 }} />, label: t('clouds'), value: `${current.clouds || 0}%`, color: 'text-slate-400' },
  ];

  return (
    <div className={`glass-card-static p-5 md:p-7 bg-gradient-to-br ${bg.light} dark:${bg.dark} animate-fade-in-up relative overflow-hidden`}>
      {/* Background decorative element */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-sky-400/10 to-blue-500/10 dark:from-sky-400/5 dark:to-blue-500/5 blur-3xl" />

      {/* City Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-white">
              {city.name}
            </h1>
            <button
              onClick={() => isFav ? removeFavorite(city) : addFavorite(city)}
              className="p-1 rounded-lg hover:bg-rose-100/60 dark:hover:bg-rose-900/20 transition-all"
            >
              {isFav ? (
                <FavoriteIcon style={{ fontSize: 22 }} className="text-rose-500" />
              ) : (
                <FavoriteBorderIcon style={{ fontSize: 22 }} className="text-slate-400 hover:text-rose-400" />
              )}
            </button>
          </div>
          {city.country && (
            <p className="text-sm text-slate-500 dark:text-slate-300 font-semibold">
              {city.state ? `${city.state}, ` : ''}{city.country}
            </p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold mt-1">
            {formatDate(current.dt)}
          </p>
        </div>

        {/* Sunrise/Sunset */}
        {current.sunrise && current.sunset && (
          <div className="hidden sm:flex flex-col gap-1 text-right">
            <div className="flex items-center gap-1.5 text-xs text-amber-500">
              <WbSunnyIcon style={{ fontSize: 14 }} />
              <span className="font-medium">{formatTime(current.sunrise, timezone_offset)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-400">
              <WbTwilightIcon style={{ fontSize: 14 }} />
              <span className="font-medium">{formatTime(current.sunset, timezone_offset)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center gap-4 md:gap-6 mb-6 relative z-10">
        <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-500/10 dark:bg-slate-950/20 border border-slate-500/5 dark:border-white/5 flex items-center justify-center relative shadow-sm">
          <WeatherIcon
            iconCode={weather.icon || '01d'}
            className="w-20 h-20 md:w-28 md:h-28"
          />
        </div>
        <div>
          <div className="font-display font-extrabold text-5xl md:text-7xl text-slate-800 dark:text-white leading-none">
            {formatTemp(current.temp, units)}
          </div>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-300 mt-1 font-semibold">
            {t('feels_like')} {formatTemp(current.feels_like, units)}
          </p>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-200 mt-1 capitalize font-bold">
            {capitalizeFirst(weather.description || '')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        {statItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-3 rounded-xl
              bg-white/40 dark:bg-slate-800/40
              border border-white/30 dark:border-slate-700/30
              transition-all hover:bg-white/60 dark:hover:bg-slate-800/60"
          >
            <div className={`${item.color} shrink-0`} style={item.customColor ? { color: item.customColor } : undefined}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-300 uppercase tracking-wider font-bold truncate">
                {item.label}
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-white truncate">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Wind Direction Compass */}
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <NavigationIcon
          style={{
            fontSize: 20,
            transform: `rotate(${(current.wind_deg || 0) + 180}deg)`,
            transition: 'transform 0.5s ease',
          }}
          className="text-teal-500"
        />
        <span className="text-xs text-slate-400 dark:text-slate-300 font-semibold">
          {formatWindDirection(current.wind_deg || 0)} · {formatWind(current.wind_speed, units)}
        </span>
      </div>
    </div>
  );
}
