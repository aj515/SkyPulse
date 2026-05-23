# 🌐 SkyPulse — API Documentation Reference

This document provides a comprehensive API reference for the external endpoints utilized by **SkyPulse** to deliver real-time meteorological data, geocoding coordinates, and weather map tile layers.

---

## 🔑 Authentication

All endpoints require authentication using a valid API key issued by **OpenWeatherMap**.

* **Parameter Name:** `appid`
* **Type:** Query Parameter
* **Example:** `?appid=YOUR_API_KEY`

---

## 📡 Endpoints Reference

### 1. Direct Geocoding API
Translates user-entered city names into geographical coordinates (Latitude & Longitude).

* **HTTP Method:** `GET`
* **URL:** `https://api.openweathermap.org/geo/1.0/direct`
* **Query Parameters:**
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `q` | `string` | Yes | City name, state code (optional), and country code (optional) (e.g., `Manila,PH`). |
  | `limit` | `integer` | No | Max number of matching locations in search results (default: `5`). |
  | `appid` | `string` | Yes | Your OpenWeatherMap API key. |

* **Sample Request:**
  ```http
  GET https://api.openweathermap.org/geo/1.0/direct?q=Manila&limit=5&appid=672fa5ded1db478f8d846781cf0f7073
  ```

* **Sample Response (JSON):**
  ```json
  [
    {
      "name": "Manila",
      "lat": 14.5995,
      "lon": 120.9842,
      "country": "PH",
      "state": "Metro Manila"
    }
  ]
  ```

---

### 2. Reverse Geocoding API
Translates physical coordinates (latitude/longitude) back into readable city and country names (used for "Use Current Location" GPS tracking).

* **HTTP Method:** `GET`
* **URL:** `https://api.openweathermap.org/geo/1.0/reverse`
* **Query Parameters:**
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `lat` | `number` | Yes | Latitude coordinate. |
  | `lon` | `number` | Yes | Longitude coordinate. |
  | `limit` | `integer` | No | Max number of search results (default: `1`). |
  | `appid` | `string` | Yes | Your OpenWeatherMap API key. |

* **Sample Request:**
  ```http
  GET https://api.openweathermap.org/geo/1.0/reverse?lat=14.5995&lon=120.9842&limit=1&appid=672fa5ded1db478f8d846781cf0f7073
  ```

* **Sample Response (JSON):**
  ```json
  [
    {
      "name": "Manila",
      "country": "PH",
      "state": "Metro Manila"
    }
  ]
  ```

---

### 3. One Call / Comprehensive Weather API
Retrieves full concurrent forecasts (current conditions, hourly predictions, daily schedules, and national severe alerts) for a specific latitude and longitude.

* **HTTP Method:** `GET`
* **URL:** `https://api.openweathermap.org/data/2.5/onecall` *(or `/data/3.0/onecall`)*
* **Query Parameters:**
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `lat` | `number` | Yes | Latitude of requested location. |
  | `lon` | `number` | Yes | Longitude of requested location. |
  | `exclude` | `string` | No | Comma-separated blocks to skip (e.g. `minutely`). |
  | `units` | `string` | No | Measurement systems: `metric` (Celsius) or `imperial` (Fahrenheit). |
  | `lang` | `string` | No | Translation tag (e.g. `en`, `es`, `fr`). |
  | `appid` | `string` | Yes | Your OpenWeatherMap API key. |

* **Sample Request:**
  ```http
  GET https://api.openweathermap.org/data/2.5/onecall?lat=14.5995&lon=120.9842&units=metric&exclude=minutely&appid=672fa5ded1db478f8d846781cf0f7073
  ```

* **Sample Response (JSON):**
  ```json
  {
    "lat": 14.5995,
    "lon": 120.9842,
    "timezone": "Asia/Manila",
    "timezone_offset": 28800,
    "current": {
      "dt": 1716508800,
      "temp": 29.5,
      "feels_like": 34.2,
      "pressure": 1010,
      "humidity": 80,
      "uvi": 0.0,
      "visibility": 10000,
      "wind_speed": 0.5,
      "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" }]
    },
    "hourly": [
      {
        "dt": 1716512400,
        "temp": 29.0,
        "pop": 0.62,
        "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" }]
      }
    ],
    "daily": [
      {
        "dt": 1716523200,
        "temp": { "min": 25.4, "max": 31.2 },
        "pop": 0.84,
        "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" }]
      }
    ]
  }
  ```

---

### 4. Interactive Weather Map Layers API
Generates map tiles overlaying real-time weather metrics on standard Leaflet OpenStreetMap components.

* **HTTP Method:** `GET`
* **URL:** `https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png`
* **Path Parameters:**
  | Parameter | Type | Allowed Values | Description |
  | :--- | :--- | :--- | :--- |
  | `layer` | `string` | `temp_new`, `precipitation_new`, `clouds_new`, `wind_new` | The meteorological metric layer. |
  | `z` | `integer` | `0` to `18` | Map zoom factor. |
  | `x` | `integer` | Dynamic | Horizontal grid coordinate of requested tile. |
  | `y` | `integer` | Dynamic | Vertical grid coordinate of requested tile. |

* **Query Parameters:**
  * `appid` (Required): Your API key.

* **Sample Tile Request:**
  ```http
  GET https://tile.openweathermap.org/map/temp_new/5/28/14.png?appid=672fa5ded1db478f8d846781cf0f7073
  ```
