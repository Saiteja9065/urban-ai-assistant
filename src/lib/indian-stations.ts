import { StationMetadata } from '@/types/aqi';

export interface MetroRegion {
  id: string;
  name: string;
  defaultStationId: string;
  matchKeys: string[];
}

type StationSeed = [
  id: string,
  name: string,
  city: string,
  state: string,
  lat: number,
  lon: number,
  cpcbCode: string,
  isPopularPreset?: boolean,
];

const STATION_SEEDS: StationSeed[] = [
  ['delhi-anand-vihar', 'Anand Vihar, Delhi', 'Delhi', 'Delhi NCR', 28.647, 77.315, 'DL001', true],
  ['delhi-ito', 'ITO, Central Delhi', 'Delhi', 'Delhi NCR', 28.628, 77.241, 'DL002', true],
  ['delhi-rk-puram', 'R K Puram, South Delhi', 'Delhi', 'Delhi NCR', 28.563, 77.186, 'DL003', true],
  ['noida-sector-62', 'Sector 62, Noida', 'Noida', 'Uttar Pradesh', 28.627, 77.362, 'UP001'],
  ['gurugram-vihar', 'Vikas Sadan, Gurugram', 'Gurugram', 'Haryana', 28.455, 77.03, 'HR001'],
  ['mumbai-bkc', 'Bandra Kurla Complex (BKC), Mumbai', 'Mumbai', 'Maharashtra', 19.066, 72.868, 'MH001', true],
  ['mumbai-worli', 'Worli, South Mumbai', 'Mumbai', 'Maharashtra', 19.018, 72.818, 'MH002'],
  ['kolkata-victoria', 'Victoria Memorial, Kolkata', 'Kolkata', 'West Bengal', 22.544, 88.342, 'WB001', true],
  ['kolkata-jadavpur', 'Jadavpur, Kolkata', 'Kolkata', 'West Bengal', 22.498, 88.371, 'WB002'],
  ['bengaluru-btm', 'BTM Layout, Bengaluru', 'Bengaluru', 'Karnataka', 12.913, 77.61, 'KA001', true],
  ['chennai-alandur', 'Alandur, Chennai', 'Chennai', 'Tamil Nadu', 13.003, 80.201, 'TN001'],
  ['hyderabad-sanathnagar', 'Sanath Nagar, Hyderabad', 'Hyderabad', 'Telangana', 17.456, 78.443, 'TG001', true],
  ['hyderabad-gachibowli', 'Gachibowli / Hitec City, Hyderabad', 'Hyderabad', 'Telangana', 17.44, 78.348, 'TG002'],
  ['hyderabad-zoopark', 'Nehru Zoological Park, Hyderabad', 'Hyderabad', 'Telangana', 17.348, 78.451, 'TG003'],
  ['hyderabad-bollaram', 'IDA Bollaram, Hyderabad', 'Hyderabad', 'Telangana', 17.558, 78.349, 'TG004'],
  ['hyderabad-kompally', 'Kompally, Secunderabad', 'Hyderabad', 'Telangana', 17.545, 78.49, 'TG005'],
  ['pune-karve', 'Karve Road, Pune', 'Pune', 'Maharashtra', 18.508, 73.834, 'PN001'],
  ['pune-shivajinagar', 'Shivaji Nagar, Pune', 'Pune', 'Maharashtra', 18.531, 73.844, 'PN002'],
  ['pune-bhosari', 'Bhosari Industrial Area, Pune', 'Pune', 'Maharashtra', 18.627, 73.846, 'PN003'],
  ['lucknow-lalbagh', 'Lalbagh, Lucknow', 'Lucknow', 'Uttar Pradesh', 26.848, 80.938, 'LK001'],
  ['lucknow-gomtinagar', 'Gomti Nagar, Lucknow', 'Lucknow', 'Uttar Pradesh', 26.852, 80.999, 'LK002'],
  ['lucknow-talkatora', 'Talkatora District, Lucknow', 'Lucknow', 'Uttar Pradesh', 26.833, 80.897, 'LK003'],
  ['jaipur-shastri', 'Shastri Nagar, Jaipur', 'Jaipur', 'Rajasthan', 26.945, 75.802, 'JP001'],
  ['jaipur-ajmeri', 'Ajmeri Gate, Jaipur', 'Jaipur', 'Rajasthan', 26.918, 75.819, 'JP002'],
  ['ahmedabad-maninagar', 'Maninagar, Ahmedabad', 'Ahmedabad', 'Gujarat', 22.997, 72.603, 'GJ001'],
  ['ahmedabad-chandkheda', 'Chandkheda, Ahmedabad', 'Ahmedabad', 'Gujarat', 23.111, 72.583, 'GJ002'],
  ['patna-muradpur', 'Muradpur, Patna', 'Patna', 'Bihar', 25.621, 85.166, 'BR001'],
  ['patna-samanpura', 'Samanpura, Patna', 'Patna', 'Bihar', 25.608, 85.088, 'BR002'],
  ['chandigarh-sector22', 'Sector 22, Chandigarh', 'Chandigarh', 'Chandigarh', 30.733, 76.772, 'CH001'],
  ['chandigarh-sector25', 'Panjab University, Sector 25, Chandigarh', 'Chandigarh', 'Chandigarh', 30.749, 76.758, 'CH002'],
];

/**
 * Pre-configured Indian Metro Stations (CPCB / State Pollution Control Boards).
 */
export const INDIAN_METRO_STATIONS: StationMetadata[] = STATION_SEEDS.map(
  ([id, name, city, state, lat, lon, cpcbCode, isPopularPreset = false]) => ({
    id,
    name,
    city,
    state,
    country: 'India',
    coordinates: [lat, lon],
    cpcbCode,
    isPopularPreset,
  })
);

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
      'hyderabad', 'secunderabad', 'telangana', 'madhapur', 'gachibowli',
      'hitec', 'kondapur', 'banjara', 'jubilee', 'kukatpally', 'begumpet', 'kompally', 'bollaram',
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
