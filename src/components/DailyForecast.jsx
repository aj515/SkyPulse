import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import { OWM_ICON_URL } from '../utils/constants';
import { formatTempValue, formatDay, capitalizeFirst } from '../utils/formatters';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';

export default function DailyForecast() {
  const { t } = useTranslation();
  const { units } = useSettings();
  const { daily } = useWeatherContext();

  if (!daily || daily.length === 0) return null;

  // Find global min/max for bar visualization
  const allTemps = daily.flatMap((d) => [d.temp.min, d.temp.max]);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const range = globalMax - globalMin || 1;

  return (
    <div className="glass-card-static p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="font-display font-bold text-lg mb-4 text-slate-800 dark:text-white">
        {t('daily_forecast')}
      </h2>

      <div className="space-y-2">
        {daily.slice(0, 7).map((day, i) => {
          const w = day.weather?.[0] || {};
          const minPos = ((day.temp.min - globalMin) / range) * 100;
          const maxPos = ((day.temp.max - globalMin) / range) * 100;

          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl
                hover:bg-white/40 dark:hover:bg-slate-800/30
                transition-all duration-200"
              style={{ opacity: 0, animation: `fadeInUp 0.4s ease-out ${i * 0.06}s forwards` }}
            >
              {/* Day */}
              <div className="w-20 shrink-0">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {formatDay(day.dt)}
                </span>
              </div>

              {/* Icon + Description */}
              <div className="flex items-center gap-1.5 w-28 shrink-0">
                <img
                  src={OWM_ICON_URL(w.icon || '01d', '2x')}
                  alt={w.description || ''}
                  className="w-8 h-8"
                />
                <span className="text-xs text-slate-500 dark:text-slate-200 capitalize truncate hidden sm:block font-semibold">
                  {capitalizeFirst(w.description || '')}
                </span>
              </div>

              {/* Precipitation */}
              {day.pop > 0 && (
                <div className="flex items-center gap-0.5 w-12 shrink-0">
                  <WaterDropIcon style={{ fontSize: 12 }} className="text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-400">
                    {Math.round(day.pop * 100)}%
                  </span>
                </div>
              )}
              {!day.pop && <div className="w-12 shrink-0" />}

              {/* Min Temp */}
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-300 w-10 text-right shrink-0">
                {formatTempValue(day.temp.min)}°
              </span>

              {/* Temperature Bar */}
              <div className="flex-1 h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/40 relative min-w-[80px]">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500"
                  style={{
                    left: `${minPos}%`,
                    width: `${Math.max(maxPos - minPos, 4)}%`,
                    transition: 'all 0.6s ease',
                  }}
                />
              </div>

              {/* Max Temp */}
              <span className="text-sm font-extrabold text-slate-700 dark:text-white w-10 text-left shrink-0">
                {formatTempValue(day.temp.max)}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
