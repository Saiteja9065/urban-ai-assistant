import { DEFAULT_CUSTOM_PERSONA } from './persona-constants';
import { PersonaPresetId, SensitivityLevel, UserProfile } from '@/types/persona';
import { StationAqiData } from '@/types/aqi';

const MAX_TEXT_LENGTH = 240;
const VALID_SENSITIVITY_LEVELS = new Set<SensitivityLevel>(['low', 'moderate', 'high', 'critical']);
export const VALID_PRESET_IDS = new Set<Exclude<PersonaPresetId, 'custom'>>([
  'commuter',
  'parent',
  'senior',
  'athlete',
]);

/**
 * Parses and bounds-checks numeric latitude or longitude query parameters.
 */
export function parseCoordinateParam(raw: string | null, min: number, max: number): number | null {
  if (raw === null || raw.trim() === '') return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

/** Sanitizes a single string field, stripping control characters and clamping length. */
function sanitizeString(value: unknown, fallback: string, maxLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[\r\n\t]+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned.slice(0, maxLength) : fallback;
}

/** Sanitizes an array of strings, filtering invalid entries and clamping count. */
function sanitizeStringArray(value: unknown, fallback: string[], maxItems = 6): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 120))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
  return cleaned.length > 0 ? cleaned : fallback;
}

/**
 * Builds a sanitized custom UserProfile with clamped age and bounded string fields.
 */
export function sanitizeCustomPersona(raw: unknown): UserProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_CUSTOM_PERSONA };
  }
  const input = raw as Record<string, unknown>;
  const rawAge = typeof input.age === 'number' ? input.age : Number(input.age);
  const age = Number.isFinite(rawAge)
    ? Math.min(120, Math.max(1, Math.round(rawAge)))
    : DEFAULT_CUSTOM_PERSONA.age;

  const sensitivityLevel =
    typeof input.sensitivityLevel === 'string' &&
    VALID_SENSITIVITY_LEVELS.has(input.sensitivityLevel as SensitivityLevel)
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

/**
 * Validates that a client-supplied AQI snapshot conforms to the StationAqiData contract.
 */
export function isValidStationAqiData(value: unknown): value is StationAqiData {
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
