import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeatherContext } from '../context/WeatherContext';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function WeatherAlerts() {
  const { t } = useTranslation();
  const { alerts } = useWeatherContext();
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card-static p-4 animate-fade-in-up flex items-center gap-3" style={{ animationDelay: '0.35s' }}>
        <CheckCircleIcon style={{ fontSize: 20 }} className="text-green-500" />
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {t('no_alerts')}
        </span>
      </div>
    );
  }

  const getSeverityClass = (event) => {
    const lower = (event || '').toLowerCase();
    if (lower.includes('extreme') || lower.includes('tornado') || lower.includes('hurricane'))
      return 'alert-extreme';
    if (lower.includes('severe') || lower.includes('warning'))
      return 'alert-severe';
    if (lower.includes('watch') || lower.includes('advisory'))
      return 'alert-moderate';
    return 'alert-minor';
  };

  return (
    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
      <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        <WarningAmberIcon style={{ fontSize: 20 }} className="text-amber-500" />
        {t('weather_alerts')}
      </h2>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`glass-card-static !rounded-xl p-4 ${getSeverityClass(alert.event)} cursor-pointer
            transition-all duration-200 hover:shadow-md`}
          onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <WarningAmberIcon style={{ fontSize: 18 }} className="text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                  {alert.event}
                </p>
                {alert.sender_name && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold truncate">
                    {alert.sender_name}
                  </p>
                )}
              </div>
            </div>
            {expandedIndex === i ? (
              <ExpandLessIcon style={{ fontSize: 20 }} className="text-slate-400 shrink-0" />
            ) : (
              <ExpandMoreIcon style={{ fontSize: 20 }} className="text-slate-400 shrink-0" />
            )}
          </div>
          {expandedIndex === i && alert.description && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {alert.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
