export type PersonaPresetId = 'commuter' | 'parent' | 'senior' | 'athlete' | 'custom';

export type SensitivityLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface UserProfile {
  id: PersonaPresetId;
  name: string;
  role: string;
  age: number;
  locationContext: string;
  healthConditions: string[];
  routine: string;
  sensitivityLevel: SensitivityLevel;
  primaryConcerns: string[];
  keyNeeds: string[];
  description: string;
}
