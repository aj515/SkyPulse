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
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let name = '';
        let country = '';

        // Try to reverse geocode using free Nominatim OpenStreetMap API first (highly precise for GPS lat/lon!)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            name = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village || data.address?.suburb || '';
            country = data.address?.country_code?.toUpperCase() || '';
          }
        } catch (e) {
          console.error('Nominatim reverse geocode failed:', e);
        }

        // If Nominatim failed to get a city name, fall back to IP Geolocation to get general city
        if (!name) {
          try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
              const data = await res.json();
              name = data.city;
              country = data.country_code;
            }
          } catch (e) {
            console.error('IP Geolocation fallback failed for GPS name:', e);
          }
        }

        setPosition({
          lat,
          lon,
          name,
          country,
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
