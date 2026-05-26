import axios from 'axios';
import { BASE_URL, ENDPOINTS } from '../utils/constants';
import { getCachedData, setCachedData, getStaleData } from '../utils/offlineCache';
import { searchDemoCities } from '../utils/demoData';

function getEffectiveApiKey() {
  return localStorage.getItem('skypulse_api_key') || import.meta.env.VITE_OWM_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key_replace_me';
}

function isDemoKey(key) {
  return !key || key === 'demo_key_replace_me' || key === 'your_openweathermap_api_key_here';
}

// In production with no custom key, route through the Vercel proxy so OWM_API_KEY
// stays server-side and is never included in the client bundle.
function shouldUseProxy() {
  return !import.meta.env.DEV && !localStorage.getItem('skypulse_api_key');
}

// Direct-to-OWM axios instance (dev mode or custom user key).
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  config.params = { ...config.params, appid: getEffectiveApiKey() };
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

// In-flight request deduplication: same cache key → same Promise.
const inFlight = new Map();

async function doRequest(endpoint, params, signal) {
  if (shouldUseProxy()) {
    const { data } = await axios.get('/api/owm', {
      params: { endpoint, ...params },
      signal,
      timeout: 12000,
    });
    return data;
  }
  const { data } = await api.get(endpoint, { params, signal });
  return data;
}

async function cachedGet(endpoint, params = {}, signal = null) {
  const key = cacheKey(endpoint, params);

  // Fresh cache hit → return immediately, no network call.
  const fresh = getCachedData(key);
  if (fresh) return fresh;

  const stale = getStaleData(key);

  // Helper that deduplicates concurrent fetches for the same key.
  const fetchFresh = (sig = null) => {
    if (inFlight.has(key)) return inFlight.get(key);
    const p = doRequest(endpoint, params, sig)
      .then((data) => { setCachedData(key, data); return data; })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, p);
    return p;
  };

  if (stale) {
    // Stale-while-revalidate: serve expired data instantly, refresh in background.
    // Background fetch uses no signal so it isn't cancelled by the caller aborting.
    fetchFresh(null).catch(() => {});
    return stale;
  }

  try {
    return await fetchFresh(signal);
  } catch (error) {
    // Last resort: return any cached entry even if expired (covers full offline).
    const raw = localStorage.getItem(`skypulse_cache_${key}`);
    if (raw) {
      try { return JSON.parse(raw).data; } catch { /* fall through */ }
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

// signal is passed from SearchBar's AbortController so stale searches are cancelled.
export async function geocodeCity(query, limit = 5, signal = null) {
  if (!query || query.length < 2) return [];

  const activeKey = getEffectiveApiKey();
  if (isDemoKey(activeKey)) {
    return searchDemoCities(query, limit);
  }

  const key = cacheKey(ENDPOINTS.GEOCODE, { q: query, limit });
  const cached = getCachedData(key);
  if (cached) return cached;

  try {
    let data;
    if (shouldUseProxy()) {
      ({ data } = await axios.get('/api/owm', {
        params: { endpoint: ENDPOINTS.GEOCODE, q: query, limit },
        signal,
        timeout: 10000,
      }));
    } else {
      ({ data } = await api.get(ENDPOINTS.GEOCODE, {
        params: { q: query, limit },
        signal,
      }));
    }
    setCachedData(key, data);
    return data;
  } catch (err) {
    // Don't fall back to demo results for aborted requests.
    if (err.name === 'CanceledError' || err.name === 'AbortError') throw err;
    return searchDemoCities(query, limit);
  }
}

export async function reverseGeocode(lat, lon) {
  return cachedGet(ENDPOINTS.REVERSE_GEOCODE, { lat, lon, limit: 1 });
}

export async function fetchAllWeatherData(lat, lon, units = 'metric', lang = 'en') {
  const owmLang = lang === 'fil' ? 'tl' : lang;

  try {
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
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(lat, lon, units, owmLang),
      fetchForecast(lat, lon, units, owmLang),
    ]);

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
  }
}
