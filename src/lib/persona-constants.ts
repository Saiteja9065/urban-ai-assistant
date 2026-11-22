import { PersonaPresetId, UserProfile } from '@/types/persona';

/**
 * Mandatory Pre-Configured Presets for Instant Evaluator Testing
 * Matches Section 3 of Master Project Brief
 * Configured as Demographic Archetypes with clear Age Brackets
 */
export const EVALUATOR_PERSONA_PRESETS: Record<Exclude<PersonaPresetId, 'custom'>, UserProfile> = {
  commuter: {
    id: 'commuter',
    name: 'Daily Office Commuter (Age 25–30)',
    role: 'Daily Office Commuter',
    age: 28,
    locationContext: 'Resides in Noida, commutes 18 km each way to Cyber City Gurgaon',
    healthConditions: ['None (Healthy Adult)', 'Occasional eye irritation in smog'],
    routine: 'Travels 18 km each way between 8:30 AM and 6:30 PM by 2-wheeler or Metro.',
    sensitivityLevel: 'moderate',
    primaryConcerns: ['Peak rush hour PM2.5 exposure', 'Commute transit time', 'Road-level vehicular toxic exhaust'],
    keyNeeds: [
      'Optimal commute departure timing to avoid diurnal inversion peaks',
      'Metro vs 2-wheeler road route trade-off',
      'Vehicle cabin air recirculation & N95/FFP2 mask protocols',
    ],
    description: 'Working professional traveling 18 km each way. Needs commute departure timing, metro vs road routes, cabin recirculation, and N95 masking.',
  },

  parent: {
    id: 'parent',
    name: 'Parent of a Toddler (Age 28–40)',
    role: 'Parent of a Toddler',
    age: 31,
    locationContext: 'High-rise apartment in Greater Kailash, New Delhi',
    healthConditions: ['3-year-old toddler with sensitive developing respiratory tract'],
    routine: 'Evening toddler playground session (4:30 PM), nursery sleep hours (8:00 PM - 7:00 AM).',
    sensitivityLevel: 'critical',
    primaryConcerns: ['Under-5 lung vulnerability', 'Indoor PM2.5 infiltration in nursery', 'Playground particulate safety'],
    keyNeeds: [
      'Playground safety thresholds and alternative active indoor play',
      'Nursery purification schedule and airtight sealing during night inversions',
      'Brief mid-day ventilation windows when smog lifts',
      'Pediatric vulnerability warnings',
    ],
    description: 'Parent with a 3-year-old child in an apartment. Needs playground safety thresholds, nursery purification, ventilation hours, and pediatric vulnerability warnings.',
  },

  senior: {
    id: 'senior',
    name: 'Senior Citizen with Asthma (Age 65+)',
    role: 'Senior Citizen with Asthma',
    age: 68,
    locationContext: 'Indirapuram, Ghaziabad / Delhi NCR',
    healthConditions: ['Mild bronchial asthma', 'Hypertension', 'Age-related diminished lung capacity'],
    routine: 'Habitual 6:00 AM morning walk in local park, afternoon reading by garden.',
    sensitivityLevel: 'critical',
    primaryConcerns: ['Asthma flare-ups & bronchospasms', 'Early morning surface temperature inversion smog traps'],
    keyNeeds: [
      'Shifting morning park walks to indoor walking or mid-day sun hours',
      'Indoor oxygenation & continuous HEPA filtration protocols',
      'Immediate particulate avoidance during winter morning inversions',
      'Emergency inhaler readiness protocols',
    ],
    description: 'Senior citizen retiree with mild respiratory vulnerability. Needs shifting morning walks indoors, oxygenation routines, and strict particulate avoidance.',
  },

  athlete: {
    id: 'athlete',
    name: 'Student / School Athlete (Age 14–18)',
    role: 'Student / School Athlete',
    age: 15,
    locationContext: 'Central Kolkata near Maidan',
    healthConditions: ['High cardiovascular breathing rates during strenuous athletic training'],
    routine: 'School hours 8:00 AM - 3:00 PM; mandatory football/track practice 4:00 PM - 5:30 PM.',
    sensitivityLevel: 'high',
    primaryConcerns: ['Deep pulmonary deposition of ultrafine PM2.5 during heavy aerobic breathing', 'Throat irritation'],
    keyNeeds: [
      'Relocating high-cardiovascular sports indoors during severe AQI',
      'Travel masking between school and home',
      'Hydration and antioxidant protocols to counter oxidative lung stress',
    ],
    description: 'High school student with mandatory 4:00 PM outdoor sports practice. Needs indoor sports relocation, travel masking, and hydration protocols.',
  },
};

export const DEFAULT_CUSTOM_PERSONA: UserProfile = {
  id: 'custom',
  name: 'Custom Citizen Profile',
  role: 'Urban Resident',
  age: 35,
  locationContext: 'Indian Metropolitan City',
  healthConditions: ['Healthy'],
  routine: 'Standard daily urban routine',
  sensitivityLevel: 'moderate',
  primaryConcerns: ['General health and daily productivity'],
  keyNeeds: ['Actionable daily advice for low emissions and clean breathing'],
  description: 'Custom demographic profile configured by user.',
};

export const PERSONA_LIST: UserProfile[] = [
  EVALUATOR_PERSONA_PRESETS.commuter,
  EVALUATOR_PERSONA_PRESETS.parent,
  EVALUATOR_PERSONA_PRESETS.senior,
  EVALUATOR_PERSONA_PRESETS.athlete,
];
