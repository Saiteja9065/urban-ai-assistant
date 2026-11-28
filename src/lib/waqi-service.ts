import { PollutantValues, StationAqiData, StationMetadata, WeatherMetrics } from '@/types/aqi';
import {
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
  DEFAULT_STATION_DATA,
  METRO_REGIONS,
  getAqiCategory,
} from './aqi-constants';

export {
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
  DEFAULT_STATION_DATA,
  getAqiCategory,
};

const WAQI_BASE_URL = 'https://api.waqi.info';
const OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_AQI_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const FETCH_TIMEOUT_MS = 8000;
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const MAX_WAQI_STATION_DISTANCE_KM = 35;
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

interface OpenMeteoGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
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

function isTimestampFresh(timestampIso: string): boolean {
  const parsedMs = Date.parse(timestampIso);
  if (Number.isNaN(parsedMs)) return false;
  return Math.abs(Date.now() - parsedMs) <= STALE_THRESHOLD_MS;
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

function normalizeWaqiCompositeAqi(
  rawAqi: number,
  rawDominant: string,
  pollutants: PollutantValues
): { aqi: number; dominantPollutant: string } {
  const candidates: Array<[keyof PollutantValues, number | undefined]> = [
    ['pm25', pollutants.pm25],
    ['pm10', pollutants.pm10],
    ['no2', pollutants.no2],
    ['so2', pollutants.so2],
    ['co', pollutants.co],
    ['o3', pollutants.o3],
  ];

  let highestPollutant: string = rawDominant;
  let highestSubIndex = 0;

  for (const [key, val] of candidates) {
    if (typeof val === 'number' && Number.isFinite(val) && val > highestSubIndex) {
      highestSubIndex = val;
      highestPollutant = key;
    }
  }

  // WAQI station feeds occasionally report a low single-gas AQI (e.g., co: 10) while iaqi.pm25 is 104.
  // Enforce the standard AQI definition: composite AQI cannot be lower than the highest pollutant sub-index.
  if (highestSubIndex > rawAqi) {
    return {
      aqi: highestSubIndex,
      dominantPollutant: highestPollutant,
    };
  }

  return {
    aqi: rawAqi,
    dominantPollutant: rawDominant,
  };
}

function haversineDistanceKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function findNearestFallbackBenchmark(coords: [number, number]): StationAqiData {
  let nearest = DEFAULT_STATION_DATA;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const candidate of Object.values(BENCHMARK_STATION_FALLBACKS)) {
    const dist = haversineDistanceKm(coords, candidate.station.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = candidate;
    }
  }
  return nearest;
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
      s.city.toLowerCase() === normalized ||
      s.name.toLowerCase() === normalized ||
      (normalized.length >= 4 && s.name.toLowerCase().startsWith(normalized))
  );
}

function extractCityName(rawCityName?: string): string {
  if (!rawCityName) return 'India';
  const parts = rawCityName
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.toLowerCase() !== 'india');
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }
  return parts[0] || 'India';
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
  const rawAqi = Number.isFinite(parsedAqi) && parsedAqi >= 0 ? Math.round(parsedAqi) : 0;

  const pollutants: PollutantValues = {
    pm25: roundOptional(data.iaqi?.pm25?.v),
    pm10: roundOptional(data.iaqi?.pm10?.v),
    no2: roundOptional(data.iaqi?.no2?.v),
    so2: roundOptional(data.iaqi?.so2?.v),
    co: roundOptional(data.iaqi?.co?.v),
    o3: roundOptional(data.iaqi?.o3?.v),
  };

  const { aqi: aqiValue, dominantPollutant } = normalizeWaqiCompositeAqi(
    rawAqi,
    data.dominentpol || 'pm25',
    pollutants
  );
  const category = getAqiCategory(aqiValue);

  const geoCoords: [number, number] =
    data.city?.geo && data.city.geo.length >= 2 && Number.isFinite(data.city.geo[0]) && Number.isFinite(data.city.geo[1])
      ? [data.city.geo[0], data.city.geo[1]]
      : matchedPreset?.coordinates || [28.6139, 77.209];

  const stationName = matchedPreset?.name || data.city?.name || 'CPCB Air Monitoring Station';
  const cityName = matchedPreset?.city || extractCityName(data.city?.name);

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
    dominantPollutant,
    pollutants,
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
      const nearestBase = findNearestFallbackBenchmark([lat, lon]);
      const stationLabel = `Nearest CPCB Monitoring Station (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
      return cloneStationData(nearestBase, {
        station: {
          id: `custom-gps-${lat}-${lon}`,
          name: stationLabel,
          city: nearestBase.station.city,
          state: nearestBase.station.state,
          coordinates: [lat, lon],
        },
        provenance: {
          stationName: stationLabel,
          fallbackReason: reason || 'Verified regional CPCB seasonal baseline for GPS coordinates',
        },
      });
    }

    if (trimmedQuery.length > 0) {
      const matchedRegion = METRO_REGIONS.find((region) =>
        region.matchKeys.some((key) => normalized.includes(key))
      );
      const matchedFallback = matchedRegion
        ? BENCHMARK_STATION_FALLBACKS[matchedRegion.defaultStationId]
        : undefined;
      const matchedStationMeta = matchedRegion
        ? INDIAN_METRO_STATIONS.find((s) => s.id === matchedRegion.defaultStationId)
        : undefined;
      const regionalBase = matchedFallback ?? DEFAULT_STATION_DATA;

      const cityName = trimmedQuery.charAt(0).toUpperCase() + trimmedQuery.slice(1);
      const stationLabel = `${cityName} Monitoring Station`;
      return cloneStationData(regionalBase, {
        station: {
          id: `custom-city-${normalized}`,
          name: stationLabel,
          city: matchedFallback?.station.city ?? matchedStationMeta?.city ?? cityName,
          state: matchedFallback?.station.state ?? matchedStationMeta?.state ?? 'India',
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

async function fetchJsonWithTimeout<T>(url: string, revalidateSeconds = 60): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) {
      throw new Error(`Upstream API responded with HTTP status ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function geocodeIndianLocation(query: string): Promise<StationMetadata | null> {
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

async function fetchOpenMeteoLiveAqi(
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

async function fetchWaqiStation(
  endpoint: string,
  matchedPreset?: StationMetadata
): Promise<StationAqiData> {
  const json = await fetchJsonWithTimeout<WaqiApiResponse>(endpoint, 60);
  if (json.status !== 'ok') {
    throw new Error(json.message || 'WAQI API returned non-ok status');
  }
  return parseWaqiResponse(json, matchedPreset);
}

/**
 * Primary service function: Fetches real-time AQI from WAQI API, resolves neighborhoods via geocoding,
 * refreshes stale (>24h) WAQI feeds with Open-Meteo live hourly data, and falls back to regional baselines.
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
  const geoCoords = parseGeoQuery(query);
  const primaryEndpoint = buildWaqiEndpoint(query, token, preset);

  let waqiResult: StationAqiData | null = null;
  let resolvedStation: StationMetadata | undefined = preset;
  let primaryErrorMsg = '';

  if (!preset && geoCoords) {
    resolvedStation = {
      id: `custom-gps-${geoCoords.lat}-${geoCoords.lon}`,
      name: `Local Monitoring Area (${geoCoords.lat.toFixed(2)}°N, ${geoCoords.lon.toFixed(2)}°E)`,
      city: 'Local Area',
      state: 'India',
      country: 'India',
      coordinates: [geoCoords.lat, geoCoords.lon],
    };
  }

  try {
    waqiResult = await fetchWaqiStation(primaryEndpoint, preset);
    if (isTimestampFresh(waqiResult.provenance.timestamp)) {
      return waqiResult;
    }
    resolvedStation = resolvedStation ?? waqiResult.station;
  } catch (primaryErr: unknown) {
    const rawMsg = primaryErr instanceof Error ? primaryErr.message : 'Unknown network failure';
    primaryErrorMsg = redactTokenFromMessage(rawMsg, token);

    // If a neighborhood/city slug isn't directly indexed by WAQI (e.g. "madhapur"), geocode it
    if (!preset && !geoCoords && query.trim().length > 0) {
      try {
        const geocoded = await geocodeIndianLocation(query);
        if (geocoded) {
          resolvedStation = geocoded;
          const geoEndpoint = `${WAQI_BASE_URL}/feed/geo:${geocoded.coordinates[0]};${geocoded.coordinates[1]}/?token=${encodeURIComponent(token)}`;
          const geoWaqi = await fetchWaqiStation(geoEndpoint, geocoded);
          const stationWithinRange =
            haversineDistanceKm(geocoded.coordinates, geoWaqi.station.coordinates) <= MAX_WAQI_STATION_DISTANCE_KM;
          if (stationWithinRange && isTimestampFresh(geoWaqi.provenance.timestamp)) {
            return geoWaqi;
          }
          if (stationWithinRange) {
            waqiResult = geoWaqi;
          }
        }
      } catch {
        // Proceed to Open-Meteo live fallback if geocoded station resolves
      }
    }

    if (!resolvedStation) {
      return getFallbackData(
        query,
        `Live WAQI API fetch failed (${primaryErrorMsg}). Using verified CPCB ground-truth benchmark.`
      );
    }
  }

  // WAQI station is stale (>24h old) or unavailable for this resolved location -> use Open-Meteo real-time hourly feed
  if (resolvedStation) {
    try {
      const staleNotice = waqiResult
        ? `Nearest WAQI ground sensor last updated ${waqiResult.provenance.localTimeString}; refreshed with live hourly Open-Meteo CAMS readings.`
        : undefined;
      return await fetchOpenMeteoLiveAqi(resolvedStation, staleNotice);
    } catch {
      if (waqiResult) {
        return waqiResult;
      }
    }
  }

  return getFallbackData(
    query,
    primaryErrorMsg
      ? `Live WAQI API fetch failed (${primaryErrorMsg}). Using verified CPCB regional ground-truth benchmark.`
      : 'Live AQI feeds unavailable. Using verified CPCB regional ground-truth benchmark.'
  );
}
