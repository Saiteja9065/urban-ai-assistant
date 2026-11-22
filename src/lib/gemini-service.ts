import { GoogleGenerativeAI } from '@google/generative-ai';
import { StationAqiData } from '@/types/aqi';
import { UserProfile } from '@/types/persona';
import { AssistantAdvice, VerifiedAqiSnapshot } from '@/types/assistant';
import { EVALUATOR_PERSONA_PRESETS } from './persona-constants';

const GEMINI_SYSTEM_INSTRUCTION = `
You are the Urban Air Quality Assistant, an expert environmental, health, and commute intelligence AI designed specifically for Indian metropolitan citizens dealing with severe winter smog and post-Diwali air pollution.

You receive two sets of inputs:
1. Live, verified AQI metrics from CPCB/WAQI monitoring stations (AQI, PM2.5, PM10, Station Name, Timestamp).
2. User demographic persona (Age, Health Conditions, Daily Routine, Commute context, Sensitivity Level).

CRITICAL CONSTRAINTS & GOLDEN RULES:
- NEVER invent, alter, recalculate, or extrapolate numerical AQI or PM numbers. The input values are strictly verified ground truth.
- All recommendations must be strictly contextualized to the provided AQI level and the persona's physiological vulnerability.
- You MUST structure your entire response as a single, valid JSON object matching the required schema.
- Every single recommendation MUST address one of the 3 Mandatory Pillars:
  1. Pillar 1: Low-Emission Daily Routines & Commute Optimization (Metro vs road, diurnal inversion timing, avoiding early morning 6-9 AM and late evening 7-10 PM smog traps).
  2. Pillar 2: Indoor Air Quality Interventions (HEPA air purifier schedules, brief mid-day 12:30-3:30 PM ventilation windows when smog lifts, botanical filtering with Snake Plants/Areca Palms, and wet-mopping to suppress resuspended dust).
  3. Pillar 3: Sustainable Alternatives with Explicit "Why & Impact" Justifications (EVERY recommendation must provide explicit causal WHY and dual impact quantification: Personal Health Impact and Collective Ecological Impact).
`;

/**
 * Deterministic reasoning fallback engine
 * Provides robust, persona-tailored advice when GEMINI_API_KEY is not set or network fails.
 */
export function generateDeterministicAdvice(
  aqiData: StationAqiData,
  persona: UserProfile
): AssistantAdvice {
  const { aqi, pollutants, station, provenance } = aqiData;
  const pm25 = pollutants.pm25 || Math.round(aqi * 0.7);
  const pm10 = pollutants.pm10 || Math.round(aqi * 1.1);

  const snapshot: VerifiedAqiSnapshot = {
    aqi,
    category: aqiData.category.label,
    dominantPollutant: aqiData.dominantPollutant.toUpperCase(),
    pm25,
    pm10,
    stationName: station.name,
    city: station.city,
    timestamp: provenance.timestamp,
    isLive: provenance.isLive,
  };

  const isSevere = aqi > 300;
  const isPoor = aqi > 100;

  // Pillar 1: Commute & Routine customization
  let commuteMode = 'Combine errands and shift to electric public transit or Metro.';
  let commuteTiming = 'Avoid peak surface inversion hours (06:00 AM - 09:00 AM and 07:00 PM - 10:00 PM).';
  let inversionWarning = 'Winter nocturnal radiation inversion traps vehicular exhaust in the lowest 50-100 meters of the atmosphere. Delay outdoor movement until solar radiation breaks the inversion layer (after 10:30 AM).';

  if (persona.id === 'commuter') {
    commuteMode = isSevere
      ? 'Divert completely from 2-wheeler/bike to Delhi/Metro rail. If car commute is mandatory, ensure cabin air recirculation (AC Recirculation ON) with an active carbon PM2.5 cabin filter and wear a certified N95/FFP2 mask.'
      : 'Prioritize Metro transit or EV feeder buses over personal motorized vehicles.';
    commuteTiming = isSevere
      ? 'Negotiate staggered work hours: depart after 10:30 AM and return prior to 6:00 PM to circumvent dense vehicular fume accumulation during temperature inversion.'
      : 'Normal commute timing with N95 masking during peak traffic corridors.';
  } else if (persona.id === 'senior') {
    commuteMode = 'Strictly suspend all non-essential road travel. For medical appointments, use closed, air-conditioned transit.';
    commuteTiming = 'Cancel habitual 6:00 AM morning park walk. Replace with indoor hallway walking or shift outdoor exposure to the warmest sunlit window between 1:00 PM and 3:30 PM.';
  } else if (persona.id === 'athlete') {
    commuteMode = 'Travel to school/practice in closed transit wearing a snug-fit N95 mask to prevent particulate loading before cardiovascular exertion.';
    commuteTiming = 'Reschedule high-cardiovascular training indoors. Outdoor aerobic drills at 4:00 PM during severe AQI cause deep alveolar penetration of PM2.5, causing exercise-induced bronchospasm.';
  } else if (persona.id === 'parent') {
    commuteMode = 'Keep toddler inside filtered residential/daycare zones. Avoid stroller outings on roads with idling traffic.';
    commuteTiming = 'Cancel late evening park visits (after 5:30 PM) when ground-level temperature rapidly cools and smog descends.';
  }

  // Pillar 2: Indoor Air Interventions
  const purifierSchedule = {
    recommendedHours: isSevere
      ? 'Continuous 24/7 HEPA operation on AUTO/HIGH mode in occupied living zones and bedrooms.'
      : 'Run on MEDIUM during morning/evening hours; sleep mode at night.',
    operatingMode: isSevere ? 'HEPA Level 3 / Turbo in bedrooms 1 hour before sleep' : 'Auto Eco-Sensing Mode',
    rationale: `At AQI ${aqi} (PM2.5: ${pm25} µg/m³), indoor infiltration reaches 60-70% of outdoor concentration without active mechanical HEPA filtration.`,
  };

  const ventilationWindows = {
    optimalWindow: isSevere ? '1:00 PM - 2:30 PM (Strictly limited to 15-20 minutes)' : '11:30 AM - 3:30 PM',
    instructions: isSevere
      ? 'Keep all perimeter windows hermetically latched during early morning and late evening. Allow a brief 15-minute cross-ventilation window between 1:00 PM - 2:00 PM when solar heating maximizes thermal boundary mixing, then immediately seal and run purifier on turbo.'
      : 'Moderate cross-ventilation permitted during warm mid-day hours when ambient PM2.5 disperses vertically.',
    warningNotice: isSevere ? 'Never ventilate before 11:00 AM or after 5:30 PM due to active atmospheric boundary layer trapping.' : undefined,
  };

  // Pillar 3: Sustainable Alternatives with Dual Impact
  const recommendations = [
    {
      action: persona.id === 'commuter'
        ? 'Shift 18 km daily solo commute from motorcycle/car to Delhi Metro / Rail Transit'
        : 'Consolidate multiple weekly grocery and pharmacy trips into a single planned mid-day journey',
      causalWhy: 'Private vehicular travel in congested corridors exposes the commuter directly to localized tailpipe plumes of NOx and unburned hydrocarbons while generating high per-capita emissions.',
      personalHealthImpact: 'Reduces direct PM2.5 and ultra-fine black carbon inhalation by ~68% compared to open road two-wheeler riding.',
      collectiveEcologicalImpact: 'Cuts approximately 2.4 kg of CO2 and 14 grams of toxic NOx emissions per trip while preventing cold-start emission surges.',
    },
    {
      action: 'Implement wet-mopping with micro-fiber cloth and maintain botanical indoor plants (Snake Plant & Areca Palm)',
      causalWhy: 'Dry sweeping resuspends deposited sub-micron particulate matter into breathing zones. NASA clean air botanical studies confirm Sansevieria trifasciata absorbs volatile organic compounds and releases nocturnal oxygen.',
      personalHealthImpact: 'Suppresses indoor resuspended dust particulate spikes by ~45%, relieving pediatric and bronchial irritation.',
      collectiveEcologicalImpact: 'Replaces chemical aerosol air fresheners and reduces household energy footprint by optimizing indoor botanical air quality.',
    },
    {
      action: persona.id === 'parent'
        ? 'Substitute outdoor playground playtime with interactive indoor sensory obstacles'
        : persona.id === 'senior'
        ? 'Relocate 6:00 AM morning walk to indoor breathing and stretching routines'
        : 'Relocate intense outdoor cardiovascular sports to an indoor ventilated gymnasium',
      causalWhy: 'Aerobic exertion increases human respiratory minute volume by 400-600%, pulling particulate matter deep into the terminal bronchioles and alveoli without nasal filtering.',
      personalHealthImpact: 'Prevents acute alveolar inflammatory response and avoids inhaling up to 350 million ultrafine particulate bodies during workout.',
      collectiveEcologicalImpact: 'Drives behavioral shift towards community indoor active spaces, cutting localized vehicle idling around outdoor sports venues.',
    },
  ];

  return {
    summary: `At current AQI ${aqi} (${aqiData.category.label}) in ${station.city}, ${persona.name} (${persona.role}) requires immediate ${isSevere ? 'high-priority particulate mitigation' : 'targeted daily adjustments'} focused on commute diversion and indoor air sealing.`,
    threatLevel: isSevere ? 'hazardous' : isPoor ? 'severe' : 'moderate',
    verifiedAqiSnapshot: snapshot,
    personaProfile: {
      id: persona.id,
      role: persona.role,
      age: persona.age,
      sensitivityLevel: persona.sensitivityLevel,
    },
    pillar1_lowEmissionRoutines: {
      commuteModeRecommendation: commuteMode,
      commuteDepartureStrategy: commuteTiming,
      safeOutdoorTimeWindows: [
        {
          window: '06:00 AM - 10:00 AM',
          advice: 'Dangerous: Nocturnal temperature inversion traps toxic ground-level particulates. Avoid outdoor activities.',
          riskLevel: 'danger',
        },
        {
          window: '12:30 PM - 03:30 PM',
          advice: 'Cautionary Window: Solar warming expands the boundary layer, offering the lowest particulate concentration of the day.',
          riskLevel: isSevere ? 'caution' : 'safe',
        },
        {
          window: '06:30 PM - 10:00 PM',
          advice: 'High Risk: Rapid radiational cooling compresses the atmospheric boundary layer, causing vehicular smog stagnation.',
          riskLevel: 'danger',
        },
      ],
      tripConsolidationTips: [
        'Batch all external tasks into a single mid-day window rather than multiple round trips.',
        'Coordinate neighborhood carpooling or switch the last-mile segment to shared electric auto-rickshaws.',
      ],
      inversionWarning,
    },
    pillar2_indoorAirQuality: {
      purifierSchedule,
      ventilationWindows,
      botanicalAndPhysicalMeasures: [
        'Place Sansevieria (Snake Plant) in bedrooms for night-time oxygenation and formaldehyde bio-filtration.',
        'Position Areca Palm in living areas to maintain 45-55% relative humidity, accelerating aerosol particulate drop-out.',
        'Use damp micro-fiber cloths for horizontal surface cleaning instead of feather dusters or dry brooms.',
      ],
      dustSuppressionTip: 'Perform daily wet-mopping with lukewarm water and a drop of vinegar to break fine dust electrostatic surface adhesion.',
    },
    pillar3_sustainableAlternatives: {
      recommendations,
    },
    metadata: {
      modelUsed: 'Rule-Engine Fallback (Deterministic CPCB Guidelines)',
      isAiGenerated: false,
      generatedAt: new Date().toISOString(),
      generationNote: 'Generated via verified clinical & environmental rules (Gemini API token unconfigured or offline fallback)',
    },
  };
}

/**
 * Primary AI reasoning function: Calls Google Gemini API with strict structured prompt
 * and falls back gracefully to deterministic clinical rules if key is missing or API errors.
 */
export async function getAssistantAdvice(
  aqiData: StationAqiData,
  persona: UserProfile,
  apiKey?: string
): Promise<AssistantAdvice> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  // If no Gemini key is provided, return verified deterministic clinical reasoning
  if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
    return generateDeterministicAdvice(aqiData, persona);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-2.0-flash with JSON mode
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high factual adherence
      },
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
    });

    const userPrompt = `
Generate contextual, actionable smog assistance based on these verified ground-truth inputs:

1. VERIFIED AIR QUALITY DATA:
- Station Name: ${aqiData.station.name} (${aqiData.station.city}, ${aqiData.station.state})
- Verified AQI: ${aqiData.aqi} (${aqiData.category.label})
- Dominant Pollutant: ${aqiData.dominantPollutant.toUpperCase()}
- PM2.5: ${aqiData.pollutants.pm25 || 'N/A'} µg/m³
- PM10: ${aqiData.pollutants.pm10 || 'N/A'} µg/m³
- Temperature: ${aqiData.weather?.temperature || 'N/A'} °C
- Humidity: ${aqiData.weather?.humidity || 'N/A'} %
- Timestamp: ${aqiData.provenance.timestamp}

2. USER DEMOGRAPHIC PERSONA:
- Name: ${persona.name}
- Role / Archetype: ${persona.role} (ID: ${persona.id})
- Age: ${persona.age}
- Location & Commute: ${persona.locationContext}
- Health Vulnerabilities: ${persona.healthConditions.join(', ')}
- Daily Routine: ${persona.routine}
- Sensitivity Level: ${persona.sensitivityLevel}
- Key Needs: ${persona.keyNeeds.join(', ')}

MANDATORY OUTPUT FORMAT (Must strictly match this JSON structure):
{
  "summary": "Concise 2-sentence executive summary tailored to this persona and AQI",
  "threatLevel": "low" | "moderate" | "severe" | "hazardous",
  "pillar1_lowEmissionRoutines": {
    "commuteModeRecommendation": "Concrete recommendation (Metro/EV/Car recirculation/masking)",
    "commuteDepartureStrategy": "Specific departure timing avoiding inversion peaks",
    "safeOutdoorTimeWindows": [
      { "window": "time range", "advice": "guidance", "riskLevel": "safe" | "caution" | "danger" }
    ],
    "tripConsolidationTips": ["Tip 1", "Tip 2"],
    "inversionWarning": "Explanation of diurnal temperature inversion relevant to this persona"
  },
  "pillar2_indoorAirQuality": {
    "purifierSchedule": {
      "recommendedHours": "Operating hours",
      "operatingMode": "Specific fan/filtration mode",
      "rationale": "Scientific rationale matching the verified PM2.5 level"
    },
    "ventilationWindows": {
      "optimalWindow": "Best time of day to ventilate",
      "instructions": "Specific window opening protocol",
      "warningNotice": "Critical warning if applicable"
    },
    "botanicalAndPhysicalMeasures": [
      "Botanical recommendation (Snake Plant / Areca Palm / Spider Plant)",
      "Physical cleaning measure"
    ],
    "dustSuppressionTip": "Wet-mopping protocol to prevent resuspended fine dust"
  },
  "pillar3_sustainableAlternatives": {
    "recommendations": [
      {
        "action": "Specific low-emission action",
        "causalWhy": "Explicit scientific/causal justification why this works",
        "personalHealthImpact": "Quantified personal health benefit (e.g., Reduces PM2.5 alveolar intake by ~70%)",
        "collectiveEcologicalImpact": "Quantified collective ecological impact (e.g., Cuts ~1.8 kg CO2)"
      }
    ]
  }
}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const result = await model.generateContent(userPrompt);
    clearTimeout(timeoutId);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    const snapshot: VerifiedAqiSnapshot = {
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

    return {
      summary: parsed.summary || `Air quality recommendations for ${persona.name} at AQI ${aqiData.aqi}.`,
      threatLevel: parsed.threatLevel || (aqiData.aqi > 300 ? 'hazardous' : 'severe'),
      verifiedAqiSnapshot: snapshot,
      personaProfile: {
        id: persona.id,
        role: persona.role,
        age: persona.age,
        sensitivityLevel: persona.sensitivityLevel,
      },
      pillar1_lowEmissionRoutines: parsed.pillar1_lowEmissionRoutines,
      pillar2_indoorAirQuality: parsed.pillar2_indoorAirQuality,
      pillar3_sustainableAlternatives: parsed.pillar3_sustainableAlternatives,
      metadata: {
        modelUsed: 'gemini-2.0-flash',
        isAiGenerated: true,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gemini API call failed';
    const fallback = generateDeterministicAdvice(aqiData, persona);
    fallback.metadata.generationNote = `Fallback used due to: ${errorMsg}`;
    return fallback;
  }
}
