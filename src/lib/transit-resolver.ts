export interface CityTransitInfo {
  matchKeys: string[];
  name: string;
  transitMode: string;
}

const CITY_TRANSIT_NETWORKS: CityTransitInfo[] = [
  {
    matchKeys: ['hyderabad', 'secunderabad', 'telangana'],
    name: 'Hyderabad Metro Rail / MMTS Transit',
    transitMode: 'Hyderabad Metro or MMTS local rail',
  },
  {
    matchKeys: ['mumbai', 'thane', 'navi mumbai'],
    name: 'Mumbai Metro / Suburban Railway',
    transitMode: 'Mumbai Metro or Suburban local train',
  },
  {
    matchKeys: ['bengaluru', 'bangalore'],
    name: 'Namma Metro / BMTC Electric Bus',
    transitMode: 'Namma Metro or BMTC electric bus',
  },
  {
    matchKeys: ['kolkata', 'howrah'],
    name: 'Kolkata Metro / Suburban Transit',
    transitMode: 'Kolkata Metro or suburban train',
  },
  {
    matchKeys: ['chennai'],
    name: 'Chennai Metro / MRTS Suburban Rail',
    transitMode: 'Chennai Metro or MRTS local transit',
  },
  {
    matchKeys: ['pune', 'pcmc'],
    name: 'Pune Metro / PMPML Electric Transit',
    transitMode: 'Pune Metro or PMPML electric bus',
  },
  {
    matchKeys: ['lucknow'],
    name: 'Lucknow Metro Rail',
    transitMode: 'Lucknow Metro',
  },
  {
    matchKeys: ['jaipur'],
    name: 'Jaipur Metro Rail',
    transitMode: 'Jaipur Metro',
  },
  {
    matchKeys: ['ahmedabad'],
    name: 'Ahmedabad Metro / Janmarg BRTS',
    transitMode: 'Ahmedabad Metro or Janmarg BRTS electric corridor',
  },
  {
    matchKeys: ['patna'],
    name: 'Patna Electric City Transit / Suburban Rail',
    transitMode: 'Patna electric bus fleet or local rail',
  },
  {
    matchKeys: ['chandigarh'],
    name: 'CTU Electric Bus Rapid Transit',
    transitMode: 'CTU electric rapid bus network',
  },
  {
    matchKeys: ['delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad'],
    name: 'Delhi Metro (DMRC) / RRTS Rail',
    transitMode: 'Delhi Metro or RRTS electric transit',
  },
];

/**
 * Resolves regional public transit networks for Indian metropolitan cities.
 */
export function resolveCityTransit(cityOrStationContext: string): {
  name: string;
  transitMode: string;
} {
  const normalized = (cityOrStationContext || '').toLowerCase();
  const matched = CITY_TRANSIT_NETWORKS.find((entry) =>
    entry.matchKeys.some((key) => normalized.includes(key))
  );
  if (matched) {
    return { name: matched.name, transitMode: matched.transitMode };
  }

  const cityName =
    cityOrStationContext && cityOrStationContext.trim()
      ? cityOrStationContext.split(',')[0].trim()
      : 'Local City';
  return {
    name: `${cityName} Metro / Rapid Transit`,
    transitMode: `${cityName} electric bus or rapid transit`,
  };
}
