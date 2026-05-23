// Demo weather data for offline/demo mode when no API key is set

function cToF(c) {
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

function msToMph(ms) {
  return Math.round(ms * 2.237 * 10) / 10;
}

export function getDemoWeatherData(units = 'metric', seed = 'Manila') {
  const isImperial = units === 'imperial';
  const convert = (c) => isImperial ? cToF(c) : c;
  const convertWind = (ms) => isImperial ? msToMph(ms) : ms;

  // Generate a unique temperature offset and weather condition based on the city name seed
  const charSum = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const tempOffset = (charSum % 15) - 7; // -7 to +7 degrees
  const humidityOffset = (charSum % 21) - 10; // -10 to +10
  const windOffset = (charSum % 7) - 3; // -3 to +3

  const baseTemp = 28 + tempOffset;
  const baseHumidity = Math.max(30, Math.min(95, 72 + humidityOffset));
  const baseWind = Math.max(1, 4.2 + windOffset);

  // Determine standard condition
  const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Haze'];
  const condIdx = charSum % conditions.length;
  const mainCondition = conditions[condIdx];
  
  const descriptions = {
    Clear: { id: 800, desc: 'clear sky', icon: '01d' },
    Clouds: { id: 802, desc: 'scattered clouds', icon: '03d' },
    Rain: { id: 500, desc: 'light rain', icon: '10d' },
    Drizzle: { id: 300, desc: 'light intensity drizzle', icon: '09d' },
    Thunderstorm: { id: 200, desc: 'thunderstorm with light rain', icon: '11d' },
    Haze: { id: 721, desc: 'haze', icon: '50d' },
  };

  const selectedCond = descriptions[mainCondition];

  return {
    current: {
      dt: Math.floor(Date.now() / 1000),
      temp: convert(baseTemp),
      feels_like: convert(baseTemp + (baseHumidity > 60 ? 3 : -1)),
      humidity: baseHumidity,
      pressure: 1008 + (charSum % 15),
      visibility: 10000 - (mainCondition === 'Haze' ? 4000 : 0),
      wind_speed: convertWind(baseWind),
      wind_deg: (charSum * 17) % 360,
      weather: [
        {
          id: selectedCond.id,
          main: mainCondition,
          description: selectedCond.desc,
          icon: selectedCond.icon,
        },
      ],
      clouds: mainCondition === 'Clear' ? 5 : (mainCondition === 'Clouds' ? 40 : 80),
      uvi: Math.max(1, Math.min(11, 8 - Math.abs(tempOffset))),
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 21600,
    },
    hourly: Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(Date.now() / 1000) + i * 3600;
      const hourTemp = baseTemp + Math.sin((i / 24) * Math.PI * 2) * 5;
      const icons = ['01d', '02d', '03d', '04d', '10d', '01n', '02n'];
      const descs = ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'light rain', 'clear sky', 'few clouds'];
      const idx = (i + charSum) % icons.length;
      return {
        dt: hour,
        temp: convert(Math.round(hourTemp * 10) / 10),
        feels_like: convert(Math.round((hourTemp + 2) * 10) / 10),
        humidity: Math.max(30, Math.min(95, baseHumidity - 10 + Math.round(Math.sin(i * 0.3) * 15))),
        weather: [
          { id: 800 + idx, main: idx < 4 ? (idx === 0 ? 'Clear' : 'Clouds') : 'Rain', description: descs[idx], icon: icons[idx] },
        ],
        wind_speed: convertWind(Math.max(1, baseWind - 1 + Math.round(Math.random() * 3 * 10) / 10)),
        wind_deg: Math.round(Math.random() * 360),
        pop: Math.max(0, Math.min(1, 0.1 + Math.sin(i * 0.2) * 0.4)),
        clouds: Math.max(0, Math.min(100, 20 + Math.round(Math.random() * 60))),
      };
    }),
    daily: Array.from({ length: 8 }, (_, i) => {
      const day = Math.floor(Date.now() / 1000) + i * 86400;
      const dayTemp = baseTemp + Math.sin((i / 7) * Math.PI) * 4;
      const icons = ['01d', '02d', '03d', '10d', '04d', '01d', '02d', '10d'];
      const mains = ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clouds', 'Clear', 'Clouds', 'Rain'];
      const descs = ['clear sky', 'few clouds', 'scattered clouds', 'moderate rain', 'overcast clouds', 'clear sky', 'few clouds', 'light rain'];
      const idx = (i + charSum) % icons.length;
      return {
        dt: day,
        temp: {
          min: convert(Math.round((dayTemp - 4) * 10) / 10),
          max: convert(Math.round((dayTemp + 4) * 10) / 10),
          day: convert(Math.round(dayTemp * 10) / 10),
        },
        weather: [
          { id: 800 + idx, main: mains[idx], description: descs[idx], icon: icons[idx] },
        ],
        humidity: Math.max(30, Math.min(95, baseHumidity - 5 + Math.round(Math.random() * 15))),
        wind_speed: convertWind(Math.max(1, baseWind + Math.round(Math.random() * 4 * 10) / 10)),
        pop: Math.max(0, Math.min(1, Math.random() * 0.6)),
      };
    }),
    alerts: charSum % 5 === 0 ? [
      {
        event: 'Heat Advisory',
        sender_name: 'PAGASA - Weather Bureau',
        description:
          'A heat advisory is in effect. Heat index values may reach up to 42°C. Take precautions to avoid heat-related illnesses.',
      },
    ] : [],
    timezone_offset: 28800,
    timezone: `City/${seed}`,
    source: 'demo',
  };
}

export const DEMO_CITY = {
  name: 'Manila',
  country: 'PH',
  state: 'Metro Manila',
  lat: 14.5995,
  lon: 120.9842,
};

export const MOCK_CITIES = [
  { name: 'Manila', country: 'PH', state: 'Metro Manila', lat: 14.5995, lon: 120.9842 },
  { name: 'Quezon City', country: 'PH', state: 'Metro Manila', lat: 14.6760, lon: 121.0437 },
  { name: 'Cebu City', country: 'PH', state: 'Cebu', lat: 10.3157, lon: 123.8854 },
  { name: 'Davao City', country: 'PH', state: 'Davao del Sur', lat: 7.1907, lon: 125.4553 },
  { name: 'Tokyo', country: 'JP', state: 'Tokyo Prefecture', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', country: 'US', state: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'GB', state: 'England', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'FR', state: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', country: 'AU', state: 'New South Wales', lat: -33.8688, lon: 151.2093 },
  { name: 'Singapore', country: 'SG', state: 'Central Region', lat: 1.3521, lon: 103.8198 },
  { name: 'Los Angeles', country: 'US', state: 'California', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.8781, lon: -87.6298 },
  { name: 'Miami', country: 'US', state: 'Florida', lat: 25.7617, lon: -80.1918 },
  { name: 'San Francisco', country: 'US', state: 'California', lat: 37.7749, lon: -122.4194 },
  { name: 'Toronto', country: 'CA', state: 'Ontario', lat: 43.6532, lon: -79.3832 },
  { name: 'Vancouver', country: 'CA', state: 'British Columbia', lat: 49.2827, lon: -123.1207 },
  { name: 'Hong Kong', country: 'HK', state: 'Hong Kong Island', lat: 22.3193, lon: 114.1694 },
  { name: 'Seoul', country: 'KR', state: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { name: 'Beijing', country: 'CN', state: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Mumbai', country: 'IN', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Dubai', country: 'AE', state: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Berlin', country: 'DE', state: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Rome', country: 'IT', state: 'Lazio', lat: 41.9028, lon: 12.4964 },
  { name: 'Madrid', country: 'ES', state: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Moscow', country: 'RU', state: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Bangkok', country: 'TH', state: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Jakarta', country: 'ID', state: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Cape Town', country: 'ZA', state: 'Western Cape', lat: -33.9249, lon: 18.4241 },
  { name: 'Rio de Janeiro', country: 'BR', state: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Buenos Aires', country: 'AR', state: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Cairo', country: 'EG', state: 'Cairo', lat: 30.0444, lon: 31.2357 },
];

export function searchDemoCities(query, limit = 5) {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase().trim();
  return MOCK_CITIES.filter((city) =>
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery) ||
    (city.state && city.state.toLowerCase().includes(normalizedQuery))
  ).slice(0, limit);
}

