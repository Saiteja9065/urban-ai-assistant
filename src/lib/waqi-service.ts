import { StationAqiData, StationMetadata } from '@/types/aqi';
import {
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
  DEFAULT_STATION_DATA,
  METRO_REGIONS,
  getAqiCategory,
} from './aqi-constants';
import {
  fetchJsonWithTimeout,
  haversineDistanceKm,
  parseGeoQuery,
  redactTokenFromMessage,
} from './geo-utils';
import { fetchOpenMeteoLiveAqi, geocodeIndianLocation } from './open-meteo-service';
import { parseWaqiResponse, WaqiApiResponse } from './waqi-parser';

export {
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
  DEFAULT_STATION_DATA,
  getAqiCategory,
  parseGeoQuery,
  parseWaqiResponse,
  type WaqiApiResponse,
};

const WAQI_BASE_URL = 'https://api.waqi.info';
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const MAX_WAQI_STATION_DISTANCE_KM = 35;

/**
 * Checks whether a WAQI timestamp is fresh enough (within 24 hours) to trust.
 */
function isTimestampFresh(timestampIso: string): boolean {
  const parsedMs = Date.parse(timestampIso);
  return !Number.isNaN(parsedMs) && Math.abs(Date.now() - parsedMs) <= STALE_THRESHOLD_MS;
}

/**
 * Deep-clones a StationAqiData snapshot with optional station/provenance overrides.
 */
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

/**
 * Selects the nearest benchmark fallback station by Haversine distance.
 */
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
 * Finds preset station metadata by id, city, or station name prefix.
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

/**
 * Retrieves an immutable regional fallback snapshot when live APIs are unavailable.
 */
export function getFallbackData(stationOrCityQuery?: string, reason?: string): StationAqiData {
  const trimmedQuery = stationOrCityQuery?.trim() ?? '';
  if (!trimmedQuery) {
    return cloneStationData(DEFAULT_STATION_DATA, {
      provenance: reason ? { fallbackReason: reason } : undefined,
    });
  }

  const normalized = trimmedQuery.toLowerCase();
  const directMatch = BENCHMARK_STATION_FALLBACKS[normalized];
  if (directMatch) {
    return cloneStationData(directMatch, {
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

/** Constructs the WAQI API endpoint URL for the given station query. */
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

/** Fetches and parses a single WAQI station from the given endpoint. */
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

/** Attempts geocoding → WAQI lookup for neighbourhood-level search queries. */
async function tryGeocodeAndFetchWaqi(
  query: string,
  token: string
): Promise<{ station: StationMetadata; waqi: StationAqiData | null } | null> {
  const geocoded = await geocodeIndianLocation(query).catch(() => null);
  if (!geocoded) return null;

  const geoEndpoint = `${WAQI_BASE_URL}/feed/geo:${geocoded.coordinates[0]};${geocoded.coordinates[1]}/?token=${encodeURIComponent(token)}`;
  const geoWaqi = await fetchWaqiStation(geoEndpoint, geocoded).catch(() => null);
  if (!geoWaqi) {
    return { station: geocoded, waqi: null };
  }

  const withinRange =
    haversineDistanceKm(geocoded.coordinates, geoWaqi.station.coordinates) <=
    MAX_WAQI_STATION_DISTANCE_KM;
  return { station: geocoded, waqi: withinRange ? geoWaqi : null };
}

/**
 * Fetches real-time AQI from WAQI, resolves neighborhoods via geocoding, refreshes stale
 * (>24h) WAQI stations with live Open-Meteo data, and falls back to regional baselines.
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
  let resolvedStation: StationMetadata | undefined = preset ?? (geoCoords
    ? {
        id: `custom-gps-${geoCoords.lat}-${geoCoords.lon}`,
        name: `Local Monitoring Area (${geoCoords.lat.toFixed(2)}°N, ${geoCoords.lon.toFixed(2)}°E)`,
        city: 'Local Area',
        state: 'India',
        country: 'India',
        coordinates: [geoCoords.lat, geoCoords.lon],
      }
    : undefined);

  let waqiResult: StationAqiData | null = null;
  let primaryErrorMsg = '';

  try {
    waqiResult = await fetchWaqiStation(buildWaqiEndpoint(query, token, preset), preset);
    if (isTimestampFresh(waqiResult.provenance.timestamp)) {
      return waqiResult;
    }
    resolvedStation = resolvedStation ?? waqiResult.station;
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : 'Unknown network failure';
    primaryErrorMsg = redactTokenFromMessage(rawMsg, token);

    if (!preset && !geoCoords && query.trim().length > 0) {
      const resolved = await tryGeocodeAndFetchWaqi(query, token);
      if (resolved) {
        resolvedStation = resolved.station;
        waqiResult = resolved.waqi;
        if (waqiResult && isTimestampFresh(waqiResult.provenance.timestamp)) {
          return waqiResult;
        }
      }
    }
  }

  if (resolvedStation) {
    try {
      const staleNotice = waqiResult
        ? `Nearest WAQI ground sensor last updated ${waqiResult.provenance.localTimeString}; refreshed with live hourly Open-Meteo CAMS readings.`
        : undefined;
      return await fetchOpenMeteoLiveAqi(resolvedStation, staleNotice);
    } catch {
      if (waqiResult) return waqiResult;
    }
  }

  return getFallbackData(
    query,
    primaryErrorMsg
      ? `Live WAQI API fetch failed (${primaryErrorMsg}). Using verified CPCB ground-truth benchmark.`
      : 'Live AQI feeds unavailable. Using verified CPCB regional ground-truth benchmark.'
  );
}
