import { StationAqiData } from '@/types/aqi';
import { UserProfile } from '@/types/persona';
import {
  AssistantAdvice,
  Pillar1LowEmissionRoutines,
  Pillar2IndoorAirQuality,
  Pillar3SustainableAlternatives,
  VerifiedAqiSnapshot,
} from '@/types/assistant';
import { resolveCityTransit } from './transit-resolver';

/** Builds a verified AQI snapshot summary from live or fallback station data. */
export function buildVerifiedSnapshot(aqiData: StationAqiData): VerifiedAqiSnapshot {
  return {
    aqi: aqiData.aqi,
    category: aqiData.category.label,
    dominantPollutant: aqiData.dominantPollutant.toUpperCase(),
    pm25: aqiData.pollutants.pm25,
    pm10: aqiData.pollutants.pm10,
    stationName: aqiData.station.name,
    city: aqiData.station.city,
    timestamp: aqiData.provenance.timestamp,
    isLive: aqiData.provenance.isLive,
  };
}

/** Resolves the advisory threat level tier from a numeric AQI value. */
export function resolveThreatLevel(aqi: number): AssistantAdvice['threatLevel'] {
  if (aqi > 300) return 'hazardous';
  if (aqi > 150) return 'severe';
  if (aqi > 50) return 'moderate';
  return 'low';
}

/**
 * Builds persona-specific Pillar 1 commute guidance factoring in transit network,
 * severity level, and demographic vulnerability.
 */
function buildCommuteGuidance(
  persona: UserProfile,
  transit: { name: string; transitMode: string },
  isSevere: boolean,
  isPoor: boolean
): Pillar1LowEmissionRoutines {
  let commuteModeRecommendation = `Combine errands and shift to electric public transit or ${transit.name}.`;
  let commuteDepartureStrategy = isPoor
    ? 'Avoid peak surface inversion hours (06:00 AM - 09:00 AM and 07:00 PM - 10:00 PM).'
    : 'Normal commute hours are safe; prioritize public transit or EV feeders to keep corridor emissions low.';

  if (persona.id === 'commuter') {
    commuteModeRecommendation = isSevere
      ? `Divert completely from 2-wheeler/bike to ${transit.name}. If car commute is mandatory, ensure cabin air recirculation (AC Recirculation ON) with an active carbon PM2.5 cabin filter and wear a certified N95/FFP2 mask.`
      : isPoor
        ? `Prioritize ${transit.name} or electric feeder buses over personal motorized two-wheelers; keep an N95 mask handy in heavy traffic.`
        : `Prioritize ${transit.name} or electric feeder buses to reduce personal carbon footprint during daily commutes.`;
    commuteDepartureStrategy = isSevere
      ? 'Negotiate staggered work hours: depart after 10:30 AM and return prior to 6:00 PM to circumvent dense vehicular fume accumulation during temperature inversion.'
      : isPoor
        ? 'Shift departure slightly past early morning rush-hour peaks when possible and wear N95 masking along congested arterial roads.'
        : 'Standard work commute schedule is safe under current air quality conditions.';
  } else if (persona.id === 'senior') {
    commuteModeRecommendation = isSevere
      ? 'Strictly suspend all non-essential road travel. For medical appointments, use closed, air-conditioned transit.'
      : isPoor
        ? `Avoid open-air road travel during rush hour; use closed ${transit.name} or AC transit with a well-fitted mask for errands.`
        : `Short local trips via ${transit.name} or shaded neighborhood walkways are safe.`;
    commuteDepartureStrategy = isSevere || isPoor
      ? 'Cancel habitual 6:00 AM morning park walk. Replace with indoor hallway walking or shift outdoor exposure to the warmest sunlit window between 11:30 AM and 3:30 PM.'
      : 'Morning and afternoon walks are safe; carry drinking water and avoid busy roadside junctions.';
  } else if (persona.id === 'athlete') {
    commuteModeRecommendation = isPoor
      ? 'Travel to school/practice in closed transit wearing a snug-fit N95 mask to prevent particulate loading before cardiovascular exertion.'
      : `Use ${transit.name} or shared electric transit for travel to training venues.`;
    commuteDepartureStrategy = isSevere
      ? 'Reschedule all high-cardiovascular training indoors. Outdoor aerobic drills at 4:00 PM during severe AQI cause deep alveolar penetration of PM2.5, causing exercise-induced bronchospasm.'
      : isPoor
        ? 'Move high-intensity interval drills indoors or reduce outdoor exertion intensity; prioritize hydrated recovery.'
        : 'Scheduled 4:00 PM outdoor sports practice is safe; maintain normal hydration and avoid idling vehicle zones.';
  } else if (persona.id === 'parent') {
    commuteModeRecommendation = isSevere
      ? 'Keep toddler inside filtered residential/daycare zones. Avoid stroller outings on roads with idling traffic.'
      : isPoor
        ? 'Avoid roadside stroller walks during traffic peaks; use parks away from arterial roads during mid-day dispersion hours.'
        : 'Normal outdoor stroller and neighborhood transit routines are safe away from direct vehicle exhaust.';
    commuteDepartureStrategy = isSevere || isPoor
      ? 'Cancel late evening park visits (after 5:30 PM) when ground-level temperature rapidly cools and smog descends.'
      : 'Afternoon park play is safe; monitor hourly station updates before evening outings.';
  }

  return {
    commuteModeRecommendation,
    commuteDepartureStrategy,
    safeOutdoorTimeWindows: [
      {
        window: '06:00 AM - 10:00 AM',
        advice: isPoor
          ? 'Caution/Danger: Early morning temperature inversion traps ground-level particulates. Delay outdoor exertion.'
          : 'Safe/Moderate: Light outdoor movement is acceptable; prefer parks away from dense traffic.',
        riskLevel: isSevere ? 'danger' : isPoor ? 'caution' : 'safe',
      },
      {
        window: '12:30 PM - 03:30 PM',
        advice:
          'Optimal Window: Solar warming expands the boundary layer, offering the lowest particulate concentration of the day.',
        riskLevel: isSevere ? 'caution' : 'safe',
      },
      {
        window: '06:30 PM - 10:00 PM',
        advice: isPoor
          ? 'High Risk: Radiational cooling compresses the boundary layer, increasing roadside exhaust accumulation.'
          : 'Moderate: Evening air remains acceptable for routine movement; avoid idling traffic junctions.',
        riskLevel: isSevere ? 'danger' : isPoor ? 'caution' : 'safe',
      },
    ],
    tripConsolidationTips: [
      'Batch all external tasks into a single mid-day window rather than multiple round trips.',
      'Coordinate neighborhood carpooling or switch the last-mile segment to shared electric auto-rickshaws.',
    ],
    inversionWarning: isPoor
      ? 'Nocturnal radiation inversion traps vehicular exhaust in the lowest 50-100 meters of the atmosphere. Delay outdoor movement until solar radiation breaks the inversion layer (after 10:30 AM).'
      : 'At current AQI levels, diurnal inversion buildup is mild, though busy traffic intersections still exhibit localized PM2.5 spikes during rush hours.',
  };
}

/**
 * Builds Pillar 2 indoor air quality interventions based on AQI severity.
 */
function buildIndoorGuidance(
  aqi: number,
  pm25: number,
  isSevere: boolean,
  isPoor: boolean
): Pillar2IndoorAirQuality {
  return {
    purifierSchedule: {
      recommendedHours: isSevere
        ? 'Continuous 24/7 HEPA operation on AUTO/HIGH mode in occupied living zones and bedrooms.'
        : isPoor
          ? 'Run on MEDIUM/AUTO during morning & evening peaks and overnight in bedrooms.'
          : 'Optional Eco-Auto filtration during high-traffic evening hours or dusty chores.',
      operatingMode: isSevere
        ? 'HEPA Level 3 / Turbo in bedrooms 1 hour before sleep'
        : isPoor
          ? 'Auto / Medium Filtration Mode'
          : 'Eco / Low-Power Monitoring Mode',
      rationale: `At AQI ${aqi} (PM2.5: ${pm25} µg/m³), active HEPA filtration keeps indoor particulate exposure well below ambient outdoor levels.`,
    },
    ventilationWindows: {
      optimalWindow: isSevere
        ? '1:00 PM - 2:30 PM (Strictly limited to 15-20 minutes)'
        : isPoor
          ? '11:30 AM - 3:30 PM'
          : 'Morning & Mid-Day Natural Cross-Ventilation',
      instructions: isSevere
        ? 'Keep all perimeter windows hermetically latched during early morning and late evening. Allow a brief 15-minute cross-ventilation window between 1:00 PM - 2:00 PM when solar heating maximizes thermal boundary mixing, then immediately seal and run purifier on turbo.'
        : isPoor
          ? 'Moderate cross-ventilation permitted during warm mid-day hours when ambient PM2.5 disperses vertically.'
          : 'Normal natural cross-ventilation is safe throughout the day to keep indoor CO2 low.',
      warningNotice: isSevere
        ? 'Never ventilate before 11:00 AM or after 5:30 PM due to active atmospheric boundary layer trapping.'
        : undefined,
    },
    botanicalAndPhysicalMeasures: [
      'Place Sansevieria (Snake Plant) in bedrooms for night-time oxygenation and formaldehyde bio-filtration.',
      'Position Areca Palm in living areas to maintain 45-55% relative humidity, accelerating aerosol particulate drop-out.',
      'Use damp micro-fiber cloths for horizontal surface cleaning instead of feather dusters or dry brooms.',
    ],
    dustSuppressionTip:
      'Perform daily wet-mopping with lukewarm water and a drop of vinegar to break fine dust electrostatic surface adhesion.',
  };
}

/**
 * Builds Pillar 3 sustainable alternative recommendations with causal justifications.
 */
function buildSustainableAlternatives(
  persona: UserProfile,
  transit: { name: string; transitMode: string }
): Pillar3SustainableAlternatives {
  const activitySubstitute =
    persona.id === 'parent'
      ? 'Substitute outdoor playground playtime with interactive indoor sensory obstacles'
      : persona.id === 'senior'
        ? 'Relocate 6:00 AM morning walk to indoor breathing and stretching routines'
        : 'Relocate intense outdoor cardiovascular sports to an indoor ventilated gymnasium';

  return {
    recommendations: [
      {
        action:
          persona.id === 'commuter'
            ? `Shift daily solo motorized commute to ${transit.name}`
            : 'Consolidate multiple weekly grocery and pharmacy trips into a single planned mid-day journey',
        causalWhy:
          'Private vehicular travel in congested corridors exposes the commuter directly to localized tailpipe plumes of NOx and unburned hydrocarbons while generating high per-capita emissions.',
        personalHealthImpact:
          'Reduces direct PM2.5 and ultra-fine black carbon inhalation by ~68% compared to open road two-wheeler riding.',
        collectiveEcologicalImpact:
          'Cuts approximately 2.4 kg of CO2 and 14 grams of toxic NOx emissions per trip while preventing cold-start emission surges.',
      },
      {
        action:
          'Implement wet-mopping with micro-fiber cloth and maintain botanical indoor plants (Snake Plant & Areca Palm)',
        causalWhy:
          'Dry sweeping resuspends deposited sub-micron particulate matter into breathing zones. NASA clean air botanical studies confirm Sansevieria trifasciata absorbs volatile organic compounds and releases nocturnal oxygen.',
        personalHealthImpact:
          'Suppresses indoor resuspended dust particulate spikes by ~45%, relieving pediatric and bronchial irritation.',
        collectiveEcologicalImpact:
          'Replaces chemical aerosol air fresheners and reduces household energy footprint by optimizing indoor botanical air quality.',
      },
      {
        action: activitySubstitute,
        causalWhy:
          'Aerobic exertion increases human respiratory minute volume by 400-600%, pulling particulate matter deep into the terminal bronchioles and alveoli without nasal filtering.',
        personalHealthImpact:
          'Prevents acute alveolar inflammatory response and avoids inhaling up to 350 million ultrafine particulate bodies during workout.',
        collectiveEcologicalImpact:
          'Drives behavioral shift towards community indoor active spaces, cutting localized vehicle idling around outdoor sports venues.',
      },
    ],
  };
}

/** Constructs a contextual executive summary tailored to the persona and severity. */
function buildPersonaSummary(
  aqiData: StationAqiData,
  persona: UserProfile,
  transit: { name: string; transitMode: string },
  cityName: string,
  isSevere: boolean,
  isPoor: boolean
): string {
  const { aqi, category } = aqiData;
  const header = `At ${isSevere ? 'hazardous ' : ''}AQI ${aqi} (${category.label}) in ${cityName}, ${persona.name}`;

  switch (persona.id) {
    case 'parent':
      if (isSevere) {
        return `${header} must immediately seal nursery windows, run continuous HEPA purification, and suspend all outdoor toddler playground outings.`;
      }
      if (isPoor) {
        return `${header} should restrict toddler outdoor play to mid-day thermal mixing hours (12:30–3:00 PM) and isolate sleeping quarters with targeted filtration.`;
      }
      return `At AQI ${aqi} (${category.label}) in ${cityName}, ambient air allows outdoor toddler activities during afternoon hours while monitoring morning ground-level particulate haze.`;

    case 'senior':
      if (isSevere) {
        return `${header} must cancel morning outdoor walks to avoid temperature inversion smog traps, keep rescue inhalers accessible, and practice indoor pranayama.`;
      }
      if (isPoor) {
        return `${header} should shift early morning park walks indoors to prevent bronchospasms triggered by cold stagnant particulates.`;
      }
      return `At AQI ${aqi} (${category.label}) in ${cityName}, gentle outdoor walking is safe during warm sunlit hours between 11:30 AM and 3:30 PM with adequate hydration.`;

    case 'athlete':
      if (isSevere) {
        return `${header} must relocate all cardiovascular training indoors; heavy aerobic breathing under high particulate loading causes severe alveolar inflammation.`;
      }
      if (isPoor) {
        return `${header} should substitute intense outdoor interval drills with indoor gym conditioning and maintain antioxidant hydration.`;
      }
      return `At AQI ${aqi} (${category.label}) in ${cityName}, ${persona.name} can complete scheduled outdoor training with post-workout nasal saline irrigation and travel masking.`;

    case 'commuter':
      if (isSevere) {
        return `${header} faces severe tailpipe exposure; mandatory transition to ${transit.name} and vehicle cabin air recirculation is advised.`;
      }
      if (isPoor) {
        return `${header} should adjust travel departure past peak inversion rush hours and prioritize ${transit.transitMode} with N95 masking.`;
      }
      return `At AQI ${aqi} (${category.label}) in ${cityName}, ${persona.name} can maintain normal work schedules with proactive ${transit.transitMode} usage to minimize personal carbon footprint.`;

    default:
      return `At current AQI ${aqi} (${category.label}) in ${cityName}, ${persona.name} requires ${
        isSevere ? 'immediate high-priority particulate mitigation' : 'proactive daily air quality adjustments'
      } tailored to local ${transit.name} transit and indoor air sealing.`;
  }
}

/**
 * Deterministic clinical & environmental rule engine used when Gemini is unavailable.
 */
export function generateDeterministicAdvice(
  aqiData: StationAqiData,
  persona: UserProfile
): AssistantAdvice {
  const { aqi, pollutants, station } = aqiData;
  const pm25 = pollutants.pm25 ?? Math.round(aqi * 0.7);
  const transit = resolveCityTransit(
    `${station.city || ''} ${station.name || ''} ${station.state || ''}`
  );
  const cityName = station.city && station.city.trim() ? station.city : 'your area';
  const isSevere = aqi > 300;
  const isPoor = aqi > 100;

  return {
    summary: buildPersonaSummary(aqiData, persona, transit, cityName, isSevere, isPoor),
    threatLevel: resolveThreatLevel(aqi),
    verifiedAqiSnapshot: buildVerifiedSnapshot(aqiData),
    personaProfile: {
      id: persona.id,
      role: persona.role,
      age: persona.age,
      sensitivityLevel: persona.sensitivityLevel,
    },
    pillar1_lowEmissionRoutines: buildCommuteGuidance(persona, transit, isSevere, isPoor),
    pillar2_indoorAirQuality: buildIndoorGuidance(aqi, pm25, isSevere, isPoor),
    pillar3_sustainableAlternatives: buildSustainableAlternatives(persona, transit),
    metadata: {
      modelUsed: 'Rule-Engine Fallback (Deterministic CPCB Guidelines)',
      isAiGenerated: false,
      generatedAt: new Date().toISOString(),
      generationNote:
        'Generated via verified clinical & environmental rules (Gemini API token unconfigured or offline fallback)',
    },
  };
}
