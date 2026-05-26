import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { geocodeCity, fetchCurrentWeather } from '../api/weather';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import { DEFAULT_CITIES } from '../utils/constants';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';

function formatTemp(temp, units) {
  const r = Math.round(temp);
  if (units === 'imperial') return `${r}°F`;
  if (units === 'standard') return `${r} K`;
  return `${r}°C`;
}

function CityWeatherLine({ lat, lon, cityWeather, units }) {
  const w = cityWeather[`${lat},${lon}`];
  if (!w) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
      {w.icon && (
        <img
          src={`https://openweathermap.org/img/wn/${w.icon}.png`}
          alt=""
          className="w-4 h-4 -my-1"
        />
      )}
      <span className="font-medium">{formatTemp(w.temp, units)}</span>
      {w.desc && <span className="capitalize truncate">&middot; {w.desc}</span>}
    </span>
  );
}

export default function SearchBar({ onGeolocate }) {
  const { t } = useTranslation();
  const { addRecentSearch, recentSearches, units, effectiveApiKey, isDemoKey } = useSettings();
  const { fetchWeather } = useWeatherContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cityWeather, setCityWeather] = useState({});
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const fetchedRef = useRef(new Set());

  // When units change, invalidate the weather preview cache so temps re-fetch with correct unit.
  useEffect(() => {
    fetchedRef.current = new Set();
    setCityWeather({});
  }, [units]);

  // Close dropdown on outside click.
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadWeatherForCities = useCallback(
    async (cities) => {
      // Skip fetching in demo mode — no real temps to show.
      if (isDemoKey(effectiveApiKey)) return;

      const toFetch = cities.filter((c) => {
        const key = `${c.lat},${c.lon}`;
        if (fetchedRef.current.has(key)) return false;
        fetchedRef.current.add(key);
        return true;
      });
      if (!toFetch.length) return;

      const settled = await Promise.allSettled(
        toFetch.map((city) => fetchCurrentWeather(city.lat, city.lon, units))
      );

      setCityWeather((prev) => {
        const next = { ...prev };
        settled.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            const d = result.value;
            next[`${toFetch[i].lat},${toFetch[i].lon}`] = {
              temp: d.main.temp,
              desc: d.weather?.[0]?.description,
              icon: d.weather?.[0]?.icon,
            };
          }
        });
        return next;
      });
    },
    [units, effectiveApiKey, isDemoKey]
  );

  const handleSearch = useCallback(
    async (q) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      setLoading(true);
      try {
        const data = await geocodeCity(q, 5, signal);
        const mapped = data.map((item) => ({
          name: item.name,
          country: item.country,
          state: item.state,
          lat: item.lat,
          lon: item.lon,
        }));
        setResults(mapped);
        loadWeatherForCities(mapped);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [loadWeatherForCities]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
  };

  const handleFocus = () => {
    setOpen(true);
    // Preload weather for every city that will show on the suggestions screen.
    const suggestions = [
      ...recentSearches.slice(0, 5),
      ...DEFAULT_CITIES.filter(
        (d) => !recentSearches.some((r) => r.name === d.name && r.country === d.country)
      ),
    ];
    loadWeatherForCities(suggestions);
  };

  const handleSelectCity = (city) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    addRecentSearch(city);
    fetchWeather(city.lat, city.lon, city);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  // Popular cities = DEFAULT_CITIES minus anything already in recent searches.
  const popularCities = DEFAULT_CITIES.filter(
    (d) => !recentSearches.some((r) => r.name === d.name && r.country === d.country)
  );

  const showSuggestions =
    open && query.length < 2 && (recentSearches.length > 0 || popularCities.length > 0);
  const showResults = open && query.length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative flex items-center">
        <SearchIcon
          className="absolute left-3 text-slate-400 dark:text-slate-500"
          style={{ fontSize: 20 }}
        />
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={t('search_placeholder')}
          className="w-full pl-10 pr-20 py-2.5 rounded-xl
            bg-white/60 dark:bg-slate-800/60
            border border-slate-200/60 dark:border-slate-700/40
            backdrop-blur-md
            text-slate-800 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-sky-400/50 dark:focus:ring-sky-500/50
            transition-all duration-200
            text-sm font-medium"
          autoComplete="off"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            >
              <CloseIcon style={{ fontSize: 16 }} className="text-slate-400" />
            </button>
          )}
          <button
            onClick={onGeolocate}
            title={t('geolocation_prompt')}
            className="p-1.5 rounded-lg hover:bg-sky-100/60 dark:hover:bg-sky-900/30 transition-colors"
          >
            <MyLocationIcon style={{ fontSize: 18 }} className="text-sky-500" />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {(showSuggestions || showResults) && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50
            bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
            border border-slate-200/60 dark:border-slate-700/40
            rounded-xl shadow-xl overflow-hidden
            animate-fade-in"
        >
          {/* ── Suggestions (no query typed yet) ── */}
          {showSuggestions && (
            <>
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <HistoryIcon style={{ fontSize: 14 }} />
                    {t('recent_searches')}
                  </div>
                  {recentSearches.map((city, i) => (
                    <button
                      key={`recent-${i}`}
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-3 py-2.5 text-left flex items-center gap-2
                        hover:bg-sky-50/60 dark:hover:bg-sky-900/20 transition-colors"
                    >
                      <HistoryIcon style={{ fontSize: 16 }} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {city.name}
                          {city.state && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{city.state}</span>
                          )}
                        </div>
                        <CityWeatherLine lat={city.lat} lon={city.lon} cityWeather={cityWeather} units={units} />
                      </div>
                      {city.country && (
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                          {city.country}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {popularCities.length > 0 && (
                <div className={recentSearches.length > 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : ''}>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <PublicIcon style={{ fontSize: 14 }} />
                    Popular Cities
                  </div>
                  {popularCities.map((city, i) => (
                    <button
                      key={`popular-${i}`}
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-3 py-2.5 text-left flex items-center gap-2
                        hover:bg-sky-50/60 dark:hover:bg-sky-900/20 transition-colors"
                    >
                      <SearchIcon style={{ fontSize: 16 }} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {city.name}
                        </div>
                        <CityWeatherLine lat={city.lat} lon={city.lon} cityWeather={cityWeather} units={units} />
                      </div>
                      {city.country && (
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                          {city.country}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Search Results (query typed) ── */}
          {showResults && (
            <div>
              {results.map((city, i) => (
                <button
                  key={`result-${i}`}
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-2
                    hover:bg-sky-50/60 dark:hover:bg-sky-900/20 transition-colors"
                >
                  <SearchIcon style={{ fontSize: 16 }} className="text-slate-300 dark:text-slate-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {city.name}
                      {city.state && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{city.state}</span>
                      )}
                    </div>
                    <CityWeatherLine lat={city.lat} lon={city.lon} cityWeather={cityWeather} units={units} />
                  </div>
                  {city.country && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                      {city.country}
                    </span>
                  )}
                </button>
              ))}

              {loading && (
                <div className="px-3 py-3 text-center text-sm text-slate-400">
                  <div className="animate-pulse-gentle">Searching...</div>
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-slate-400 dark:text-slate-500">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
