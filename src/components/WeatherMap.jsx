import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeatherContext } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';
import { MAP_LAYERS } from '../utils/constants';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CloudIcon from '@mui/icons-material/Cloud';
import AirIcon from '@mui/icons-material/Air';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useMemo(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// Interactive Vector Weather Radar Simulation
// Provides gorgeous, interactive weather layers instantly (works offline and in demo mode!)
function SimulatedRadar({ activeLayer, center, currentData }) {
  if (!currentData || !center) return null;
  const [lat, lon] = center;

  // ── TEMPERATURE LAYER (Isotherm gradient contours) ──
  if (activeLayer === 'temp') {
    const temp = currentData.temp;
    // Determine heat signature color based on temp value
    let heatColor = '#eab308'; // Warm (amber)
    if (temp > 30) heatColor = '#ef4444'; // Hot (red)
    else if (temp < 15) heatColor = '#3b82f6'; // Cold (blue)

    return (
      <>
        {/* Core high-intensity heat contour (pulsing) */}
        <Circle
          center={center}
          radius={28000}
          pathOptions={{
            color: heatColor,
            fillColor: heatColor,
            fillOpacity: 0.22,
            weight: 2,
            className: 'radar-pulse-effect',
          }}
        />
        {/* Ambient thermal boundary */}
        <Circle
          center={center}
          radius={65000}
          pathOptions={{
            color: heatColor,
            fillColor: heatColor,
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '6, 12',
          }}
        />
        {/* Dispersed convective contour */}
        <Circle
          center={center}
          radius={110000}
          pathOptions={{
            color: heatColor,
            fillColor: heatColor,
            fillOpacity: 0.04,
            weight: 1,
            dashArray: '3, 15',
          }}
        />
      </>
    );
  }

  // ── PRECIPITATION LAYER (Radar Doppler Echo Blobs) ──
  if (activeLayer === 'precipitation') {
    const weatherMain = currentData.weather?.[0]?.main || '';
    const hasRain = weatherMain === 'Rain' || weatherMain === 'Thunderstorm' || weatherMain === 'Drizzle';
    
    // Generate doppler cells. If raining, cells are strong and pulsing; if dry, soft convective cells
    const cells = hasRain
      ? [
          { offsetLat: 0.05, offsetLon: 0.04, radius: 16000, color: '#ef4444', opacity: 0.35 }, // Intense core
          { offsetLat: -0.03, offsetLon: -0.06, radius: 24000, color: '#eab308', opacity: 0.25 }, // Moderate rainfall
          { offsetLat: 0.1, offsetLon: -0.08, radius: 36000, color: '#22c55e', opacity: 0.15 },  // Light rain edge
          { offsetLat: -0.07, offsetLon: 0.08, radius: 14000, color: '#3b82f6', opacity: 0.2 },   // Dispersing moisture
        ]
      : [
          { offsetLat: 0.08, offsetLon: 0.1, radius: 12000, color: '#22c55e', opacity: 0.08 },    // Traces of moisture
          { offsetLat: -0.1, offsetLon: -0.08, radius: 18000, color: '#3b82f6', opacity: 0.06 },   // Humid air mass
        ];

    return (
      <>
        {cells.map((cell, idx) => (
          <Circle
            key={idx}
            center={[lat + cell.offsetLat, lon + cell.offsetLon]}
            radius={cell.radius}
            pathOptions={{
              color: cell.color,
              fillColor: cell.color,
              fillOpacity: cell.opacity,
              weight: 1.5,
              className: hasRain ? 'radar-pulse-effect' : '',
            }}
          />
        ))}
      </>
    );
  }

  // ── CLOUDS LAYER (Soft floating cloud polygons) ──
  if (activeLayer === 'clouds') {
    const clouds = currentData.clouds ?? 50;
    const baseOpacity = Math.max(0.08, Math.min(0.4, clouds / 220));

    // Irregular cloud poly formations drifting near the coordinates
    const cloudFormations = [
      [
        [lat + 0.06, lon - 0.15],
        [lat + 0.14, lon - 0.04],
        [lat + 0.11, lon + 0.11],
        [lat + 0.01, lon + 0.07],
        [lat - 0.04, lon - 0.06],
      ],
      [
        [lat - 0.04, lon - 0.18],
        [lat - 0.1, lon - 0.03],
        [lat - 0.07, lon + 0.09],
        [lat - 0.01, lon - 0.08],
      ],
    ];

    return (
      <>
        {cloudFormations.map((coords, idx) => (
          <Polygon
            key={idx}
            positions={coords}
            pathOptions={{
              color: '#94a3b8',
              fillColor: '#cbd5e1',
              fillOpacity: baseOpacity,
              weight: 0,
            }}
          />
        ))}
        {/* Layer background condensation boundary */}
        <Circle
          center={center}
          radius={90000}
          pathOptions={{
            color: '#cbd5e1',
            fillColor: '#f1f5f9',
            fillOpacity: baseOpacity * 0.4,
            weight: 1,
            dashArray: '8, 8',
          }}
        />
      </>
    );
  }

  // ── WIND LAYER (Flowing animated streamline vectors) ──
  if (activeLayer === 'wind') {
    const windSpeed = currentData.wind_speed ?? 5;
    const windDeg = currentData.wind_deg ?? 45;
    const angleRad = (windDeg * Math.PI) / 180;

    // Compute streamline vectors oriented along wind direction angle
    const length = 0.35;
    const latOffset = Math.sin(angleRad) * length;
    const lonOffset = Math.cos(angleRad) * length;

    // Shift coordinates perpendicular to show multiple streamlines flowing in parallel
    const perpLat = -Math.cos(angleRad) * 0.12;
    const perpLon = Math.sin(angleRad) * 0.12;

    const streamlines = [
      // Central streamline
      [[lat - latOffset, lon - lonOffset], [lat + latOffset, lon + lonOffset]],
      // Shifted left streamline
      [[lat - latOffset + perpLat, lon - lonOffset + perpLon], [lat + latOffset + perpLat, lon + lonOffset + perpLon]],
      // Shifted right streamline
      [[lat - latOffset - perpLat, lon - lonOffset - perpLon], [lat + latOffset - perpLat, lon + lonOffset - perpLon]],
    ];

    return (
      <>
        {streamlines.map((coords, idx) => (
          <Polyline
            key={idx}
            positions={coords}
            pathOptions={{
              color: '#0ea5e9',
              weight: Math.max(2, Math.min(4.5, windSpeed / 2.5)),
              opacity: 0.65,
              className: 'animated-wind-line',
            }}
          />
        ))}
        {/* Flow orientation circle */}
        <Circle
          center={center}
          radius={30000}
          pathOptions={{
            color: '#38bdf8',
            fillColor: 'transparent',
            weight: 1,
            dashArray: '4, 8',
          }}
        />
      </>
    );
  }

  return null;
}

export default function WeatherMap() {
  const { t } = useTranslation();
  const { city, current } = useWeatherContext();
  const { effectiveApiKey, isDemoKey } = useSettings();
  const [activeLayer, setActiveLayer] = useState('temp');

  if (!city) return null;

  const center = [city.lat, city.lon];
  const isDark = document.documentElement.classList.contains('dark');

  const baseTileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const selectedLayer = MAP_LAYERS.find((l) => l.id === activeLayer);

  const activeLayerUrl = useMemo(() => {
    if (!selectedLayer) return '';
    return selectedLayer.url.replace(/appid=[^&]*/, `appid=${effectiveApiKey}`);
  }, [selectedLayer, effectiveApiKey]);

  return (
    <div className="glass-card-static p-5 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">
          {t('weather_map')}
        </h2>

        {/* Premium Layer Toggles */}
        <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/30 dark:border-slate-700/20">
          {MAP_LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            
            // Map layer IDs to correct user-friendly translation keys
            const key = layer.id === 'precipitation'
              ? 'precip_layer'
              : layer.id === 'clouds'
              ? 'cloud_layer'
              : `${layer.id}_layer`;

            // Define layer icons
            const iconMap = {
              temp: <WbSunnyIcon style={{ fontSize: 13 }} />,
              precipitation: <WaterDropIcon style={{ fontSize: 13 }} />,
              clouds: <CloudIcon style={{ fontSize: 13 }} />,
              wind: <AirIcon style={{ fontSize: 13 }} />,
            };

            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200
                  ${isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30'
                  }`}
              >
                {iconMap[layer.id]}
                <span className="hidden sm:inline">{t(key)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/20" style={{ height: '350px' }}>
        <MapContainer
          center={center}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url={baseTileUrl} />
          {selectedLayer && activeLayerUrl && !isDemoKey(effectiveApiKey) && (
            <TileLayer url={activeLayerUrl} opacity={0.6} />
          )}
          
          {/* Interactive Simulated Weather Radar Overlay */}
          <SimulatedRadar activeLayer={activeLayer} center={center} currentData={current} />

          <Marker position={center}>
            <Popup>
              <strong>{city.name}</strong>
              {city.country && <span>, {city.country}</span>}
            </Popup>
          </Marker>
          <MapUpdater center={center} />
        </MapContainer>
      </div>
    </div>
  );
}
