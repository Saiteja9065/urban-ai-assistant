import { GoogleGenerativeAI } from '@google/generative-ai';
import { StationAqiData } from '@/types/aqi';
import { UserProfile } from '@/types/persona';
import { AssistantAdvice } from '@/types/assistant';
import { resolveCityTransit } from './transit-resolver';
import { buildVerifiedSnapshot, generateDeterministicAdvice } from './deterministic-advice';
import {
  buildGeminiUserPrompt,
  GEMINI_SYSTEM_INSTRUCTION,
  isValidGeminiPayload,
  normalizeThreatLevel,
  stripJsonCodeFences,
} from './gemini-validation';

export { resolveCityTransit, generateDeterministicAdvice };

const GEMINI_TIMEOUT_MS = 12000;

/**
 * Generates contextual smog guidance via Google Gemini 2.0 Flash with strict JSON schema
 * validation and automatic fallback to deterministic clinical & environmental rules.
 */
export async function getAssistantAdvice(
  aqiData: StationAqiData,
  persona: UserProfile,
  apiKey?: string
): Promise<AssistantAdvice> {
  const key = (apiKey ?? process.env.GEMINI_API_KEY)?.trim();
  if (!key || key === 'your_gemini_api_key_here') {
    return generateDeterministicAdvice(aqiData, persona);
  }

  const transit = resolveCityTransit(
    `${aqiData.station.city || ''} ${aqiData.station.name || ''} ${aqiData.station.state || ''}`
  );
  const activeCity =
    aqiData.station.city && aqiData.station.city.trim()
      ? aqiData.station.city
      : 'Indian Metropolitan City';

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
    systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
  });

  const userPrompt = buildGeminiUserPrompt(aqiData, persona, activeCity, transit.name);
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms`));
      }, GEMINI_TIMEOUT_MS);
    });

    const result = await Promise.race([
      model.generateContent(userPrompt, { signal: controller.signal }),
      timeoutPromise,
    ]);

    const parsed: unknown = JSON.parse(stripJsonCodeFences(result.response.text()));
    if (!isValidGeminiPayload(parsed)) {
      throw new Error('Gemini response failed structured schema validation');
    }

    return {
      summary: parsed.summary,
      threatLevel: normalizeThreatLevel(parsed.threatLevel, aqiData.aqi),
      verifiedAqiSnapshot: buildVerifiedSnapshot(aqiData),
      personaProfile: {
        id: persona.id,
        role: persona.role,
        age: persona.age,
        sensitivityLevel: persona.sensitivityLevel,
      },
      pillar1_lowEmissionRoutines: {
        ...parsed.pillar1_lowEmissionRoutines,
        tripConsolidationTips: Array.isArray(parsed.pillar1_lowEmissionRoutines.tripConsolidationTips)
          ? parsed.pillar1_lowEmissionRoutines.tripConsolidationTips
          : [],
      },
      pillar2_indoorAirQuality: parsed.pillar2_indoorAirQuality,
      pillar3_sustainableAlternatives: parsed.pillar3_sustainableAlternatives,
      metadata: {
        modelUsed: 'gemini-2.0-flash',
        isAiGenerated: true,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : 'Gemini API call failed';
    const fallback = generateDeterministicAdvice(aqiData, persona);
    fallback.metadata.generationNote = `Fallback used due to: ${rawMsg.split(key).join('[REDACTED]')}`;
    return fallback;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
