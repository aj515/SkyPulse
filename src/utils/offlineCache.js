import { CACHE_TTL } from './constants';

const CACHE_PREFIX = 'skypulse_cache_';

export function getCachedData(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

// Returns data even if the TTL has expired — used for stale-while-revalidate.
export function getStaleData(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw).data ?? null;
  } catch {
    return null;
  }
}

export function setCachedData(key, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Storage full — clear oldest entries
    clearOldCache();
    try {
      localStorage.setItem(
        CACHE_PREFIX + key,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch {
      // Give up silently
    }
  }
}

export function clearOldCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        keys.push({ key, timestamp: parsed.timestamp || 0 });
      } catch {
        localStorage.removeItem(key);
      }
    }
  }
  keys.sort((a, b) => a.timestamp - b.timestamp);
  // Remove oldest half
  const toRemove = keys.slice(0, Math.ceil(keys.length / 2));
  toRemove.forEach(({ key }) => localStorage.removeItem(key));
}

export function isOnline() {
  return navigator.onLine;
}
