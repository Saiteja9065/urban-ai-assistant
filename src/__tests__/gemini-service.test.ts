import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateDeterministicAdvice,
  getAssistantAdvice,
  resolveCityTransit,
} from '@/lib/gemini-service';
import { EVALUATOR_PERSONA_PRESETS, DEFAULT_CUSTOM_PERSONA } from '@/lib/persona-constants';
import { BENCHMARK_STATION_FALLBACKS, DEFAULT_STATION_DATA } from '@/lib/aqi-constants';

const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerateContent,
    }),
  })),
}));

describe('Gemini Reasoning Service (Milestone 3)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('City Transit Resolution', () => {
    it('resolves distinct regional metro/transit networks per city', () => {
      expect(resolveCityTransit('Hyderabad').name).toContain('Hyderabad Metro');
      expect(resolveCityTransit('Mumbai').name).toContain('Mumbai Metro');
      expect(resolveCityTransit('Bengaluru').name).toContain('Namma Metro');
      expect(resolveCityTransit('Delhi').name).toContain('Delhi Metro');
      expect(resolveCityTransit('Kochi').name).toContain('Kochi Metro');
    });
  });

  describe('Deterministic Advice Generator (Strict Data Boundary & 3 Pillars)', () => {
    it('generates complete advice covering all 3 pillars for Daily Commuter', () => {
      const persona = EVALUATOR_PERSONA_PRESETS.commuter;
      const advice = generateDeterministicAdvice(DEFAULT_STATION_DATA, persona);

      expect(advice.verifiedAqiSnapshot.aqi).toBe(DEFAULT_STATION_DATA.aqi);
      expect(advice.verifiedAqiSnapshot.stationName).toBe(DEFAULT_STATION_DATA.station.name);
      expect(advice.personaProfile.id).toBe('commuter');

      expect(advice.pillar1_lowEmissionRoutines.commuteModeRecommendation).toBeDefined();
      expect(advice.pillar1_lowEmissionRoutines.safeOutdoorTimeWindows.length).toBeGreaterThan(0);
      expect(advice.pillar1_lowEmissionRoutines.inversionWarning).toContain('inversion');

      expect(advice.pillar2_indoorAirQuality.purifierSchedule).toBeDefined();
      expect(advice.pillar2_indoorAirQuality.ventilationWindows).toBeDefined();
      expect(advice.pillar2_indoorAirQuality.botanicalAndPhysicalMeasures.length).toBeGreaterThan(0);
      expect(advice.pillar2_indoorAirQuality.dustSuppressionTip).toContain('wet-mopping');

      expect(advice.pillar3_sustainableAlternatives.recommendations.length).toBeGreaterThanOrEqual(3);
      for (const rec of advice.pillar3_sustainableAlternatives.recommendations) {
        expect(rec.action).toBeDefined();
        expect(rec.causalWhy).toBeDefined();
        expect(rec.personalHealthImpact).toBeDefined();
        expect(rec.collectiveEcologicalImpact).toBeDefined();
      }
    });

    it('tailors specific advice for Parent, Senior, Athlete, and Custom personas', () => {
      const parentAdvice = generateDeterministicAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.parent);
      expect(parentAdvice.personaProfile.id).toBe('parent');
      expect(parentAdvice.threatLevel).toBe('hazardous');
      expect(JSON.stringify(parentAdvice).toLowerCase()).toContain('toddler');

      const seniorAdvice = generateDeterministicAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.senior);
      expect(seniorAdvice.personaProfile.id).toBe('senior');
      expect(JSON.stringify(seniorAdvice).toLowerCase()).toContain('morning');

      const athleteAdvice = generateDeterministicAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.athlete);
      expect(athleteAdvice.personaProfile.id).toBe('athlete');
      expect(JSON.stringify(athleteAdvice).toLowerCase()).toContain('sports');

      const bengaluruAdvice = generateDeterministicAdvice(
        BENCHMARK_STATION_FALLBACKS['bengaluru-btm'],
        DEFAULT_CUSTOM_PERSONA
      );
      expect(bengaluruAdvice.threatLevel).toBe('moderate');
      expect(bengaluruAdvice.summary).toContain('Namma Metro');
    });
  });

  describe('getAssistantAdvice Function', () => {
    const originalEnv = process.env.GEMINI_API_KEY;

    afterEach(() => {
      process.env.GEMINI_API_KEY = originalEnv;
    });

    it('gracefully uses deterministic fallback when GEMINI_API_KEY is not configured', async () => {
      delete process.env.GEMINI_API_KEY;
      const advice = await getAssistantAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.commuter);

      expect(advice.metadata.isAiGenerated).toBe(false);
      expect(advice.metadata.modelUsed).toContain('Rule-Engine Fallback');
      expect(advice.pillar1_lowEmissionRoutines).toBeDefined();
    });

    it('parses valid structured JSON from Gemini when API key is configured', async () => {
      const validGeminiJson = {
        summary: 'Take Mumbai Metro today to limit PM2.5 exposure.',
        threatLevel: 'severe',
        pillar1_lowEmissionRoutines: {
          commuteModeRecommendation: 'Use Mumbai Metro Line 3',
          commuteDepartureStrategy: 'Depart at 10:30 AM',
          safeOutdoorTimeWindows: [{ window: '1:00 PM - 2:30 PM', advice: 'Brief errand window', riskLevel: 'caution' }],
          tripConsolidationTips: ['Combine pharmacy and grocery errands'],
          inversionWarning: 'Morning boundary layer traps vehicular exhaust.',
        },
        pillar2_indoorAirQuality: {
          purifierSchedule: {
            recommendedHours: '18 hours daily',
            operatingMode: 'Auto HEPA',
            rationale: 'Maintains indoor PM2.5 below 35 µg/m³.',
          },
          ventilationWindows: {
            optimalWindow: '1:00 PM - 1:20 PM',
            instructions: 'Open cross-ventilation windows briefly.',
          },
          botanicalAndPhysicalMeasures: ['Snake plant in bedroom'],
          dustSuppressionTip: 'Wet mop floors every morning.',
        },
        pillar3_sustainableAlternatives: {
          recommendations: [
            {
              action: 'Shift to Mumbai Metro',
              causalWhy: 'Eliminates direct tailpipe inhalation.',
              personalHealthImpact: 'Cuts PM2.5 intake by 65%.',
              collectiveEcologicalImpact: 'Saves 2.1 kg CO2 per trip.',
            },
          ],
        },
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(validGeminiJson) },
      });

      const advice = await getAssistantAdvice(
        BENCHMARK_STATION_FALLBACKS['mumbai-bkc'],
        EVALUATOR_PERSONA_PRESETS.commuter,
        'test-gemini-key'
      );

      expect(advice.metadata.isAiGenerated).toBe(true);
      expect(advice.metadata.modelUsed).toBe('gemini-2.0-flash');
      expect(advice.verifiedAqiSnapshot.aqi).toBe(BENCHMARK_STATION_FALLBACKS['mumbai-bkc'].aqi);
      expect(advice.summary).toContain('Mumbai Metro');
    });

    it('falls back safely to deterministic advice if Gemini returns incomplete JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify({ summary: 'Incomplete payload' }) },
      });

      const advice = await getAssistantAdvice(
        DEFAULT_STATION_DATA,
        EVALUATOR_PERSONA_PRESETS.commuter,
        'secret-gemini-key-999'
      );

      expect(advice.metadata.isAiGenerated).toBe(false);
      expect(advice.metadata.generationNote).toContain('schema validation');
      expect(advice.metadata.generationNote).not.toContain('secret-gemini-key-999');
      expect(advice.pillar3_sustainableAlternatives.recommendations.length).toBeGreaterThanOrEqual(3);
    });
  });
});
