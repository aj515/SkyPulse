export const API_KEY = import.meta.env.VITE_OWM_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key_replace_me';
export const BASE_URL = 'https://api.openweathermap.org';

export const ENDPOINTS = {
  ONE_CALL: '/data/3.0/onecall',
  FORECAST: '/data/2.5/forecast',
  GEOCODE: '/geo/1.0/direct',
  REVERSE_GEOCODE: '/geo/1.0/reverse',
  WEATHER: '/data/2.5/weather',
};

export const OWM_ICON_URL = (code, size = '4x') =>
  `https://openweathermap.org/img/wn/${code}@${size}.png`;

export const WEATHER_BACKGROUNDS = {
  Clear: { light: 'from-amber-400/20 to-sky-300/20', dark: 'from-amber-500/10 to-sky-700/10' },
  Clouds: { light: 'from-slate-300/30 to-sky-200/20', dark: 'from-slate-600/20 to-slate-800/10' },
  Rain: { light: 'from-sky-400/20 to-slate-400/20', dark: 'from-sky-700/10 to-slate-700/10' },
  Drizzle: { light: 'from-sky-300/20 to-slate-300/20', dark: 'from-sky-600/10 to-slate-600/10' },
  Thunderstorm: { light: 'from-violet-400/20 to-slate-500/20', dark: 'from-violet-700/10 to-slate-800/10' },
  Snow: { light: 'from-sky-100/30 to-white/30', dark: 'from-sky-900/10 to-slate-800/10' },
  Mist: { light: 'from-slate-200/30 to-slate-300/30', dark: 'from-slate-700/10 to-slate-800/10' },
  Haze: { light: 'from-amber-200/20 to-slate-300/20', dark: 'from-amber-800/10 to-slate-700/10' },
  Fog: { light: 'from-slate-200/30 to-slate-400/20', dark: 'from-slate-700/10 to-slate-800/10' },
  Dust: { light: 'from-amber-300/20 to-orange-200/20', dark: 'from-amber-800/10 to-orange-800/10' },
  default: { light: 'from-sky-200/20 to-slate-200/20', dark: 'from-sky-800/10 to-slate-800/10' },
};

export const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export const UV_LEVELS = [
  { max: 2, label: 'Low', color: '#22c55e' },
  { max: 5, label: 'Moderate', color: '#fbbf24' },
  { max: 7, label: 'High', color: '#f97316' },
  { max: 10, label: 'Very High', color: '#ef4444' },
  { max: Infinity, label: 'Extreme', color: '#8b5cf6' },
];

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
  { code: 'zh_cn', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export const DEFAULT_CITIES = [
  { name: 'Manila', country: 'PH', lat: 14.5995, lon: 120.9842 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
];

export const MAP_LAYERS = [
  { id: 'temp', label: 'Temperature', url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'precipitation', label: 'Precipitation', url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'clouds', label: 'Clouds', url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'wind', label: 'Wind', url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
];

export const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
