import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchIpFallback = useCallback(async (fallbackErrorMsg) => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setPosition({
            lat: data.latitude,
            lon: data.longitude,
            name: data.city,
            country: data.country_code,
          });
          setLoading(false);
          return;
        }
      }
    } catch (ipErr) {
      console.error('IP Geolocation fallback failed:', ipErr);
    }
    setError(fallbackErrorMsg || 'Geolocation failed');
    setLoading(false);
  }, []);

  const requestPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      fetchIpFallback('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        fetchIpFallback(err.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [fetchIpFallback]);

  return { position, error, loading, requestPosition };
}
