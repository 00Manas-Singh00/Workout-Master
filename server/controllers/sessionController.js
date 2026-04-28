import { ok } from '../utils/http.js';
import { suggestNextReps } from '../services/progressionService.js';
import * as sessionService from '../services/sessionService.js';
import { generateWorkoutRecommendation } from '../services/aiRecommendationService.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const toLegacyWorkout = (session, exercises = []) => ({
  _id: String(session._id),
  name: session.name || '',
  type: session.type,
  goal: session.goal,
  muscles: session.muscles || [],
  date: session.plannedDate,
  status: session.status,
  completed: session.status === 'completed',
  exercises: exercises.map((e) => ({
    sessionExerciseId: String(e._id),
    name: e.displayName,
    muscles: e.muscles || [],
    type: 'compound',
    sets: (e.performedSets || []).length
      ? e.performedSets.map((s) => ({ reps: s.reps, completed: true }))
      : Array.from({ length: e.prescription?.sets || 0 }).map(() => ({
          reps: e.prescription?.repMin || 0,
          completed: false,
        })),
    rest: e.prescription?.restSec || 90,
    description: '',
  })),
});

export const createSession = async (req, res) => {
  logger.info('Creating session', { userId: req.user?._id, clerkUserId: req.auth?.clerkUserId });
  
  if (!req.user?._id) {
    logger.warn('Session creation failed: user not synced', { clerkUserId: req.auth?.clerkUserId });
    throw new ValidationError('User must sync profile first');
  }

  const session = await sessionService.createSession(req.user._id, req.body || {});
  logger.info('Session created successfully', { sessionId: session._id, userId: req.user._id });
  return ok(res, { _id: String(session._id) }, 201);
};

export const listSessions = async (req, res) => {
  logger.info('Listing sessions', { userId: req.user?._id, clerkUserId: req.auth?.clerkUserId });
  
  if (!req.user?._id) {
    logger.warn('List sessions failed: user not synced', { clerkUserId: req.auth?.clerkUserId });
    throw new ValidationError('User must sync profile first');
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const { sessions, pagination } = await sessionService.listSessions(req.user._id, page, limit);
  logger.info('Sessions retrieved', { 
    count: sessions.length, 
    userId: req.user._id,
    total: pagination.total,
    sessionIds: sessions.map(s => s.session._id)
  });
  
  const legacy = sessions.map(({ session, exercises }) =>
    toLegacyWorkout(session, exercises)
  );
  logger.info('Legacy workouts created', { count: legacy.length });
  return ok(res, { sessions: legacy, pagination });
};

export const getSessionById = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const session = await sessionService.getSessionById(req.params.id, req.user._id);
  const exercises = await sessionService.getSessionExercises(session._id);
  return ok(res, toLegacyWorkout(session, exercises));
};

export const deleteSession = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  await sessionService.deleteSession(req.params.id, req.user._id);
  return ok(res, {});
};

export const getTodaySession = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const { session, exercises } = await sessionService.getTodaySession(req.user._id);

  if (!session) {
    return ok(res, { session: null, exercises: [] });
  }

  return ok(res, {
    session: {
      id: String(session._id),
      status: session.status,
      plannedDate: session.plannedDate,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      readiness: session.readiness,
    },
    exercises: exercises.map((e) => ({
      id: String(e._id),
      sessionExerciseId: String(e._id),
      exerciseKey: e.exerciseKey,
      displayName: e.displayName,
      order: e.order,
      prescription: e.prescription,
      performedSets: e.performedSets,
      isCompleted: e.isCompleted,
    })),
  });
};

export const startSession = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const session = await sessionService.startSession(req.params.id, req.user._id, req.body.readiness);
  return ok(res, {
    id: String(session._id),
    status: session.status,
    startedAt: session.startedAt,
    readiness: session.readiness,
  });
};

export const logSet = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const sessionExercise = await sessionService.logSet(req.params.id, req.user._id, req.body);
  const suggestion = suggestNextReps({
    currentReps: req.body.reps,
    progressionState: 'hold',
  });

  return ok(res, {
    sessionExerciseId: String(sessionExercise._id),
    performedSets: sessionExercise.performedSets,
    nextSetSuggestion: {
      reps: suggestion.reps,
      repTarget: `${sessionExercise.prescription.repMin}-${sessionExercise.prescription.repMax}`,
      note: suggestion.note,
    },
  });
};

export const completeSession = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const { session, summary, prs } = await sessionService.completeSession(req.params.id, req.user._id);
  return ok(res, {
    id: String(session._id),
    status: session.status,
    completedAt: session.completedAt,
    summary: {
      totalSets: summary.totalSets,
      totalReps: summary.totalReps,
      prs,
    },
  });
};

export const skipSession = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const session = await sessionService.skipSession(req.params.id, req.user._id, req.body.reason);
  return ok(res, {
    id: String(session._id),
    status: session.status,
    reason: req.body.reason || '',
  });
};

export const getAIRecommendation = async (req, res) => {
  if (!req.user?._id) {
    throw new ValidationError('User must sync profile first');
  }

  const { planType = 'session' } = req.body;

  if (!['session', 'week'].includes(planType)) {
    throw new ValidationError('planType must be either "session" or "week"');
  }

  logger.info('AI recommendation requested', { userId: req.user._id, planType });

  // Get user's workout history
  const { sessions } = await sessionService.listSessions(req.user._id, 1, 50);
  const legacyWorkouts = sessions.map(({ session, exercises }) =>
    toLegacyWorkout(session, exercises)
  );

  // Get user preferences from localStorage equivalent (we'll use request body for now)
  const userProfile = {
    userId: req.user._id,
    fitnessLevel: req.body.fitnessLevel || 'Beginner',
    fitnessGoals: req.body.fitnessGoals || ['General Fitness'],
    preferences: req.body.preferences || {}
  };

  // Generate AI recommendation
  const recommendation = await generateWorkoutRecommendation(userProfile, legacyWorkouts, planType);

  return ok(res, recommendation);
};
