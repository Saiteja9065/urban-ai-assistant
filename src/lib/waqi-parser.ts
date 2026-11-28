import { PollutantValues, StationAqiData, StationMetadata } from '@/types/aqi';
import { getAqiCategory } from './aqi-constants';
import { roundOptional } from './geo-utils';

export interface WaqiApiResponse {
  status: 'ok' | 'error';
  data?: {
    aqi: number | string;
    idx: number;
    attributions?: Array<{ url?: string; name: string }>;
    city?: { geo?: [number, number]; name?: string; url?: string };
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
    time?: { s?: string; tz?: string; v?: number; iso?: string };
  };
  message?: string;
}

/** Resolves the best available ISO-8601 timestamp from WAQI time fields. */
function resolveTimestampIso(time?: { s?: string; iso?: string }): string {
  for (const candidate of [time?.iso, time?.s]) {
    if (candidate && !Number.isNaN(Date.parse(candidate))) {
      return candidate === time?.iso ? candidate : new Date(candidate).toISOString();
    }
  }
  return new Date().toISOString();
}

/**
 * Promotes the WAQI composite AQI to the highest sub-index when
 * individual pollutant readings exceed the reported composite value.
 */
function normalizeWaqiCompositeAqi(
  rawAqi: number,
  rawDominant: string,
  pollutants: PollutantValues
): { aqi: number; dominantPollutant: string } {
  const entries = Object.entries(pollutants) as Array<[keyof PollutantValues, number | undefined]>;
  let highestPollutant = rawDominant;
  let highestSubIndex = 0;

  for (const [key, val] of entries) {
    if (typeof val === 'number' && Number.isFinite(val) && val > highestSubIndex) {
      highestSubIndex = val;
      highestPollutant = key;
    }
  }

  return highestSubIndex > rawAqi
    ? { aqi: highestSubIndex, dominantPollutant: highestPollutant }
    : { aqi: rawAqi, dominantPollutant: rawDominant };
}

/** Extracts a clean city name from WAQI's comma-separated city string. */
function extractCityName(rawCityName?: string): string {
  if (!rawCityName) return 'India';
  const parts = rawCityName
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.toLowerCase() !== 'india');
  return parts.length >= 2 ? parts[parts.length - 1] : parts[0] || 'India';
}

/**
 * Transforms a raw WAQI API payload into strictly typed StationAqiData.
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

  const geoCoords: [number, number] =
    data.city?.geo &&
    data.city.geo.length >= 2 &&
    Number.isFinite(data.city.geo[0]) &&
    Number.isFinite(data.city.geo[1])
      ? [data.city.geo[0], data.city.geo[1]]
      : matchedPreset?.coordinates || [28.6139, 77.209];

  const stationName = matchedPreset?.name || data.city?.name || 'CPCB Air Monitoring Station';
  const timestampIso = resolveTimestampIso(data.time);

  return {
    station: {
      id: matchedPreset?.id || `station-${data.idx}`,
      name: stationName,
      city: matchedPreset?.city || extractCityName(data.city?.name),
      state: matchedPreset?.state || 'India',
      country: 'India',
      coordinates: geoCoords,
      cpcbCode: matchedPreset?.cpcbCode,
      isPopularPreset: matchedPreset?.isPopularPreset || false,
    },
    aqi: aqiValue,
    category: getAqiCategory(aqiValue),
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
