export type AqiSeverity = 'good' | 'moderate' | 'poor' | 'unhealthy' | 'severe' | 'hazardous';

export interface AqiCategoryInfo {
  category: AqiSeverity;
  label: string;
  range: [number, number];
  color: string;
  bgColor: string;
  borderColor: string;
  healthSummary: string;
}

export interface PollutantValues {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
}

export interface WeatherMetrics {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
}

export interface StationMetadata {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  coordinates: [number, number]; // [latitude, longitude]
  cpcbCode?: string;
  isPopularPreset?: boolean;
}

export interface DataProvenance {
  source: string; // e.g., "CPCB via WAQI" or "CPCB / DPCC Ground Station"
  stationName: string;
  stationUrl?: string;
  timestamp: string; // ISO 8601 string
  localTimeString: string;
  attributions: Array<{
    name: string;
    url?: string;
  }>;
  isLive: boolean; // true if fetched from live WAQI/CPCB API, false if using verified benchmark fallback
  fallbackReason?: string;
}

export interface StationAqiData {
  station: StationMetadata;
  aqi: number;
  category: AqiCategoryInfo;
  dominantPollutant: string;
  pollutants: PollutantValues;
  weather?: WeatherMetrics;
  provenance: DataProvenance;
}

export interface StationPresetsPayload {
  presets: StationMetadata[];
}

export interface AqiApiResponse {
  success: boolean;
  data?: StationAqiData | StationPresetsPayload;
  error?: string;
}
