import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateDeterministicAdvice, getAssistantAdvice } from '@/lib/gemini-service';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import { DEFAULT_STATION_DATA } from '@/lib/aqi-constants';

describe('Gemini Reasoning Service (Milestone 3)', () => {
  describe('Deterministic Advice Generator (Strict Data Boundary & 3 Pillars)', () => {
    it('generates complete advice covering all 3 pillars for Daily Commuter', () => {
      const persona = EVALUATOR_PERSONA_PRESETS.commuter;
      const advice = generateDeterministicAdvice(DEFAULT_STATION_DATA, persona);

      // Verify Ground Truth AQI is preserved without modification
      expect(advice.verifiedAqiSnapshot.aqi).toBe(DEFAULT_STATION_DATA.aqi);
      expect(advice.verifiedAqiSnapshot.stationName).toBe(DEFAULT_STATION_DATA.station.name);

      // Verify Persona
      expect(advice.personaProfile.id).toBe('commuter');

      // Pillar 1: Low-Emission Routines & Commute Optimization
      expect(advice.pillar1_lowEmissionRoutines).toBeDefined();
      expect(advice.pillar1_lowEmissionRoutines.commuteModeRecommendation).toBeDefined();
      expect(advice.pillar1_lowEmissionRoutines.safeOutdoorTimeWindows.length).toBeGreaterThan(0);
      expect(advice.pillar1_lowEmissionRoutines.inversionWarning).toContain('inversion');

      // Pillar 2: Indoor Air Quality Interventions
      expect(advice.pillar2_indoorAirQuality).toBeDefined();
      expect(advice.pillar2_indoorAirQuality.purifierSchedule).toBeDefined();
      expect(advice.pillar2_indoorAirQuality.ventilationWindows).toBeDefined();
      expect(advice.pillar2_indoorAirQuality.botanicalAndPhysicalMeasures.length).toBeGreaterThan(0);
      expect(advice.pillar2_indoorAirQuality.dustSuppressionTip).toContain('wet-mopping');

      // Pillar 3: Sustainable Alternatives with Dual Impact Justification
      expect(advice.pillar3_sustainableAlternatives.recommendations.length).toBeGreaterThanOrEqual(3);
      for (const rec of advice.pillar3_sustainableAlternatives.recommendations) {
        expect(rec.action).toBeDefined();
        expect(rec.causalWhy).toBeDefined();
        expect(rec.personalHealthImpact).toBeDefined();
        expect(rec.collectiveEcologicalImpact).toBeDefined();
      }
    });

    it('tailors specific advice for Parent of a Toddler', () => {
      const persona = EVALUATOR_PERSONA_PRESETS.parent;
      const advice = generateDeterministicAdvice(DEFAULT_STATION_DATA, persona);

      expect(advice.personaProfile.id).toBe('parent');
      expect(advice.threatLevel).toBe('hazardous');
      // Should mention indoor / nursery protection
      const jsonStr = JSON.stringify(advice).toLowerCase();
      expect(jsonStr).toContain('toddler');
    });

    it('tailors specific advice for Senior Citizen with Asthma', () => {
      const persona = EVALUATOR_PERSONA_PRESETS.senior;
      const advice = generateDeterministicAdvice(DEFAULT_STATION_DATA, persona);

      expect(advice.personaProfile.id).toBe('senior');
      // Should recommend shifting morning walk
      const jsonStr = JSON.stringify(advice).toLowerCase();
      expect(jsonStr).toContain('morning');
    });

    it('tailors specific advice for Student Athlete', () => {
      const persona = EVALUATOR_PERSONA_PRESETS.athlete;
      const advice = generateDeterministicAdvice(DEFAULT_STATION_DATA, persona);

      expect(advice.personaProfile.id).toBe('athlete');
      const jsonStr = JSON.stringify(advice).toLowerCase();
      expect(jsonStr).toContain('sports');
    });
  });

  describe('getAssistantAdvice Function', () => {
    const originalEnv = process.env.GEMINI_API_KEY;

    afterEach(() => {
      process.env.GEMINI_API_KEY = originalEnv;
      vi.restoreAllMocks();
    });

    it('gracefully uses deterministic fallback when GEMINI_API_KEY is not configured', async () => {
      delete process.env.GEMINI_API_KEY;
      const advice = await getAssistantAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.commuter);

      expect(advice.metadata.isAiGenerated).toBe(false);
      expect(advice.metadata.modelUsed).toContain('Rule-Engine Fallback');
      expect(advice.pillar1_lowEmissionRoutines).toBeDefined();
    });
  });
});
