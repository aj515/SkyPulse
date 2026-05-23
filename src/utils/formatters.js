import { WIND_DIRECTIONS, UV_LEVELS } from './constants';

export function formatTemp(temp, units = 'metric') {
  const rounded = Math.round(temp);
  return units === 'imperial' ? `${rounded}°F` : `${rounded}°C`;
}

export function formatTempValue(temp) {
  return Math.round(temp);
}

export function formatWind(speed, units = 'metric') {
  const rounded = Math.round(speed * 10) / 10;
  return units === 'imperial' ? `${rounded} mph` : `${rounded} m/s`;
}

export function formatWindDirection(deg) {
  const index = Math.round(deg / 22.5) % 16;
  return WIND_DIRECTIONS[index] || 'N';
}

export function formatPressure(pressure) {
  return `${pressure} hPa`;
}

export function formatVisibility(visibility) {
  if (visibility >= 1000) {
    return `${(visibility / 1000).toFixed(1)} km`;
  }
  return `${visibility} m`;
}

export function formatHumidity(humidity) {
  return `${humidity}%`;
}

export function formatUV(uvi) {
  const level = UV_LEVELS.find((l) => uvi <= l.max) || UV_LEVELS[UV_LEVELS.length - 1];
  return { value: Math.round(uvi * 10) / 10, label: level.label, color: level.color };
}

export function formatTime(timestamp, timezone = 0, locale = 'en') {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatHour(timestamp, timezone = 0, locale = 'en') {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDay(timestamp, locale = 'en') {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDate(timestamp, locale = 'en') {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDayShort(timestamp, locale = 'en') {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

export function getTimeOfDay(timestamp, sunrise, sunset) {
  if (timestamp >= sunrise && timestamp < sunset) return 'day';
  return 'night';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
