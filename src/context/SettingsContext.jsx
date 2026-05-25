import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function SettingsProvider({ children }) {
  const [units, setUnitsState] = useState(() => {
    return localStorage.getItem('skypulse_units') || 'metric';
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('skypulse_language') || 'en';
  });

  const [customApiKey, setCustomApiKeyInternal] = useState(() => {
    return localStorage.getItem('skypulse_api_key') || '';
  });

  const [favorites, setFavoritesState] = useState(() => {
    try {
      const saved = localStorage.getItem('skypulse_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentState] = useState(() => {
    try {
      const saved = localStorage.getItem('skypulse_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('skypulse_units', units);
  }, [units]);

  useEffect(() => {
    localStorage.setItem('skypulse_language', language);
  }, [language]);

  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem('skypulse_api_key', customApiKey);
    } else {
      localStorage.removeItem('skypulse_api_key');
    }
  }, [customApiKey]);

  useEffect(() => {
    localStorage.setItem('skypulse_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('skypulse_recent', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const setUnits = useCallback((u) => setUnitsState(u), []);
  const setLanguage = useCallback((l) => setLanguageState(l), []);
  const setCustomApiKey = useCallback((key) => setCustomApiKeyInternal(key.trim()), []);

  const addFavorite = useCallback((city) => {
    setFavoritesState((prev) => {
      if (prev.some((f) => f.lat === city.lat && f.lon === city.lon)) return prev;
      return [...prev, city].slice(0, 10);
    });
  }, []);

  const removeFavorite = useCallback((city) => {
    setFavoritesState((prev) =>
      prev.filter((f) => !(f.lat === city.lat && f.lon === city.lon))
    );
  }, []);

  const isFavorite = useCallback(
    (city) => favorites.some((f) => f.lat === city.lat && f.lon === city.lon),
    [favorites]
  );

  const addRecentSearch = useCallback((city) => {
    setRecentState((prev) => {
      const filtered = prev.filter((r) => !(r.lat === city.lat && r.lon === city.lon));
      return [city, ...filtered].slice(0, 5);
    });
  }, []);

  // Compute effective active key
  const envKey = import.meta.env.VITE_OWM_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  const effectiveApiKey = customApiKey || envKey || 'demo_key_replace_me';

  const isDemoKey = useCallback((keyToCheck = effectiveApiKey) => {
    return (
      !keyToCheck ||
      keyToCheck === 'demo_key_replace_me' ||
      keyToCheck === 'your_openweathermap_api_key_here'
    );
  }, [effectiveApiKey]);

  return (
    <SettingsContext.Provider
      value={{
        units, setUnits,
        language, setLanguage,
        customApiKey, setCustomApiKey,
        effectiveApiKey,
        isDemoKey,
        favorites, addFavorite, removeFavorite, isFavorite,
        recentSearches, addRecentSearch,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

