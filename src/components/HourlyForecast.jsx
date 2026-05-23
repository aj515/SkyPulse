import { useMemo, useRef, useState, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import { OWM_ICON_URL } from '../utils/constants';
import { WeatherIcon } from './WeatherIcon';
import { formatTempValue, formatHour } from '../utils/formatters';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function HourlyForecast() {
  const { t } = useTranslation();
  const { units } = useSettings();
  const { hourly, timezone_offset } = useWeatherContext();

  const hours = useMemo(() => (hourly || []).slice(0, 24), [hourly]);
  const scrollContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);

  // Sync selected index with ChartJS active point and tooltip
  useEffect(() => {
    if (chartRef.current && hours.length > 0) {
      const chart = chartRef.current;
      // Delay slightly to ensure Chart.js has fully rendered
      const timer = setTimeout(() => {
        try {
          const datasetMeta = chart.getDatasetMeta(0);
          const point = datasetMeta.data[selectedHourIndex];
          
          if (point) {
            chart.setActiveElements([
              { datasetIndex: 0, index: selectedHourIndex }
            ]);
            
            // Set tooltip active elements with precise pixel coordinates of the chart point
            chart.tooltip.setActiveElements([
              { datasetIndex: 0, index: selectedHourIndex }
            ], { x: point.x, y: point.y });
            
            chart.update();
          }
        } catch (e) {
          console.warn('Chart elements not ready for selection sync:', e);
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [selectedHourIndex, hours]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const chartData = useMemo(() => {
    if (!hours.length) return null;
    const labels = hours.map((h) => formatHour(h.dt, timezone_offset));
    const temps = hours.map((h) => formatTempValue(h.temp));
    const pops = hours.map((h) => Math.round((h.pop || 0) * 100));

    const isDark = document.documentElement.classList.contains('dark');

    return {
      labels,
      datasets: [
        {
          label: t('temperature'),
          data: temps,
          borderColor: isDark ? '#60a5fa' : '#3b82f6',
          backgroundColor: isDark
            ? 'rgba(96, 165, 250, 0.1)'
            : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: isDark ? '#60a5fa' : '#3b82f6',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          borderWidth: 2.5,
          yAxisID: 'y',
        },
        {
          label: t('pop'),
          data: pops,
          borderColor: isDark ? '#38bdf8' : '#0ea5e9',
          backgroundColor: isDark
            ? 'rgba(56, 189, 248, 0.08)'
            : 'rgba(14, 165, 233, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: [4, 4],
          yAxisID: 'y1',
        },
      ],
    };
  }, [hours, timezone_offset, t]);

  const chartOptions = useMemo(() => {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f1f5f9' : '#1e293b',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.5)',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 0) {
                return ` ${ctx.parsed.y}${units === 'metric' ? '°C' : '°F'}`;
              }
              return ` ${ctx.parsed.y}% rain`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { size: 10, family: 'Inter' },
            maxTicksLimit: 12,
          },
        },
        y: {
          position: 'left',
          grid: {
            color: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(203, 213, 225, 0.3)',
            drawBorder: false,
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { size: 10, family: 'Inter' },
            callback: (v) => `${v}°`,
          },
        },
        y1: {
          position: 'right',
          min: 0,
          max: 100,
          grid: { display: false },
          ticks: {
            color: isDark ? '#38bdf8' : '#0ea5e9',
            font: { size: 10, family: 'Inter' },
            callback: (v) => `${v}%`,
          },
        },
      },
    };
  }, [units]);

  if (!hours.length) return null;

  return (
    <div className="glass-card-static p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="font-display font-bold text-lg mb-4 text-slate-800 dark:text-white">
        {t('hourly_forecast')}
      </h2>

      {/* Scrollable Cards Wrapper */}
      <div className="relative group mb-4">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full 
            bg-white/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700/45 
            flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-md 
            opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 
            hover:bg-sky-50 dark:hover:bg-slate-700 active:scale-90 cursor-pointer"
          aria-label="Scroll Left"
        >
          <ChevronLeftIcon style={{ fontSize: 20 }} />
        </button>

        {/* Scrollable Container */}
        <div ref={scrollContainerRef} className="scroll-container flex gap-2 pb-1.5">
          {hours.map((hour, i) => {
            const w = hour.weather?.[0] || {};
            return (
              <div
                key={i}
                onClick={() => setSelectedHourIndex(i)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2.5 rounded-xl
                  transition-all duration-200 min-w-[68px] cursor-pointer origin-center
                  ${selectedHourIndex === i 
                    ? 'bg-sky-500/15 dark:bg-sky-500/25 border-2 border-sky-400 dark:border-sky-500 scale-105 shadow-sm shadow-sky-500/10'
                    : 'bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/20 hover:bg-white/60 dark:hover:bg-slate-700/50 hover:scale-102'}`}
                style={{ opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 0.03}s forwards` }}
              >
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-300">
                  {i === 0 ? 'Now' : formatHour(hour.dt, timezone_offset)}
                </span>
                <WeatherIcon
                  iconCode={w.icon || '01d'}
                  className="w-7 h-7"
                  showGlow={false}
                />
                <span className="text-sm font-extrabold text-slate-700 dark:text-white">
                  {formatTempValue(hour.temp)}°
                </span>
                {hour.pop > 0 && (
                  <span className="text-[9px] font-bold text-sky-400">
                    {Math.round(hour.pop * 100)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full 
            bg-white/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700/45 
            flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-md 
            opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 
            hover:bg-sky-50 dark:hover:bg-slate-700 active:scale-90 cursor-pointer"
          aria-label="Scroll Right"
        >
          <ChevronRightIcon style={{ fontSize: 20 }} />
        </button>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="chart-container" style={{ height: '220px' }}>
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
