import { AqiCategoryInfo, AqiSeverity } from '@/types/aqi';

/**
 * Indian National Air Quality Index (NAQI) & CPCB Category Breakpoints.
 */
export const AQI_CATEGORIES: Record<AqiSeverity, AqiCategoryInfo> = {
  good: {
    category: 'good',
    label: 'Good',
    range: [0, 50],
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    healthSummary: 'Minimal health impact; clean and safe for all outdoor activities.',
  },
  moderate: {
    category: 'moderate',
    label: 'Moderate',
    range: [51, 100],
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    healthSummary: 'Acceptable air quality; minor breathing discomfort to sensitive people.',
  },
  poor: {
    category: 'poor',
    label: 'Poor',
    range: [101, 200],
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    healthSummary: 'Breathing discomfort to most people on prolonged exposure.',
  },
  unhealthy: {
    category: 'unhealthy',
    label: 'Very Poor',
    range: [201, 300],
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    healthSummary:
      'Respiratory illness on prolonged exposure. Significant risk for heart/lung conditions.',
  },
  severe: {
    category: 'severe',
    label: 'Severe',
    range: [301, 400],
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    healthSummary: 'Affects healthy people and seriously impacts those with existing diseases.',
  },
  hazardous: {
    category: 'hazardous',
    label: 'Severe Plus / Hazardous',
    range: [401, 999],
    color: '#831843',
    bgColor: 'rgba(131, 24, 67, 0.2)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    healthSummary: 'Emergency conditions; entire population is likely to be severely affected.',
  },
};

const AQI_THRESHOLDS: Array<{ max: number; severity: AqiSeverity }> = [
  { max: 50, severity: 'good' },
  { max: 100, severity: 'moderate' },
  { max: 200, severity: 'poor' },
  { max: 300, severity: 'unhealthy' },
  { max: 400, severity: 'severe' },
];

/**
 * Resolves an AQI numerical value into its NAQI category descriptor.
 */
export function getAqiCategory(aqi: number): AqiCategoryInfo {
  const match = AQI_THRESHOLDS.find((tier) => aqi <= tier.max);
  return match ? AQI_CATEGORIES[match.severity] : AQI_CATEGORIES.hazardous;
}
