import { StationAqiData, StationMetadata, WeatherMetrics } from '@/types/aqi';
import { getAqiCategory } from './aqi-categories';
import { fetchJsonWithTimeout, roundOptional } from './geo-utils';

const OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

interface OpenMeteoAirQualityResponse {
  current?: {
    time?: string;
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
  };
}

interface OpenMeteoWeatherResponse {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    surface_pressure?: number;
  };
}

/**
 * Resolves an Indian neighborhood or city name to coordinates via Open-Meteo Geocoding.
 */
export async function geocodeIndianLocation(query: string): Promise<StationMetadata | null> {
  const url = `${OPEN_METEO_GEO_URL}?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
  const geo = await fetchJsonWithTimeout<{ results?: OpenMeteoGeoResult[] }>(url, 3600);
  const results = geo.results || [];
  if (results.length === 0) return null;

  const preferred = results.find((r) => r.country_code === 'IN') ?? results[0];
  const stateLabel = preferred.admin1 || 'India';

  return {
    id: `custom-city-${query.toLowerCase().trim()}`,
    name: `${preferred.name}, ${stateLabel}`,
    city: preferred.name,
    state: stateLabel,
    country: preferred.country || 'India',
    coordinates: [preferred.latitude, preferred.longitude],
    isPopularPreset: false,
  };
}

/**
 * Fetches live hourly CAMS air quality and weather metrics from Open-Meteo for exact coordinates.
 */
export async function fetchOpenMeteoLiveAqi(
  station: StationMetadata,
  staleNotice?: string
): Promise<StationAqiData> {
  const [lat, lon] = station.coordinates;
  const aqiUrl = `${OPEN_METEO_AQI_URL}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=Asia%2FKolkata`;
  const weatherUrl = `${OPEN_METEO_WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=Asia%2FKolkata`;

  const [aqPayload, weatherPayload] = await Promise.all([
    fetchJsonWithTimeout<OpenMeteoAirQualityResponse>(aqiUrl, 60),
    fetchJsonWithTimeout<OpenMeteoWeatherResponse>(weatherUrl, 300).catch(() => null),
  ]);

  const current = aqPayload.current;
  if (!current || typeof current.us_aqi !== 'number' || !Number.isFinite(current.us_aqi)) {
    throw new Error('Open-Meteo Air Quality payload missing current us_aqi');
  }

  const aqiValue = Math.max(0, Math.round(current.us_aqi));
  const pm25 = roundOptional(current.pm2_5);
  const pm10 = roundOptional(current.pm10);
  const dominantPollutant = (pm25 ?? 0) >= (pm10 ?? 0) ? 'pm25' : 'pm10';
  const rawTime = current.time ? `${current.time}:00+05:30` : new Date().toISOString();
  const timestampIso = Number.isNaN(Date.parse(rawTime)) ? new Date().toISOString() : rawTime;

  const weatherCurrent = weatherPayload?.current;
  const weather: WeatherMetrics | undefined = weatherCurrent
    ? {
        temperature: roundOptional(weatherCurrent.temperature_2m, 1),
        humidity: roundOptional(weatherCurrent.relative_humidity_2m),
        windSpeed: roundOptional(weatherCurrent.wind_speed_10m, 1),
        pressure: roundOptional(weatherCurrent.surface_pressure),
      }
    : undefined;

  return {
    station,
    aqi: aqiValue,
    category: getAqiCategory(aqiValue),
    dominantPollutant,
    pollutants: {
      pm25,
      pm10,
      no2: roundOptional(current.nitrogen_dioxide),
      so2: roundOptional(current.sulphur_dioxide),
      co: roundOptional(current.carbon_monoxide),
      o3: roundOptional(current.ozone),
    },
    weather,
    provenance: {
      source: 'Open-Meteo CAMS Real-Time Air Quality Feed',
      stationName: station.name,
      stationUrl: 'https://open-meteo.com/en/docs/air-quality-api',
      timestamp: timestampIso,
      localTimeString: new Date(timestampIso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      attributions: [
        { name: 'Open-Meteo / Copernicus CAMS Air Quality', url: 'https://open-meteo.com' },
        { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
      ],
      isLive: true,
      fallbackReason: staleNotice,
    },
  };
}
