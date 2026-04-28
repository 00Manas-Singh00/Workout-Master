import { z } from 'zod';

const equipmentEnum = z.enum(['bodyweight', 'dumbbells', 'barbell', 'machines', 'bands', 'kettlebell']);
const goalsEnum = z.enum(['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance']);

export const profileSchema = z.object({
  age: z.number().int().min(13).max(100).nullable().optional(),
  sex: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  heightCm: z.number().min(100).max(250).nullable().optional(),
  weightKg: z.number().min(25).max(300).nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  equipmentAccess: z.array(equipmentEnum).optional(),
});

export const syncAuthSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  profile: profileSchema.optional(),
  goals: z.array(goalsEnum).optional(),
});

export const updateMeSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    profile: profileSchema.partial().optional(),
    goals: z.array(goalsEnum).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
