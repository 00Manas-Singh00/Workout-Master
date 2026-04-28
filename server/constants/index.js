// Session Status Constants
export const SESSION_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};

// Session Type Constants
export const SESSION_TYPE = {
  FULL_BODY: 'full_body',
  UPPER_LOWER: 'upper_lower',
  PUSH_PULL_LEGS: 'push_pull_legs',
  BRO_SPLIT: 'bro_split',
  BODYBUILDER_SPLIT: 'bodybuilder_split',
  INDIVIDUAL: 'individual',
  CUSTOM: 'custom',
};

// Goal Constants
export const GOAL = {
  STRENGTH: 'strength',
  HYPERTROPHY: 'hypertrophy',
  FAT_LOSS: 'fat_loss',
  GENERAL_FITNESS: 'general_fitness',
  SPORTS_PERFORMANCE: 'sports_performance',
  STRENGTH_POWER: 'strength_power',
  GROWTH_HYPERTROPHY: 'growth_hypertrophy',
  CARDIOVASCULAR_ENDURANCE: 'cardiovascular_endurance',
};

// Fitness Level Constants
export const FITNESS_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

// Sex Constants
export const SEX = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
};

// Unit Constants
export const UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
};

// Equipment Constants
export const EQUIPMENT = {
  BODYWEIGHT: 'bodyweight',
  DUMBBELLS: 'dumbbells',
  BARBELL: 'barbell',
  MACHINES: 'machines',
  BANDS: 'bands',
  KETTLEBELL: 'kettlebell',
};

// Muscle Groups
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'calves',
  'forearms',
  'traps',
  'abs',
];

// Cache TTL Constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 900,
  VERY_LONG: 3600,
};

// Rate Limit Constants
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5,
};

// Validation Constants
export const VALIDATION = {
  MIN_AGE: 13,
  MAX_AGE: 100,
  MIN_HEIGHT_CM: 100,
  MAX_HEIGHT_CM: 250,
  MIN_WEIGHT_KG: 25,
  MAX_WEIGHT_KG: 300,
  MIN_REPS: 1,
  MAX_REPS: 100,
  MIN_SETS: 1,
  MAX_SETS: 12,
  MIN_RPE: 1,
  MAX_RPE: 10,
  MIN_REST_SEC: 15,
  MAX_REST_SEC: 600,
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_PAGINATION_LIMIT: 20,
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  USER_NOT_SYNCED: 'USER_NOT_SYNCED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  INVALID_STATE: 'INVALID_STATE',
  AUTH_INVALID: 'AUTH_INVALID',
};
