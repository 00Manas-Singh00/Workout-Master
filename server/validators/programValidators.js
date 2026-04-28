import { z } from 'zod';

export const createProgramSchema = z.object({
  name: z.string().min(1).max(120),
  goal: z.enum(['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance']),
  splitType: z.enum(['full_body', 'upper_lower', 'push_pull_legs', 'bro_split', 'individual']),
  daysPerWeek: z.number().int().min(2).max(7),
  sessionDurationMin: z.number().int().min(20).max(180).optional(),
});
