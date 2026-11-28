import { NextRequest, NextResponse } from 'next/server';
import { getLiveAqi } from '@/lib/waqi-service';
import { getAssistantAdvice } from '@/lib/gemini-service';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import {
  isValidStationAqiData,
  sanitizeCustomPersona,
  VALID_PRESET_IDS,
} from '@/lib/request-validation';
import { PersonaPresetId, UserProfile } from '@/types/persona';
import { AssistantApiResponse } from '@/types/assistant';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse<AssistantApiResponse>> {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const { stationQuery, personaId, customPersona, aqiData: providedAqiData } = body as Record<
      string,
      unknown
    >;

    if (providedAqiData !== undefined && !isValidStationAqiData(providedAqiData)) {
      return NextResponse.json(
        { success: false, error: 'Invalid AQI snapshot payload.' },
        { status: 400 }
      );
    }

    if (
      customPersona !== undefined &&
      (typeof customPersona !== 'object' || customPersona === null || Array.isArray(customPersona))
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid custom persona payload.' },
        { status: 400 }
      );
    }

    let resolvedPersona: UserProfile = EVALUATOR_PERSONA_PRESETS.commuter;
    if (
      typeof personaId === 'string' &&
      VALID_PRESET_IDS.has(personaId as Exclude<PersonaPresetId, 'custom'>)
    ) {
      resolvedPersona = EVALUATOR_PERSONA_PRESETS[personaId as Exclude<PersonaPresetId, 'custom'>];
    } else if (personaId === 'custom' || customPersona !== undefined) {
      resolvedPersona = sanitizeCustomPersona(customPersona);
    }

    const safeStationQuery =
      typeof stationQuery === 'string' && stationQuery.trim().length > 0
        ? stationQuery.trim().slice(0, 120)
        : 'delhi-anand-vihar';
    const resolvedAqiData = providedAqiData ?? (await getLiveAqi(safeStationQuery));
    const advice = await getAssistantAdvice(resolvedAqiData, resolvedPersona);

    return NextResponse.json(
      { success: true, data: advice },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('[POST /api/assistant] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate assistant guidance' },
      { status: 500 }
    );
  }
}
