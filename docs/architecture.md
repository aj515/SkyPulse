# 🏗️ SkyPulse — Architecture Flow Diagram

This document describes the architectural flow, component relationships, data synchronization, and API integration paths of the **SkyPulse Weather Dashboard** web application.

---

## 🗺️ Client-Server-API Architecture Flow

```mermaid
graph TD
    %% Define User Interface Group
    subgraph Client ["Client Interface (SPA React)"]
        UI["React Layout Components"]
        Search["SearchBar (Direct Geocode)"]
        Favs["FavoritesList (localStore)"]
        Comp["WeatherCompare Component"]
        MapComp["WeatherMap Component (OSM/Leaflet)"]
        ChartComp["HourlyForecast (ChartJS & Tooltip Click Sync)"]
    end

    %% Define State Manager Group
    subgraph ClientState ["State & Context Management"]
        SettingsCtx["SettingsContext (Language/Units/History)"]
        WeatherCtx["WeatherContext (Active Data & Fallback Trigger)"]
        LS["Browser localStorage (Recent/Favs)"]
    end

    %% Define External Services Group
    subgraph OWM ["External API Server (OpenWeatherMap)"]
        GeoAPI["Geocoding API (/geo/1.0)"]
        WeatherAPI["OneCall API v2.5 (/data/2.5)"]
        MapAPI["Map Tiles API (/map/...)"]
    end

    subgraph StaticServers ["Production Hosting Services"]
        VercelCDN["Vercel Global Edge CDN"]
    end

    %% Interaction Paths
    UI --> Search
    UI --> MapComp
    UI --> ChartComp
    UI --> Comp
    
    Search -->|1. Type City Name| SettingsCtx
    SettingsCtx -->|Read/Write History| LS
    Favs -->|Store/Retrieve Saved| LS
    
    SettingsCtx -->|Triggers Lat/Lon Lookup| GeoAPI
    GeoAPI -->|Returns Lat/Lon| WeatherCtx
    
    WeatherCtx -->|2. Fetch Forecast Details| WeatherAPI
    WeatherAPI -->|Returns Current/Hourly/Daily JSON| WeatherCtx
    
    WeatherCtx -->|3. Feed Data Curves| ChartComp
    WeatherCtx -->|4. Populates Compare Cards| Comp
    
    MapComp -->|"5. Request Layers (temp, rain, wind)"| MapAPI
    
    %% Fallback Actions
    WeatherCtx -->|6. API Limit Error Fallback| DemoMock["Offline Demo Generator"]
    DemoMock -.->|Feeds Seamless Mock Data| UI
    
    %% Static Deployment
    VercelCDN -.->|Serves Static Assets via HTTPS| UI
```

---

## 📊 Flow Sequence Description

1. **User Action (Search City):** The user types in the `SearchBar`. A debounced coordinates check queries the OpenWeatherMap **Geocoding API**.
2. **Coordinate Resolution & Fetch:** 
   - If the geocode succeeds, the active city is set in `SettingsContext`.
   - `WeatherContext` receives the `lat` / `lon` and triggers a fetch query to OpenWeatherMap's comprehensive **One Call API** (to get 24-hour hourly, 7-day daily, and warning alerts).
   - If the geocode or weather API fails (or key is unauthorized), the **Offline Demo Generator** intercepts immediately to populate mock parameters, ensuring no break in usability.
3. **Local Storage Synchronization:** Search history and user favorited cities are serialized and written directly to the client browser's `localStorage` for complete state conservation between active sessions.
4. **Interactive Overlays:**
   - **Line Chart (ChartJS):** The hourly forecast maps temperature and rain coordinates. Card click inputs programmatically set active chart nodes to highlight targets and launch tooltips.
   - **Map Tiles Component (Leaflet + OpenStreetMap):** Leaflet loads OSM map vectors, and overlays tiles requested from the OpenWeatherMap **Map Layers API** (precipitation, cloud cover, winds, temperatures).
5. **Static Server Deployment:** The production frontend SPA is optimized, bundled, and served to clients instantly via **Vercel's global edge network** with pre-configured rewrite redirect pathways.
