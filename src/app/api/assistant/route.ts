import { NextRequest, NextResponse } from 'next/server';
import { getLiveAqi } from '@/lib/waqi-service';
import { getAssistantAdvice } from '@/lib/gemini-service';
import { EVALUATOR_PERSONA_PRESETS, DEFAULT_CUSTOM_PERSONA } from '@/lib/persona-constants';
import { PersonaPresetId, SensitivityLevel, UserProfile } from '@/types/persona';
import { StationAqiData } from '@/types/aqi';
import { AssistantApiResponse } from '@/types/assistant';

export const dynamic = 'force-dynamic';

const MAX_TEXT_LENGTH = 240;
const VALID_SENSITIVITY_LEVELS = new Set<SensitivityLevel>(['low', 'moderate', 'high', 'critical']);
const VALID_PRESET_IDS = new Set<Exclude<PersonaPresetId, 'custom'>>(['commuter', 'parent', 'senior', 'athlete']);

function sanitizeString(value: unknown, fallback: string, maxLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[\r\n\t]+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned.slice(0, maxLength) : fallback;
}

function sanitizeStringArray(value: unknown, fallback: string[], maxItems = 6): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 120))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
  return cleaned.length > 0 ? cleaned : fallback;
}

function sanitizeCustomPersona(raw: unknown): UserProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_CUSTOM_PERSONA };
  }
  const input = raw as Record<string, unknown>;
  const rawAge = typeof input.age === 'number' ? input.age : Number(input.age);
  const age = Number.isFinite(rawAge) ? Math.min(120, Math.max(1, Math.round(rawAge))) : DEFAULT_CUSTOM_PERSONA.age;

  const sensitivityLevel =
    typeof input.sensitivityLevel === 'string' && VALID_SENSITIVITY_LEVELS.has(input.sensitivityLevel as SensitivityLevel)
      ? (input.sensitivityLevel as SensitivityLevel)
      : DEFAULT_CUSTOM_PERSONA.sensitivityLevel;

  return {
    id: 'custom',
    name: sanitizeString(input.name, DEFAULT_CUSTOM_PERSONA.name, 100),
    role: sanitizeString(input.role, DEFAULT_CUSTOM_PERSONA.role, 100),
    age,
    locationContext: sanitizeString(input.locationContext, DEFAULT_CUSTOM_PERSONA.locationContext, 150),
    healthConditions: sanitizeStringArray(input.healthConditions, DEFAULT_CUSTOM_PERSONA.healthConditions),
    routine: sanitizeString(input.routine, DEFAULT_CUSTOM_PERSONA.routine, 300),
    sensitivityLevel,
    primaryConcerns: sanitizeStringArray(input.primaryConcerns, DEFAULT_CUSTOM_PERSONA.primaryConcerns),
    keyNeeds: sanitizeStringArray(input.keyNeeds, DEFAULT_CUSTOM_PERSONA.keyNeeds),
    description: sanitizeString(input.description, DEFAULT_CUSTOM_PERSONA.description, 240),
  };
}

function isValidStationAqiData(value: unknown): value is StationAqiData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  const station = data.station as Record<string, unknown> | undefined;
  const category = data.category as Record<string, unknown> | undefined;
  const provenance = data.provenance as Record<string, unknown> | undefined;

  if (typeof data.aqi !== 'number' || !Number.isFinite(data.aqi) || data.aqi < 0 || data.aqi > 999) {
    return false;
  }
  if (!station || typeof station.name !== 'string' || typeof station.city !== 'string') {
    return false;
  }
  if (!category || typeof category.label !== 'string') {
    return false;
  }
  if (!provenance || typeof provenance.timestamp !== 'string' || typeof provenance.isLive !== 'boolean') {
    return false;
  }
  if (typeof data.dominantPollutant !== 'string' || !data.pollutants || typeof data.pollutants !== 'object') {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<AssistantApiResponse>> {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request payload.',
        },
        { status: 400 }
      );
    }

    const { stationQuery, personaId, customPersona, aqiData: providedAqiData } = body as Record<string, unknown>;

    if (providedAqiData !== undefined && !isValidStationAqiData(providedAqiData)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid AQI snapshot payload.',
        },
        { status: 400 }
      );
    }

    if (customPersona !== undefined && (typeof customPersona !== 'object' || customPersona === null || Array.isArray(customPersona))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid custom persona payload.',
        },
        { status: 400 }
      );
    }

    // 1. Resolve Persona safely
    let resolvedPersona: UserProfile = EVALUATOR_PERSONA_PRESETS.commuter;
    if (typeof personaId === 'string' && VALID_PRESET_IDS.has(personaId as Exclude<PersonaPresetId, 'custom'>)) {
      resolvedPersona = EVALUATOR_PERSONA_PRESETS[personaId as Exclude<PersonaPresetId, 'custom'>];
    } else if (personaId === 'custom' || customPersona !== undefined) {
      resolvedPersona = sanitizeCustomPersona(customPersona);
    }

    // 2. Resolve Verified AQI Data (Strict Data Boundary)
    const safeStationQuery =
      typeof stationQuery === 'string' && stationQuery.trim().length > 0
        ? stationQuery.trim().slice(0, 120)
        : 'delhi-anand-vihar';
    const resolvedAqiData = providedAqiData ?? (await getLiveAqi(safeStationQuery));

    // 3. Generate AI Intelligence with Strict JSON & Guardrails
    const advice = await getAssistantAdvice(resolvedAqiData, resolvedPersona);

    return NextResponse.json(
      {
        success: true,
        data: advice,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[POST /api/assistant] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate assistant guidance',
      },
      { status: 500 }
    );
  }
}
