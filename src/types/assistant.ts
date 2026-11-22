import { UserProfile } from './persona';

export interface OutdoorTimeWindow {
  window: string; // e.g. "12:30 PM - 03:30 PM"
  advice: string;
  riskLevel: 'safe' | 'caution' | 'danger';
}

export interface PurifierGuidance {
  recommendedHours: string;
  operatingMode: string;
  rationale: string;
}

export interface VentilationGuidance {
  optimalWindow: string;
  instructions: string;
  warningNotice?: string;
}

export interface SustainableAlternativeAction {
  action: string;
  causalWhy: string;
  personalHealthImpact: string; // e.g. "Reduces PM2.5 alveolar penetration by ~70% during peak commute"
  collectiveEcologicalImpact: string; // e.g. "Consolidating errands cuts ~1.8 kg CO2 and prevents cold-start emissions"
}

export interface Pillar1LowEmissionRoutines {
  commuteModeRecommendation: string;
  commuteDepartureStrategy: string;
  safeOutdoorTimeWindows: OutdoorTimeWindow[];
  tripConsolidationTips: string[];
  inversionWarning: string;
}

export interface Pillar2IndoorAirQuality {
  purifierSchedule: PurifierGuidance;
  ventilationWindows: VentilationGuidance;
  botanicalAndPhysicalMeasures: string[];
  dustSuppressionTip: string;
}

export interface Pillar3SustainableAlternatives {
  recommendations: SustainableAlternativeAction[];
}

export interface VerifiedAqiSnapshot {
  aqi: number;
  category: string;
  dominantPollutant: string;
  pm25?: number;
  pm10?: number;
  stationName: string;
  city: string;
  timestamp: string;
  isLive: boolean;
}

export interface AssistantAdvice {
  summary: string;
  threatLevel: 'low' | 'moderate' | 'severe' | 'hazardous';
  verifiedAqiSnapshot: VerifiedAqiSnapshot;
  personaProfile: {
    id: string;
    role: string;
    age: number;
    sensitivityLevel: string;
  };
  pillar1_lowEmissionRoutines: Pillar1LowEmissionRoutines;
  pillar2_indoorAirQuality: Pillar2IndoorAirQuality;
  pillar3_sustainableAlternatives: Pillar3SustainableAlternatives;
  metadata: {
    modelUsed: string;
    isAiGenerated: boolean;
    generatedAt: string;
    generationNote?: string;
  };
}

export interface AssistantApiResponse {
  success: boolean;
  data?: AssistantAdvice;
  error?: string;
}
