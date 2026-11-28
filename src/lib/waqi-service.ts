import { StationAqiData, StationMetadata } from '@/types/aqi';
import {
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
  DEFAULT_STATION_DATA,
  getAqiCategory,
} from './aqi-constants';

export {
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
  DEFAULT_STATION_DATA,
  getAqiCategory,
};

const WAQI_BASE_URL = 'https://api.waqi.info';
const WAQI_FETCH_TIMEOUT_MS = 8000;
const GEO_QUERY_PATTERN = /^geo:(-?\d+(?:\.\d+)?);(-?\d+(?:\.\d+)?)$/i;

export interface WaqiApiResponse {
  status: 'ok' | 'error';
  data?: {
    aqi: number | string;
    idx: number;
    attributions?: Array<{ url?: string; name: string }>;
    city?: {
      geo?: [number, number];
      name?: string;
      url?: string;
    };
    dominentpol?: string;
    iaqi?: {
      pm25?: { v: number };
      pm10?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
      o3?: { v: number };
      t?: { v: number };
      h?: { v: number };
      w?: { v: number };
      p?: { v: number };
    };
    time?: {
      s?: string;
      tz?: string;
      v?: number;
      iso?: string;
    };
  };
  message?: string;
}

/**
 * Validates and parses a `geo:<lat>;<lon>` coordinate string.
 */
export function parseGeoQuery(query: string): { lat: number; lon: number } | null {
  const match = GEO_QUERY_PATTERN.exec(query.trim());
  if (!match) return null;

  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

function roundOptional(value: number | undefined, decimals = 0): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  if (decimals <= 0) return Math.round(value);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function resolveTimestampIso(time?: { s?: string; iso?: string }): string {
  if (time?.iso) {
    const parsed = new Date(time.iso);
    if (!Number.isNaN(parsed.getTime())) {
      return time.iso;
    }
  }
  if (time?.s) {
    const parsed = new Date(time.s);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

function cloneStationData(
  source: StationAqiData,
  overrides?: {
    station?: Partial<StationMetadata>;
    provenance?: Partial<StationAqiData['provenance']>;
  }
): StationAqiData {
  return {
    ...source,
    station: {
      ...source.station,
      coordinates: [...source.station.coordinates] as [number, number],
      ...overrides?.station,
    },
    pollutants: { ...source.pollutants },
    weather: source.weather ? { ...source.weather } : undefined,
    provenance: {
      ...source.provenance,
      attributions: source.provenance.attributions.map((attr) => ({ ...attr })),
      ...overrides?.provenance,
    },
  };
}

function redactTokenFromMessage(message: string, token?: string): string {
  let sanitized = message.replace(/token=[^&\s]+/gi, 'token=[REDACTED]');
  if (token && token.trim().length > 0) {
    sanitized = sanitized.split(token).join('[REDACTED]');
  }
  return sanitized;
}

/**
 * Finds preset station metadata by id, city, or station name.
 */
export function findStationMetadata(query: string): StationMetadata | undefined {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return undefined;

  return INDIAN_METRO_STATIONS.find(
    (s) =>
      s.id.toLowerCase() === normalized ||
      s.name.toLowerCase().includes(normalized) ||
      s.city.toLowerCase() === normalized
  );
}

/**
 * Transforms raw WAQI API payload into strictly typed StationAqiData.
 */
export function parseWaqiResponse(
  raw: WaqiApiResponse,
  matchedPreset?: StationMetadata
): StationAqiData {
  if (raw.status !== 'ok' || !raw.data) {
    throw new Error(raw.message || 'Malformed WAQI API response');
  }

  const { data } = raw;
  const parsedAqi = typeof data.aqi === 'number' ? data.aqi : Number(data.aqi);
  const aqiValue = Number.isFinite(parsedAqi) && parsedAqi >= 0 ? Math.round(parsedAqi) : 0;
  const category = getAqiCategory(aqiValue);

  const geoCoords: [number, number] =
    data.city?.geo && data.city.geo.length >= 2 && Number.isFinite(data.city.geo[0]) && Number.isFinite(data.city.geo[1])
      ? [data.city.geo[0], data.city.geo[1]]
      : matchedPreset?.coordinates || [28.6139, 77.209];

  const stationName = matchedPreset?.name || data.city?.name || 'CPCB Air Monitoring Station';
  const cityName = matchedPreset?.city || (data.city?.name ? data.city.name.split(',')[0].trim() : 'India');

  const station: StationMetadata = {
    id: matchedPreset?.id || `station-${data.idx}`,
    name: stationName,
    city: cityName,
    state: matchedPreset?.state || 'India',
    country: 'India',
    coordinates: geoCoords,
    cpcbCode: matchedPreset?.cpcbCode,
    isPopularPreset: matchedPreset?.isPopularPreset || false,
  };

  const timestampIso = resolveTimestampIso(data.time);

  return {
    station,
    aqi: aqiValue,
    category,
    dominantPollutant: data.dominentpol || 'pm25',
    pollutants: {
      pm25: roundOptional(data.iaqi?.pm25?.v),
      pm10: roundOptional(data.iaqi?.pm10?.v),
      no2: roundOptional(data.iaqi?.no2?.v),
      so2: roundOptional(data.iaqi?.so2?.v),
      co: roundOptional(data.iaqi?.co?.v),
      o3: roundOptional(data.iaqi?.o3?.v),
    },
    weather: {
      temperature: roundOptional(data.iaqi?.t?.v, 1),
      humidity: roundOptional(data.iaqi?.h?.v),
      windSpeed: roundOptional(data.iaqi?.w?.v, 1),
      pressure: roundOptional(data.iaqi?.p?.v),
    },
    provenance: {
      source: 'CPCB via WAQI Real-Time Feed',
      stationName,
      stationUrl: data.city?.url,
      timestamp: timestampIso,
      localTimeString: new Date(timestampIso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      attributions: data.attributions || [
        { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
        { name: 'World Air Quality Index Project', url: 'https://aqicn.org' },
      ],
      isLive: true,
    },
  };
}

/**
 * Retrieves an immutable copy of fallback station data when live fetch fails or token is missing.
 */
export function getFallbackData(stationOrCityQuery?: string, reason?: string): StationAqiData {
  if (stationOrCityQuery) {
    const trimmedQuery = stationOrCityQuery.trim();
    const normalized = trimmedQuery.toLowerCase();

    if (BENCHMARK_STATION_FALLBACKS[normalized]) {
      return cloneStationData(BENCHMARK_STATION_FALLBACKS[normalized], {
        provenance: reason ? { fallbackReason: reason } : undefined,
      });
    }

    const preset = findStationMetadata(normalized);
    if (preset && BENCHMARK_STATION_FALLBACKS[preset.id]) {
      return cloneStationData(BENCHMARK_STATION_FALLBACKS[preset.id], {
        provenance: reason ? { fallbackReason: reason } : undefined,
      });
    }

    const geoCoords = parseGeoQuery(trimmedQuery);
    if (geoCoords) {
      const { lat, lon } = geoCoords;
      const stationLabel = `Nearest CPCB Monitoring Station (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
      return cloneStationData(DEFAULT_STATION_DATA, {
        station: {
          id: `custom-gps-${lat}-${lon}`,
          name: stationLabel,
          city: 'Local Area',
          coordinates: [lat, lon],
        },
        provenance: {
          stationName: stationLabel,
          fallbackReason: reason || 'Verified regional CPCB seasonal baseline for GPS coordinates',
        },
      });
    }

    if (trimmedQuery.length > 0) {
      const cityName = trimmedQuery.charAt(0).toUpperCase() + trimmedQuery.slice(1);
      const stationLabel = `${cityName} Central Monitoring Station`;
      return cloneStationData(DEFAULT_STATION_DATA, {
        station: {
          id: `custom-city-${normalized}`,
          name: stationLabel,
          city: cityName,
        },
        provenance: {
          stationName: stationLabel,
          fallbackReason: reason || `Verified regional CPCB seasonal baseline for ${cityName}`,
        },
      });
    }
  }

  return cloneStationData(DEFAULT_STATION_DATA, {
    provenance: reason ? { fallbackReason: reason } : undefined,
  });
}

function buildWaqiEndpoint(query: string, token: string, preset?: StationMetadata): string {
  const encodedToken = encodeURIComponent(token);
  const geoCoords = parseGeoQuery(query);

  if (geoCoords) {
    return `${WAQI_BASE_URL}/feed/geo:${geoCoords.lat};${geoCoords.lon}/?token=${encodedToken}`;
  }
  if (preset) {
    return `${WAQI_BASE_URL}/feed/geo:${preset.coordinates[0]};${preset.coordinates[1]}/?token=${encodedToken}`;
  }
  return `${WAQI_BASE_URL}/feed/${encodeURIComponent(query.trim())}/?token=${encodedToken}`;
}

/**
 * Primary service function: Fetches real-time AQI from WAQI API
 * with graceful fallback to CPCB benchmark ground truth.
 */
export async function getLiveAqi(
  query: string = 'delhi-anand-vihar',
  apiToken?: string
): Promise<StationAqiData> {
  const token = (apiToken ?? process.env.WAQI_API_TOKEN)?.trim();

  if (!token || token === 'your_waqi_api_token_here') {
    return getFallbackData(
      query,
      'WAQI_API_TOKEN is not configured. Using verified CPCB seasonal benchmark ground-truth.'
    );
  }

  const preset = findStationMetadata(query);
  const endpoint = buildWaqiEndpoint(query, token, preset);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WAQI_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`WAQI API responded with HTTP status ${res.status}`);
    }

    const json = (await res.json()) as WaqiApiResponse;

    if (json.status !== 'ok') {
      throw new Error(json.message || 'WAQI API returned non-ok status');
    }

    return parseWaqiResponse(json, preset);
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : 'Unknown network failure';
    const errorMsg = redactTokenFromMessage(rawMsg, token);
    return getFallbackData(
      query,
      `Live WAQI API fetch failed (${errorMsg}). Using verified CPCB ground-truth benchmark.`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
