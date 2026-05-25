import axios from 'axios';
import { BASE_URL, ENDPOINTS } from '../utils/constants';
import { getCachedData, setCachedData } from '../utils/offlineCache';
import { searchDemoCities } from '../utils/demoData';

function getEffectiveApiKey() {
  return localStorage.getItem('skypulse_api_key') || import.meta.env.VITE_OWM_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key_replace_me';
}

function isDemoKey(key) {
  return !key || key === 'demo_key_replace_me' || key === 'your_openweathermap_api_key_here';
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Dynamically inject the active API key on every request
api.interceptors.request.use((config) => {
  const activeKey = getEffectiveApiKey();
  config.params = {
    ...config.params,
    appid: activeKey,
  };
  return config;
});

function cacheKey(endpoint, params) {
  const sorted = Object.entries(params)
    .filter(([k]) => k !== 'appid')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${endpoint}?${sorted}`;
}

async function cachedGet(endpoint, params = {}) {
  const key = cacheKey(endpoint, params);
  const cached = getCachedData(key);
  if (cached) return cached;

  try {
    const { data } = await api.get(endpoint, { params });
    setCachedData(key, data);
    return data;
  } catch (error) {
    // If offline, try to return expired cache
    const raw = localStorage.getItem(`skypulse_cache_${key}`);
    if (raw) {
      try {
        return JSON.parse(raw).data;
      } catch { /* fall through */ }
    }
    throw error;
  }
}

export async function fetchCurrentWeather(lat, lon, units = 'metric', lang = 'en') {
  return cachedGet(ENDPOINTS.WEATHER, { lat, lon, units, lang });
}

export async function fetchOneCall(lat, lon, units = 'metric', lang = 'en', exclude = 'minutely') {
  return cachedGet(ENDPOINTS.ONE_CALL, { lat, lon, units, lang, exclude });
}

export async function fetchForecast(lat, lon, units = 'metric', lang = 'en') {
  return cachedGet(ENDPOINTS.FORECAST, { lat, lon, units, lang });
}

export async function geocodeCity(query, limit = 5) {
  if (!query || query.length < 2) return [];

  // If running in demo mode, immediately return local search suggestions
  const activeKey = getEffectiveApiKey();
  if (isDemoKey(activeKey)) {
    return searchDemoCities(query, limit);
  }

  const key = cacheKey(ENDPOINTS.GEOCODE, { q: query, limit });
  const cached = getCachedData(key);
  if (cached) return cached;

  try {
    const { data } = await api.get(ENDPOINTS.GEOCODE, {
      params: { q: query, limit },
    });
    setCachedData(key, data);
    return data;
  } catch {
    // Fallback to local search on network or API failure (e.g. 401)
    return searchDemoCities(query, limit);
  }
}

export async function reverseGeocode(lat, lon) {
  return cachedGet(ENDPOINTS.REVERSE_GEOCODE, { lat, lon, limit: 1 });
}

export async function fetchAllWeatherData(lat, lon, units = 'metric', lang = 'en') {
  const owmLang = lang === 'fil' ? 'tl' : lang;

  try {
    // Try One Call API first (requires subscription)
    const oneCall = await fetchOneCall(lat, lon, units, owmLang);
    return {
      current: oneCall.current,
      hourly: oneCall.hourly?.slice(0, 48) || [],
      daily: oneCall.daily || [],
      alerts: oneCall.alerts || [],
      timezone_offset: oneCall.timezone_offset || 0,
      timezone: oneCall.timezone || '',
      source: 'onecall',
    };
  } catch {
    // Fallback to free endpoints
    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(lat, lon, units, owmLang),
        fetchForecast(lat, lon, units, owmLang),
      ]);

      // Process forecast into hourly and daily
      const hourly = forecast.list?.slice(0, 16).map((item) => ({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        weather: item.weather,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        pop: item.pop || 0,
        clouds: item.clouds.all,
      })) || [];

      // Group by day for daily forecast
      const dailyMap = {};
      forecast.list?.forEach((item) => {
        const day = new Date(item.dt * 1000).toDateString();
        if (!dailyMap[day]) {
          dailyMap[day] = {
            dt: item.dt,
            temps: [],
            weather: item.weather,
            humidity: item.main.humidity,
            wind_speed: item.wind.speed,
            pop: item.pop || 0,
          };
        }
        dailyMap[day].temps.push(item.main.temp);
      });

      const daily = Object.values(dailyMap).map((d) => ({
        dt: d.dt,
        temp: {
          min: Math.min(...d.temps),
          max: Math.max(...d.temps),
          day: d.temps[Math.floor(d.temps.length / 2)],
        },
        weather: d.weather,
        humidity: d.humidity,
        wind_speed: d.wind_speed,
        pop: d.pop,
      }));

      return {
        current: {
          dt: current.dt,
          temp: current.main.temp,
          feels_like: current.main.feels_like,
          humidity: current.main.humidity,
          pressure: current.main.pressure,
          visibility: current.visibility,
          wind_speed: current.wind.speed,
          wind_deg: current.wind.deg,
          weather: current.weather,
          clouds: current.clouds.all,
          sunrise: current.sys.sunrise,
          sunset: current.sys.sunset,
          uvi: 0,
        },
        hourly,
        daily,
        alerts: [],
        timezone_offset: current.timezone || 0,
        timezone: current.name || '',
        source: 'free',
        cityData: current,
      };
    } catch (error) {
      throw error;
    }
  }
}
