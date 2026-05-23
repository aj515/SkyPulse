import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { geocodeCity } from '../api/weather';
import { useSettings } from '../context/SettingsContext';
import { useWeatherContext } from '../context/WeatherContext';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';

export default function SearchBar({ onGeolocate }) {
  const { t } = useTranslation();
  const { addRecentSearch, recentSearches } = useSettings();
  const { fetchWeather } = useWeatherContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback(
    async (q) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await geocodeCity(q);
        setResults(
          data.map((item) => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon,
          }))
        );
      } catch {
        setResults([]);
      }
      setLoading(false);
    },
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
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

  const showRecent = open && query.length < 2 && recentSearches.length > 0;
  const showResults = open && results.length > 0 && query.length >= 2;

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
          onFocus={() => setOpen(true)}
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
      {(showResults || showRecent) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50
          bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
          border border-slate-200/60 dark:border-slate-700/40
          rounded-xl shadow-xl overflow-hidden
          animate-fade-in">

          {/* Recent Searches */}
          {showRecent && (
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
                  <HistoryIcon style={{ fontSize: 16 }} className="text-slate-300 dark:text-slate-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {city.name}
                  </span>
                  {city.country && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">{city.country}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {showResults &&
            results.map((city, i) => (
              <button
                key={`result-${i}`}
                onClick={() => handleSelectCity(city)}
                className="w-full px-3 py-2.5 text-left flex items-center gap-2
                  hover:bg-sky-50/60 dark:hover:bg-sky-900/20 transition-colors"
              >
                <SearchIcon style={{ fontSize: 16 }} className="text-slate-300 dark:text-slate-600" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {city.name}
                  </span>
                  {city.state && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                      {city.state}
                    </span>
                  )}
                </div>
                {city.country && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
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
        </div>
      )}
    </div>
  );
}
