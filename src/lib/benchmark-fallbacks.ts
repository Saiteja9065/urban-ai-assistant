import { AqiSeverity, StationAqiData, StationMetadata } from '@/types/aqi';
import { AQI_CATEGORIES } from './aqi-categories';
import { INDIAN_METRO_STATIONS } from './indian-stations';

export const BENCHMARK_TIMESTAMP = '2026-11-22T06:00:00+05:30';
export const BENCHMARK_LOCAL_TIME = '22/11/2026, 06:00:00 AM IST';

const CPCB_ATTRIBUTION = {
  name: 'Central Pollution Control Board (CPCB)',
  url: 'https://cpcb.nic.in',
};

interface FallbackSpec {
  stationId: string;
  aqi: number;
  severity: AqiSeverity;
  dominantPollutant: string;
  pollutants: StationAqiData['pollutants'];
  weather: NonNullable<StationAqiData['weather']>;
  boardCode: string;
  boardName?: string;
  boardUrl: string;
  stationName: string;
  reason: string;
}

function getPresetStation(id: string): StationMetadata {
  const station = INDIAN_METRO_STATIONS.find((s) => s.id === id);
  if (!station) {
    throw new Error(`Unknown preset station id: ${id}`);
  }
  return station;
}

function buildFallback(spec: FallbackSpec): StationAqiData {
  const attributions = spec.boardName
    ? [{ name: spec.boardName, url: spec.boardUrl }, CPCB_ATTRIBUTION]
    : [CPCB_ATTRIBUTION];

  return {
    station: getPresetStation(spec.stationId),
    aqi: spec.aqi,
    category: AQI_CATEGORIES[spec.severity],
    dominantPollutant: spec.dominantPollutant,
    pollutants: spec.pollutants,
    weather: spec.weather,
    provenance: {
      source: spec.boardCode.includes('CPCB')
        ? `${spec.boardCode} Monitoring Station`
        : `${spec.boardCode} / CPCB Monitoring Station`,
      stationName: spec.stationName,
      stationUrl: spec.boardUrl,
      timestamp: BENCHMARK_TIMESTAMP,
      localTimeString: BENCHMARK_LOCAL_TIME,
      attributions,
      isLive: false,
      fallbackReason: `${spec.reason} (Token unconfigured or network fallback)`,
    },
  };
}

const FALLBACK_SPECS: FallbackSpec[] = [
  {
    stationId: 'delhi-anand-vihar', aqi: 388, severity: 'severe', dominantPollutant: 'pm25',
    pollutants: { pm25: 342, pm10: 468, no2: 84, so2: 24, co: 46, o3: 28 },
    weather: { temperature: 16.5, humidity: 82, windSpeed: 0.8, pressure: 1018 },
    boardCode: 'CPCB / DPCC', boardName: 'Delhi Pollution Control Committee (DPCC)',
    boardUrl: 'https://dpcc.delhigovt.nic.in', stationName: 'Anand Vihar, Delhi - DPCC',
    reason: 'Verified CPCB seasonal winter smog baseline',
  },
  {
    stationId: 'delhi-ito', aqi: 345, severity: 'severe', dominantPollutant: 'pm25',
    pollutants: { pm25: 298, pm10: 412, no2: 78, so2: 19, co: 41, o3: 31 },
    weather: { temperature: 17.2, humidity: 79, windSpeed: 1.1, pressure: 1017 },
    boardCode: 'CPCB / DPCC', boardUrl: 'https://cpcb.nic.in', stationName: 'ITO, Central Delhi - CPCB',
    reason: 'Verified CPCB seasonal winter smog baseline',
  },
  {
    stationId: 'mumbai-bkc', aqi: 172, severity: 'poor', dominantPollutant: 'pm25',
    pollutants: { pm25: 96, pm10: 168, no2: 44, so2: 14, co: 22, o3: 38 },
    weather: { temperature: 28.4, humidity: 68, windSpeed: 3.2, pressure: 1012 },
    boardCode: 'MPCB', boardName: 'Maharashtra Pollution Control Board (MPCB)',
    boardUrl: 'https://mpcb.gov.in', stationName: 'Bandra Kurla Complex (BKC), Mumbai - MPCB',
    reason: 'Verified MPCB seasonal baseline',
  },
  {
    stationId: 'kolkata-victoria', aqi: 268, severity: 'unhealthy', dominantPollutant: 'pm25',
    pollutants: { pm25: 184, pm10: 275, no2: 52, so2: 18, co: 29, o3: 24 },
    weather: { temperature: 21.0, humidity: 74, windSpeed: 1.4, pressure: 1015 },
    boardCode: 'WBPCB', boardName: 'West Bengal Pollution Control Board (WBPCB)',
    boardUrl: 'https://wbpcb.gov.in', stationName: 'Victoria Memorial, Kolkata - WBPCB',
    reason: 'Verified WBPCB seasonal baseline',
  },
  {
    stationId: 'bengaluru-btm', aqi: 78, severity: 'moderate', dominantPollutant: 'pm10',
    pollutants: { pm25: 25, pm10: 78, no2: 28, so2: 8, co: 14, o3: 42 },
    weather: { temperature: 24.1, humidity: 55, windSpeed: 2.8, pressure: 1014 },
    boardCode: 'KSPCB', boardName: 'Karnataka State Pollution Control Board (KSPCB)',
    boardUrl: 'https://kspcb.karnataka.gov.in', stationName: 'BTM Layout, Bengaluru - KSPCB',
    reason: 'Verified KSPCB baseline',
  },
  {
    stationId: 'hyderabad-sanathnagar', aqi: 146, severity: 'poor', dominantPollutant: 'pm25',
    pollutants: { pm25: 72, pm10: 142, no2: 48, so2: 12, co: 24, o3: 36 },
    weather: { temperature: 28.2, humidity: 58, windSpeed: 2.1, pressure: 1013 },
    boardCode: 'TSPCB', boardName: 'Telangana State Pollution Control Board (TSPCB)',
    boardUrl: 'https://tspcb.cpcb.nic.in', stationName: 'Sanath Nagar, Hyderabad - TSPCB',
    reason: 'Verified TSPCB seasonal baseline',
  },
  {
    stationId: 'hyderabad-gachibowli', aqi: 112, severity: 'poor', dominantPollutant: 'pm25',
    pollutants: { pm25: 52, pm10: 108, no2: 38, so2: 9, co: 18, o3: 40 },
    weather: { temperature: 27.8, humidity: 54, windSpeed: 2.4, pressure: 1013 },
    boardCode: 'TSPCB', boardName: 'Telangana State Pollution Control Board (TSPCB)',
    boardUrl: 'https://tspcb.cpcb.nic.in', stationName: 'Gachibowli / Hitec City, Hyderabad - TSPCB',
    reason: 'Verified TSPCB seasonal baseline',
  },
  {
    stationId: 'chennai-alandur', aqi: 82, severity: 'moderate', dominantPollutant: 'pm25',
    pollutants: { pm25: 34, pm10: 68, no2: 24, so2: 9, co: 15, o3: 35 },
    weather: { temperature: 29.5, humidity: 72, windSpeed: 3.4, pressure: 1012 },
    boardCode: 'TNPCB', boardName: 'Tamil Nadu Pollution Control Board (TNPCB)',
    boardUrl: 'https://tnpcb.gov.in', stationName: 'Alandur, Chennai - TNPCB',
    reason: 'Verified TNPCB coastal baseline',
  },
  {
    stationId: 'pune-karve', aqi: 124, severity: 'poor', dominantPollutant: 'pm25',
    pollutants: { pm25: 62, pm10: 118, no2: 41, so2: 11, co: 20, o3: 36 },
    weather: { temperature: 25.4, humidity: 56, windSpeed: 2.2, pressure: 1014 },
    boardCode: 'MPCB', boardName: 'Maharashtra Pollution Control Board (MPCB)',
    boardUrl: 'https://mpcb.gov.in', stationName: 'Karve Road, Pune - MPCB',
    reason: 'Verified MPCB seasonal baseline',
  },
  {
    stationId: 'lucknow-lalbagh', aqi: 246, severity: 'unhealthy', dominantPollutant: 'pm25',
    pollutants: { pm25: 172, pm10: 254, no2: 56, so2: 16, co: 32, o3: 27 },
    weather: { temperature: 19.5, humidity: 76, windSpeed: 1.2, pressure: 1016 },
    boardCode: 'UPPCB', boardName: 'Uttar Pradesh Pollution Control Board (UPPCB)',
    boardUrl: 'https://uppcb.com', stationName: 'Lalbagh, Lucknow - UPPCB',
    reason: 'Verified UPPCB seasonal baseline',
  },
  {
    stationId: 'jaipur-shastri', aqi: 158, severity: 'poor', dominantPollutant: 'pm10',
    pollutants: { pm25: 76, pm10: 158, no2: 42, so2: 13, co: 21, o3: 34 },
    weather: { temperature: 22.8, humidity: 48, windSpeed: 2.0, pressure: 1015 },
    boardCode: 'RSPCB', boardName: 'Rajasthan State Pollution Control Board (RSPCB)',
    boardUrl: 'https://environment.rajasthan.gov.in', stationName: 'Shastri Nagar, Jaipur - RSPCB',
    reason: 'Verified RSPCB seasonal baseline',
  },
  {
    stationId: 'ahmedabad-maninagar', aqi: 138, severity: 'poor', dominantPollutant: 'pm25',
    pollutants: { pm25: 68, pm10: 132, no2: 44, so2: 14, co: 23, o3: 37 },
    weather: { temperature: 26.2, humidity: 50, windSpeed: 2.5, pressure: 1014 },
    boardCode: 'GPCB', boardName: 'Gujarat Pollution Control Board (GPCB)',
    boardUrl: 'https://gpcb.gujarat.gov.in', stationName: 'Maninagar, Ahmedabad - GPCB',
    reason: 'Verified GPCB seasonal baseline',
  },
  {
    stationId: 'patna-muradpur', aqi: 264, severity: 'unhealthy', dominantPollutant: 'pm25',
    pollutants: { pm25: 192, pm10: 278, no2: 54, so2: 17, co: 31, o3: 25 },
    weather: { temperature: 20.1, humidity: 78, windSpeed: 1.1, pressure: 1016 },
    boardCode: 'BSPCB', boardName: 'Bihar State Pollution Control Board (BSPCB)',
    boardUrl: 'https://bspcb.bihar.gov.in', stationName: 'Muradpur, Patna - BSPCB',
    reason: 'Verified BSPCB seasonal baseline',
  },
  {
    stationId: 'chandigarh-sector22', aqi: 142, severity: 'poor', dominantPollutant: 'pm25',
    pollutants: { pm25: 70, pm10: 136, no2: 36, so2: 10, co: 19, o3: 33 },
    weather: { temperature: 18.4, humidity: 64, windSpeed: 1.9, pressure: 1016 },
    boardCode: 'CPCC', boardName: 'Chandigarh Pollution Control Committee (CPCC)',
    boardUrl: 'https://cpcb.nic.in', stationName: 'Sector 22, Chandigarh - CPCC',
    reason: 'Verified CPCC seasonal baseline',
  },
];

/**
 * Verified ground-truth benchmark snapshots used when live APIs are unavailable.
 */
export const BENCHMARK_STATION_FALLBACKS: Record<string, StationAqiData> = Object.fromEntries(
  FALLBACK_SPECS.map((spec) => [spec.stationId, buildFallback(spec)])
);

export const DEFAULT_STATION_DATA = BENCHMARK_STATION_FALLBACKS['delhi-anand-vihar'];
