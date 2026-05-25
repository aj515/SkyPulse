import { createContext, useContext, useReducer, useCallback } from 'react';
import { fetchAllWeatherData, reverseGeocode } from '../api/weather';
import { useSettings } from './SettingsContext';
import { getDemoWeatherData, DEMO_CITY } from '../utils/demoData';
import { API_KEY } from '../utils/constants';

const WeatherContext = createContext();

export function useWeatherContext() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeatherContext must be used within WeatherProvider');
  return ctx;
}

const initialState = {
  current: null,
  hourly: [],
  daily: [],
  alerts: [],
  city: null,
  timezone_offset: 0,
  loading: false,
  error: null,
  source: null,
};

function weatherReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        current: action.payload.current,
        hourly: action.payload.hourly,
        daily: action.payload.daily,
        alerts: action.payload.alerts,
        city: action.payload.city,
        timezone_offset: action.payload.timezone_offset,
        source: action.payload.source,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_CITY':
      return { ...state, city: action.payload };
    default:
      return state;
  }
}

export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  const { units, language, effectiveApiKey, isDemoKey } = useSettings();

  const fetchWeather = useCallback(
    async (lat, lon, cityInfo = null) => {
      dispatch({ type: 'FETCH_START' });

      // Short-circuit instantly if in demo mode to prevent slow connection timeouts
      if (isDemoKey(effectiveApiKey)) {
        const demoCity = cityInfo || DEMO_CITY;
        const demoData = getDemoWeatherData(units, demoCity.name);
        
        // Add a slight artificial delay so the UI feels fluid rather than jarringly instant
        setTimeout(() => {
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              current: demoData.current,
              hourly: demoData.hourly,
              daily: demoData.daily,
              alerts: demoData.alerts,
              city: demoCity,
              timezone_offset: demoData.timezone_offset,
              source: 'demo',
            },
          });
        }, 300);
        return;
      }

      try {
        const data = await fetchAllWeatherData(lat, lon, units, language);

        let city = cityInfo;
        if (!city) {
          try {
            const geo = await reverseGeocode(lat, lon);
            if (geo && geo.length > 0) {
              city = {
                name: geo[0].name,
                country: geo[0].country,
                state: geo[0].state,
                lat,
                lon,
              };
            }
          } catch {
            city = { name: data.timezone || 'Unknown', country: '', lat, lon };
          }
        }

        if (!city) {
          city = data.cityData
            ? { name: data.cityData.name, country: data.cityData.sys?.country || '', lat, lon }
            : { name: 'Unknown', country: '', lat, lon };
        }

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            current: data.current,
            hourly: data.hourly,
            daily: data.daily,
            alerts: data.alerts,
            city,
            timezone_offset: data.timezone_offset,
            source: data.source,
          },
        });
      } catch (error) {
        // Safe robust fallback: Use demo weather data immediately so the app never crashes!
        const demoCity = cityInfo || DEMO_CITY;
        const demoData = getDemoWeatherData(units, demoCity.name);
        
        // Check if this error is an authentication / authorization issue (401)
        const isAuthError = error.response?.status === 401 || error.message?.includes('401');
        const sourceLabel = isAuthError ? 'demo_unauthorized' : 'demo_error_fallback';
        
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            current: demoData.current,
            hourly: demoData.hourly,
            daily: demoData.daily,
            alerts: demoData.alerts,
            city: demoCity,
            timezone_offset: demoData.timezone_offset,
            source: sourceLabel,
          },
        });
      }
    },
    [units, language]
  );

  return (
    <WeatherContext.Provider value={{ ...state, fetchWeather, dispatch }}>
      {children}
    </WeatherContext.Provider>
  );
}
