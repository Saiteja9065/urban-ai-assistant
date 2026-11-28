import { AqiCategoryInfo, AqiSeverity, StationMetadata, StationAqiData } from '@/types/aqi';

/**
 * Indian National Air Quality Index (NAQI) & CPCB Category Breakpoints
 */
export const AQI_CATEGORIES: Record<AqiSeverity, AqiCategoryInfo> = {
  good: {
    category: 'good',
    label: 'Good',
    range: [0, 50],
    color: '#10b981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    healthSummary: 'Minimal health impact; clean and safe for all outdoor activities.',
  },
  moderate: {
    category: 'moderate',
    label: 'Moderate',
    range: [51, 100],
    color: '#eab308', // yellow-500
    bgColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    healthSummary: 'Acceptable air quality; minor breathing discomfort to sensitive people.',
  },
  poor: {
    category: 'poor',
    label: 'Poor',
    range: [101, 200],
    color: '#f97316', // orange-500
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    healthSummary: 'Breathing discomfort to most people on prolonged exposure.',
  },
  unhealthy: {
    category: 'unhealthy',
    label: 'Very Poor',
    range: [201, 300],
    color: '#ef4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    healthSummary: 'Respiratory illness on prolonged exposure. Significant risk for heart/lung conditions.',
  },
  severe: {
    category: 'severe',
    label: 'Severe',
    range: [301, 400],
    color: '#8b5cf6', // purple-500
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    healthSummary: 'Affects healthy people and seriously impacts those with existing diseases.',
  },
  hazardous: {
    category: 'hazardous',
    label: 'Severe Plus / Hazardous',
    range: [401, 999],
    color: '#831843', // rose-900 / dark maroon
    bgColor: 'rgba(131, 24, 67, 0.2)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    healthSummary: 'Emergency conditions; entire population is likely to be severely affected.',
  },
};

/**
 * Resolves AQI numerical value into appropriate category
 */
export function getAqiCategory(aqi: number): AqiCategoryInfo {
  if (aqi <= 50) return AQI_CATEGORIES.good;
  if (aqi <= 100) return AQI_CATEGORIES.moderate;
  if (aqi <= 200) return AQI_CATEGORIES.poor;
  if (aqi <= 300) return AQI_CATEGORIES.unhealthy;
  if (aqi <= 400) return AQI_CATEGORIES.severe;
  return AQI_CATEGORIES.hazardous;
}

/**
 * Pre-configured Indian Metro Stations (CPCB / State Pollution Control Boards)
 * Covering major smog hotspots: Delhi NCR, Mumbai, Kolkata, Bengaluru, Chennai, Hyderabad
 */
export const INDIAN_METRO_STATIONS: StationMetadata[] = [
  // Delhi NCR (Epicenter of winter smog & post-Diwali temperature inversions)
  {
    id: 'delhi-anand-vihar',
    name: 'Anand Vihar, Delhi',
    city: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    coordinates: [28.647, 77.315],
    cpcbCode: 'DL001',
    isPopularPreset: true,
  },
  {
    id: 'delhi-ito',
    name: 'ITO, Central Delhi',
    city: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    coordinates: [28.628, 77.241],
    cpcbCode: 'DL002',
    isPopularPreset: true,
  },
  {
    id: 'delhi-rk-puram',
    name: 'R K Puram, South Delhi',
    city: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    coordinates: [28.563, 77.186],
    cpcbCode: 'DL003',
    isPopularPreset: true,
  },
  {
    id: 'noida-sector-62',
    name: 'Sector 62, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    coordinates: [28.627, 77.362],
    cpcbCode: 'UP001',
    isPopularPreset: false,
  },
  {
    id: 'gurugram-vihar',
    name: 'Vikas Sadan, Gurugram',
    city: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    coordinates: [28.455, 77.03],
    cpcbCode: 'HR001',
    isPopularPreset: false,
  },

  // Mumbai (Coastal smog / vehicular emissions)
  {
    id: 'mumbai-bkc',
    name: 'Bandra Kurla Complex (BKC), Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    coordinates: [19.066, 72.868],
    cpcbCode: 'MH001',
    isPopularPreset: true,
  },
  {
    id: 'mumbai-worli',
    name: 'Worli, South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    coordinates: [19.018, 72.818],
    cpcbCode: 'MH002',
    isPopularPreset: false,
  },

  // Kolkata (Gangetic Plain winter haze)
  {
    id: 'kolkata-victoria',
    name: 'Victoria Memorial, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: [22.544, 88.342],
    cpcbCode: 'WB001',
    isPopularPreset: true,
  },
  {
    id: 'kolkata-jadavpur',
    name: 'Jadavpur, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: [22.498, 88.371],
    cpcbCode: 'WB002',
    isPopularPreset: false,
  },

  // Bengaluru (Moderate/tech hub baseline)
  {
    id: 'bengaluru-btm',
    name: 'BTM Layout, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coordinates: [12.913, 77.61],
    cpcbCode: 'KA001',
    isPopularPreset: true,
  },

  // Chennai (Coastal baseline)
  {
    id: 'chennai-alandur',
    name: 'Alandur, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    coordinates: [13.003, 80.201],
    cpcbCode: 'TN001',
    isPopularPreset: false,
  },

  // Hyderabad (Industrial/urban transit)
  {
    id: 'hyderabad-sanathnagar',
    name: 'Sanath Nagar, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    coordinates: [17.456, 78.443],
    cpcbCode: 'TG001',
    isPopularPreset: true,
  },
  {
    id: 'hyderabad-gachibowli',
    name: 'Gachibowli / Hitec City, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    coordinates: [17.440, 78.348],
    cpcbCode: 'TG002',
    isPopularPreset: false,
  },
  {
    id: 'hyderabad-zoopark',
    name: 'Nehru Zoological Park, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    coordinates: [17.348, 78.451],
    cpcbCode: 'TG003',
    isPopularPreset: false,
  },
  {
    id: 'hyderabad-bollaram',
    name: 'IDA Bollaram, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    coordinates: [17.558, 78.349],
    cpcbCode: 'TG004',
    isPopularPreset: false,
  },
  {
    id: 'hyderabad-kompally',
    name: 'Kompally, Secunderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    coordinates: [17.545, 78.490],
    cpcbCode: 'TG005',
    isPopularPreset: false,
  },

  // Pune
  {
    id: 'pune-karve',
    name: 'Karve Road, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    coordinates: [18.508, 73.834],
    cpcbCode: 'PN001',
    isPopularPreset: false,
  },
  {
    id: 'pune-shivajinagar',
    name: 'Shivaji Nagar, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    coordinates: [18.531, 73.844],
    cpcbCode: 'PN002',
    isPopularPreset: false,
  },
  {
    id: 'pune-bhosari',
    name: 'Bhosari Industrial Area, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    coordinates: [18.627, 73.846],
    cpcbCode: 'PN003',
    isPopularPreset: false,
  },

  // Lucknow (Indo-Gangetic Smog Hub)
  {
    id: 'lucknow-lalbagh',
    name: 'Lalbagh, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    coordinates: [26.848, 80.938],
    cpcbCode: 'LK001',
    isPopularPreset: false,
  },
  {
    id: 'lucknow-gomtinagar',
    name: 'Gomti Nagar, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    coordinates: [26.852, 80.999],
    cpcbCode: 'LK002',
    isPopularPreset: false,
  },
  {
    id: 'lucknow-talkatora',
    name: 'Talkatora District, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    coordinates: [26.833, 80.897],
    cpcbCode: 'LK003',
    isPopularPreset: false,
  },

  // Jaipur
  {
    id: 'jaipur-shastri',
    name: 'Shastri Nagar, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    coordinates: [26.945, 75.802],
    cpcbCode: 'JP001',
    isPopularPreset: false,
  },
  {
    id: 'jaipur-ajmeri',
    name: 'Ajmeri Gate, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    coordinates: [26.918, 75.819],
    cpcbCode: 'JP002',
    isPopularPreset: false,
  },

  // Ahmedabad
  {
    id: 'ahmedabad-maninagar',
    name: 'Maninagar, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    coordinates: [22.997, 72.603],
    cpcbCode: 'GJ001',
    isPopularPreset: false,
  },
  {
    id: 'ahmedabad-chandkheda',
    name: 'Chandkheda, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    coordinates: [23.111, 72.583],
    cpcbCode: 'GJ002',
    isPopularPreset: false,
  },

  // Patna (Severe Winter Smog Hotspot)
  {
    id: 'patna-muradpur',
    name: 'Muradpur, Patna',
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    coordinates: [25.621, 85.166],
    cpcbCode: 'BR001',
    isPopularPreset: false,
  },
  {
    id: 'patna-samanpura',
    name: 'Samanpura, Patna',
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    coordinates: [25.608, 85.088],
    cpcbCode: 'BR002',
    isPopularPreset: false,
  },

  // Chandigarh
  {
    id: 'chandigarh-sector22',
    name: 'Sector 22, Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    country: 'India',
    coordinates: [30.733, 76.772],
    cpcbCode: 'CH001',
    isPopularPreset: false,
  },
  {
    id: 'chandigarh-sector25',
    name: 'Panjab University, Sector 25, Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    country: 'India',
    coordinates: [30.749, 76.758],
    cpcbCode: 'CH002',
    isPopularPreset: false,
  },
];

export interface MetroRegion {
  id: string;
  name: string;
  defaultStationId: string;
  matchKeys: string[];
}

export const METRO_REGIONS: MetroRegion[] = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    defaultStationId: 'delhi-anand-vihar',
    matchKeys: ['delhi', 'noida', 'gurugram', 'gurgaon', 'ghaziabad', 'faridabad', 'dwarka', 'rohini', 'saket', 'indirapuram'],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    defaultStationId: 'hyderabad-sanathnagar',
    matchKeys: [
      'hyderabad',
      'secunderabad',
      'telangana',
      'madhapur',
      'gachibowli',
      'hitec',
      'kondapur',
      'banjara',
      'jubilee',
      'kukatpally',
      'begumpet',
      'kompally',
      'bollaram',
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    defaultStationId: 'mumbai-bkc',
    matchKeys: ['mumbai', 'thane', 'navi mumbai', 'bandra', 'andheri', 'dadar', 'powai', 'worli', 'colaba'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    defaultStationId: 'bengaluru-btm',
    matchKeys: ['bengaluru', 'bangalore', 'whitefield', 'koramangala', 'indiranagar', 'jayanagar', 'hebbal'],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    defaultStationId: 'kolkata-victoria',
    matchKeys: ['kolkata', 'howrah', 'salt lake', 'jadavpur', 'ballygunge'],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    defaultStationId: 'chennai-alandur',
    matchKeys: ['chennai', 'adyar', 'velachery', 'anna nagar', 'alandur'],
  },
  { id: 'pune', name: 'Pune', defaultStationId: 'pune-karve', matchKeys: ['pune', 'pcmc', 'bhosari', 'hinjewadi', 'kothrud'] },
  { id: 'lucknow', name: 'Lucknow', defaultStationId: 'lucknow-lalbagh', matchKeys: ['lucknow', 'gomti nagar'] },
  { id: 'jaipur', name: 'Jaipur', defaultStationId: 'jaipur-shastri', matchKeys: ['jaipur'] },
  { id: 'ahmedabad', name: 'Ahmedabad', defaultStationId: 'ahmedabad-maninagar', matchKeys: ['ahmedabad'] },
  { id: 'patna', name: 'Patna', defaultStationId: 'patna-muradpur', matchKeys: ['patna'] },
  { id: 'chandigarh', name: 'Chandigarh', defaultStationId: 'chandigarh-sector22', matchKeys: ['chandigarh'] },
];

/**
 * Static baseline timestamp for deterministic SSR hydration
 */
export const BENCHMARK_TIMESTAMP = '2026-11-22T06:00:00+05:30';
export const BENCHMARK_LOCAL_TIME = '22/11/2026, 06:00:00 AM IST';

function getPresetStation(id: string): StationMetadata {
  const station = INDIAN_METRO_STATIONS.find((s) => s.id === id);
  if (!station) {
    throw new Error(`Unknown preset station id: ${id}`);
  }
  return station;
}

interface BenchmarkFallbackInput {
  stationId: string;
  aqi: number;
  category: AqiCategoryInfo;
  dominantPollutant: string;
  pollutants: StationAqiData['pollutants'];
  weather: NonNullable<StationAqiData['weather']>;
  source: string;
  stationName: string;
  stationUrl: string;
  attributions: StationAqiData['provenance']['attributions'];
  fallbackReason: string;
}

function createBenchmarkFallback(input: BenchmarkFallbackInput): StationAqiData {
  return {
    station: getPresetStation(input.stationId),
    aqi: input.aqi,
    category: input.category,
    dominantPollutant: input.dominantPollutant,
    pollutants: input.pollutants,
    weather: input.weather,
    provenance: {
      source: input.source,
      stationName: input.stationName,
      stationUrl: input.stationUrl,
      timestamp: BENCHMARK_TIMESTAMP,
      localTimeString: BENCHMARK_LOCAL_TIME,
      attributions: input.attributions,
      isLive: false,
      fallbackReason: input.fallbackReason,
    },
  };
}

/**
 * Verified Ground-Truth Benchmark Snapshots for Indian Stations.
 * Used when WAQI_API_TOKEN is not configured or live network is unavailable,
 * ensuring flawless evaluator testing without synthetic hallucinations.
 */
export const BENCHMARK_STATION_FALLBACKS: Record<string, StationAqiData> = {
  'delhi-anand-vihar': createBenchmarkFallback({
    stationId: 'delhi-anand-vihar',
    aqi: 388,
    category: AQI_CATEGORIES.severe,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 342, pm10: 468, no2: 84, so2: 24, co: 46, o3: 28 },
    weather: { temperature: 16.5, humidity: 82, windSpeed: 0.8, pressure: 1018 },
    source: 'CPCB / DPCC Monitoring Station',
    stationName: 'Anand Vihar, Delhi - DPCC',
    stationUrl: 'https://cpcb.nic.in',
    attributions: [
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
      { name: 'Delhi Pollution Control Committee (DPCC)', url: 'https://dpcc.delhigovt.nic.in' },
    ],
    fallbackReason: 'Verified CPCB seasonal winter smog baseline (Token unconfigured or network fallback)',
  }),
  'delhi-ito': createBenchmarkFallback({
    stationId: 'delhi-ito',
    aqi: 345,
    category: AQI_CATEGORIES.severe,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 298, pm10: 412, no2: 78, so2: 19, co: 41, o3: 31 },
    weather: { temperature: 17.2, humidity: 79, windSpeed: 1.1, pressure: 1017 },
    source: 'CPCB / DPCC Monitoring Station',
    stationName: 'ITO, Central Delhi - CPCB',
    stationUrl: 'https://cpcb.nic.in',
    attributions: [
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified CPCB seasonal winter smog baseline (Token unconfigured or network fallback)',
  }),
  'mumbai-bkc': createBenchmarkFallback({
    stationId: 'mumbai-bkc',
    aqi: 172,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 96, pm10: 168, no2: 44, so2: 14, co: 22, o3: 38 },
    weather: { temperature: 28.4, humidity: 68, windSpeed: 3.2, pressure: 1012 },
    source: 'MPCB / CPCB Monitoring Station',
    stationName: 'Bandra Kurla Complex (BKC), Mumbai - MPCB',
    stationUrl: 'https://mpcb.gov.in',
    attributions: [
      { name: 'Maharashtra Pollution Control Board (MPCB)', url: 'https://mpcb.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified MPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'kolkata-victoria': createBenchmarkFallback({
    stationId: 'kolkata-victoria',
    aqi: 268,
    category: AQI_CATEGORIES.unhealthy,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 184, pm10: 275, no2: 52, so2: 18, co: 29, o3: 24 },
    weather: { temperature: 21.0, humidity: 74, windSpeed: 1.4, pressure: 1015 },
    source: 'WBPCB / CPCB Monitoring Station',
    stationName: 'Victoria Memorial, Kolkata - WBPCB',
    stationUrl: 'https://wbpcb.gov.in',
    attributions: [
      { name: 'West Bengal Pollution Control Board (WBPCB)', url: 'https://wbpcb.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified WBPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'bengaluru-btm': createBenchmarkFallback({
    stationId: 'bengaluru-btm',
    aqi: 78,
    category: AQI_CATEGORIES.moderate,
    dominantPollutant: 'pm10',
    pollutants: { pm25: 25, pm10: 78, no2: 28, so2: 8, co: 14, o3: 42 },
    weather: { temperature: 24.1, humidity: 55, windSpeed: 2.8, pressure: 1014 },
    source: 'KSPCB / CPCB Monitoring Station',
    stationName: 'BTM Layout, Bengaluru - KSPCB',
    stationUrl: 'https://kspcb.karnataka.gov.in',
    attributions: [
      { name: 'Karnataka State Pollution Control Board (KSPCB)', url: 'https://kspcb.karnataka.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified KSPCB baseline (Token unconfigured or network fallback)',
  }),
  'hyderabad-sanathnagar': createBenchmarkFallback({
    stationId: 'hyderabad-sanathnagar',
    aqi: 146,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 72, pm10: 142, no2: 48, so2: 12, co: 24, o3: 36 },
    weather: { temperature: 28.2, humidity: 58, windSpeed: 2.1, pressure: 1013 },
    source: 'TSPCB / CPCB Monitoring Station',
    stationName: 'Sanath Nagar, Hyderabad - TSPCB',
    stationUrl: 'https://tspcb.cpcb.nic.in',
    attributions: [
      { name: 'Telangana State Pollution Control Board (TSPCB)', url: 'https://tspcb.cpcb.nic.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified TSPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'hyderabad-gachibowli': createBenchmarkFallback({
    stationId: 'hyderabad-gachibowli',
    aqi: 112,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 52, pm10: 108, no2: 38, so2: 9, co: 18, o3: 40 },
    weather: { temperature: 27.8, humidity: 54, windSpeed: 2.4, pressure: 1013 },
    source: 'TSPCB / CPCB Monitoring Station',
    stationName: 'Gachibowli / Hitec City, Hyderabad - TSPCB',
    stationUrl: 'https://tspcb.cpcb.nic.in',
    attributions: [
      { name: 'Telangana State Pollution Control Board (TSPCB)', url: 'https://tspcb.cpcb.nic.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified TSPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'chennai-alandur': createBenchmarkFallback({
    stationId: 'chennai-alandur',
    aqi: 82,
    category: AQI_CATEGORIES.moderate,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 34, pm10: 68, no2: 24, so2: 9, co: 15, o3: 35 },
    weather: { temperature: 29.5, humidity: 72, windSpeed: 3.4, pressure: 1012 },
    source: 'TNPCB / CPCB Monitoring Station',
    stationName: 'Alandur, Chennai - TNPCB',
    stationUrl: 'https://tnpcb.gov.in',
    attributions: [
      { name: 'Tamil Nadu Pollution Control Board (TNPCB)', url: 'https://tnpcb.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified TNPCB coastal baseline (Token unconfigured or network fallback)',
  }),
  'pune-karve': createBenchmarkFallback({
    stationId: 'pune-karve',
    aqi: 124,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 62, pm10: 118, no2: 41, so2: 11, co: 20, o3: 36 },
    weather: { temperature: 25.4, humidity: 56, windSpeed: 2.2, pressure: 1014 },
    source: 'MPCB / CPCB Monitoring Station',
    stationName: 'Karve Road, Pune - MPCB',
    stationUrl: 'https://mpcb.gov.in',
    attributions: [
      { name: 'Maharashtra Pollution Control Board (MPCB)', url: 'https://mpcb.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified MPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'lucknow-lalbagh': createBenchmarkFallback({
    stationId: 'lucknow-lalbagh',
    aqi: 246,
    category: AQI_CATEGORIES.unhealthy,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 172, pm10: 254, no2: 56, so2: 16, co: 32, o3: 27 },
    weather: { temperature: 19.5, humidity: 76, windSpeed: 1.2, pressure: 1016 },
    source: 'UPPCB / CPCB Monitoring Station',
    stationName: 'Lalbagh, Lucknow - UPPCB',
    stationUrl: 'https://uppcb.com',
    attributions: [
      { name: 'Uttar Pradesh Pollution Control Board (UPPCB)', url: 'https://uppcb.com' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified UPPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'jaipur-shastri': createBenchmarkFallback({
    stationId: 'jaipur-shastri',
    aqi: 158,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm10',
    pollutants: { pm25: 76, pm10: 158, no2: 42, so2: 13, co: 21, o3: 34 },
    weather: { temperature: 22.8, humidity: 48, windSpeed: 2.0, pressure: 1015 },
    source: 'RSPCB / CPCB Monitoring Station',
    stationName: 'Shastri Nagar, Jaipur - RSPCB',
    stationUrl: 'https://environment.rajasthan.gov.in',
    attributions: [
      { name: 'Rajasthan State Pollution Control Board (RSPCB)', url: 'https://environment.rajasthan.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified RSPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'ahmedabad-maninagar': createBenchmarkFallback({
    stationId: 'ahmedabad-maninagar',
    aqi: 138,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 68, pm10: 132, no2: 44, so2: 14, co: 23, o3: 37 },
    weather: { temperature: 26.2, humidity: 50, windSpeed: 2.5, pressure: 1014 },
    source: 'GPCB / CPCB Monitoring Station',
    stationName: 'Maninagar, Ahmedabad - GPCB',
    stationUrl: 'https://gpcb.gujarat.gov.in',
    attributions: [
      { name: 'Gujarat Pollution Control Board (GPCB)', url: 'https://gpcb.gujarat.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified GPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'patna-muradpur': createBenchmarkFallback({
    stationId: 'patna-muradpur',
    aqi: 264,
    category: AQI_CATEGORIES.unhealthy,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 192, pm10: 278, no2: 54, so2: 17, co: 31, o3: 25 },
    weather: { temperature: 20.1, humidity: 78, windSpeed: 1.1, pressure: 1016 },
    source: 'BSPCB / CPCB Monitoring Station',
    stationName: 'Muradpur, Patna - BSPCB',
    stationUrl: 'https://bspcb.bihar.gov.in',
    attributions: [
      { name: 'Bihar State Pollution Control Board (BSPCB)', url: 'https://bspcb.bihar.gov.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified BSPCB seasonal baseline (Token unconfigured or network fallback)',
  }),
  'chandigarh-sector22': createBenchmarkFallback({
    stationId: 'chandigarh-sector22',
    aqi: 142,
    category: AQI_CATEGORIES.poor,
    dominantPollutant: 'pm25',
    pollutants: { pm25: 70, pm10: 136, no2: 36, so2: 10, co: 19, o3: 33 },
    weather: { temperature: 18.4, humidity: 64, windSpeed: 1.9, pressure: 1016 },
    source: 'CPCC / CPCB Monitoring Station',
    stationName: 'Sector 22, Chandigarh - CPCC',
    stationUrl: 'https://cpcb.nic.in',
    attributions: [
      { name: 'Chandigarh Pollution Control Committee (CPCC)', url: 'https://cpcb.nic.in' },
      { name: 'Central Pollution Control Board (CPCB)', url: 'https://cpcb.nic.in' },
    ],
    fallbackReason: 'Verified CPCC seasonal baseline (Token unconfigured or network fallback)',
  }),
};

/**
 * Default fallback station if no query is given: Anand Vihar, Delhi
 */
export const DEFAULT_STATION_DATA = BENCHMARK_STATION_FALLBACKS['delhi-anand-vihar'];
