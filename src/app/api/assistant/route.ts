import { NextRequest, NextResponse } from 'next/server';
import { getLiveAqi } from '@/lib/waqi-service';
import { getAssistantAdvice } from '@/lib/gemini-service';
import { EVALUATOR_PERSONA_PRESETS, DEFAULT_CUSTOM_PERSONA } from '@/lib/persona-constants';
import { PersonaPresetId, UserProfile } from '@/types/persona';
import { AssistantApiResponse } from '@/types/assistant';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse<AssistantApiResponse>> {
  try {
    const body = await request.json().catch(() => ({}));
    const { stationQuery, personaId, customPersona, aqiData: providedAqiData } = body;

    // 1. Resolve Persona
    let resolvedPersona: UserProfile = EVALUATOR_PERSONA_PRESETS.commuter;

    if (personaId && personaId !== 'custom' && EVALUATOR_PERSONA_PRESETS[personaId as Exclude<PersonaPresetId, 'custom'>]) {
      resolvedPersona = EVALUATOR_PERSONA_PRESETS[personaId as Exclude<PersonaPresetId, 'custom'>];
    } else if (personaId === 'custom' || customPersona) {
      resolvedPersona = {
        ...DEFAULT_CUSTOM_PERSONA,
        ...(customPersona || {}),
        id: 'custom',
      };
    }

    // 2. Resolve Verified AQI Data (Strict Data Boundary)
    const resolvedAqiData = providedAqiData || (await getLiveAqi(stationQuery || 'delhi-anand-vihar'));

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
    const message = error instanceof Error ? error.message : 'Failed to generate assistant guidance';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
