import { z } from 'zod';

export const startSessionSchema = z.object({
  readiness: z
    .object({
      sleepScore: z.number().int().min(1).max(5).nullable().optional(),
      sorenessScore: z.number().int().min(1).max(5).nullable().optional(),
      stressScore: z.number().int().min(1).max(5).nullable().optional(),
      energyScore: z.number().int().min(1).max(5).nullable().optional(),
      notes: z.string().max(500).optional(),
    })
    .optional(),
});

export const logSetSchema = z.object({
  sessionExerciseId: z.string().min(1),
  setNo: z.number().int().min(1),
  reps: z.number().int().min(0).max(100),
  rpe: z.number().min(1).max(10).optional(),
});

export const completeSessionSchema = z.object({
  feedback: z
    .object({
      sessionRpe: z.number().min(1).max(10).optional(),
      notes: z.string().max(500).optional(),
    })
    .optional(),
});

export const skipSessionSchema = z.object({
  reason: z.string().max(250).optional(),
});
