import { computeSessionSummary, updateExerciseMetricsForSession } from './metricsService.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import sessionRepository from '../repositories/sessionRepository.js';
import sessionExerciseRepository from '../repositories/sessionExerciseRepository.js';
import userRepository from '../repositories/userRepository.js';

export const createSession = async (userId, sessionData) => {
  const { name, type, goal, muscles, plannedDate, exercises = [] } = sessionData;

  const session = await sessionRepository.create({
    userId,
    programId: null,
    name: name || '',
    type: type || 'custom',
    goal: goal || 'general_fitness',
    muscles: Array.isArray(muscles) ? muscles : [],
    plannedDate: plannedDate ? new Date(plannedDate) : new Date(),
    status: 'planned',
  });

  if (Array.isArray(exercises) && exercises.length) {
    const docs = exercises.map((exercise, idx) => ({
      sessionId: session._id,
      userId,
      exerciseKey: (exercise.name || `exercise_${idx + 1}`).toLowerCase().replace(/\s+/g, '_'),
      displayName: exercise.name || `Exercise ${idx + 1}`,
      order: idx + 1,
      muscles: exercise.muscles || [],
      equipment: [],
      prescription: {
        sets: Array.isArray(exercise.sets) && exercise.sets.length ? exercise.sets.length : 3,
        repMin:
          Array.isArray(exercise.sets) && exercise.sets.length
            ? Math.min(...exercise.sets.map((s) => Number(s.reps || 8)))
            : 8,
        repMax:
          Array.isArray(exercise.sets) && exercise.sets.length
            ? Math.max(...exercise.sets.map((s) => Number(s.reps || 12)))
            : 12,
        targetRpe: 8,
        restSec: Number(exercise.rest || 90),
      },
      performedSets: [],
      isCompleted: false,
    }));

    await sessionExerciseRepository.model.insertMany(docs);
  }

  logger.info(`Session created: ${session._id}`);
  return session;
};

export const getSessionById = async (sessionId, userId) => {
  const session = await sessionRepository.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new NotFoundError('Session');
  }
  return session;
};

export const getSessionExercises = async (sessionId) => {
  return await sessionExerciseRepository.findBySessionId(sessionId, { sort: { order: 1 } });
};

export const listSessions = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const sessions = await sessionRepository.find(
    { userId },
    { sort: { plannedDate: -1 }, skip, limit }
  );
  const sessionIds = sessions.map((s) => s._id);
  const exerciseDocs = await sessionExerciseRepository.model.find({ sessionId: { $in: sessionIds } }).sort({ order: 1 });

  const grouped = new Map();
  for (const exercise of exerciseDocs) {
    const key = String(exercise.sessionId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(exercise);
  }

  const total = await sessionRepository.countByUserId(userId);

  return {
    sessions: sessions.map((session) => ({
      session,
      exercises: grouped.get(String(session._id)) || [],
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

export const deleteSession = async (sessionId, userId) => {
  const session = await sessionRepository.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new NotFoundError('Session');
  }

  await sessionExerciseRepository.deleteBySessionId(session._id);
  await sessionRepository.deleteById(session._id);

  logger.info(`Session deleted: ${session._id}`);
  return session;
};

export const startSession = async (sessionId, userId, readiness) => {
  const session = await sessionRepository.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (session.status === 'completed' || session.status === 'skipped') {
    throw new ConflictError('Completed or skipped sessions cannot be started');
  }

  session.status = 'in_progress';
  session.startedAt = session.startedAt || new Date();
  if (readiness) session.readiness = { ...(session.readiness?.toObject?.() || {}), ...readiness };
  await session.save();

  logger.info(`Session started: ${session._id}`);
  return session;
};

export const logSet = async (sessionId, userId, setData) => {
  const { sessionExerciseId, setNo, reps, rpe } = setData;

  const session = await sessionRepository.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (session.status !== 'in_progress') {
    throw new ConflictError('Session must be in progress to log sets');
  }

  const sessionExercise = await sessionExerciseRepository.findOne({
    _id: sessionExerciseId,
    sessionId: session._id,
    userId,
  });

  if (!sessionExercise) {
    throw new NotFoundError('Exercise entry for this session');
  }

  const existingIndex = sessionExercise.performedSets.findIndex((s) => s.setNo === setNo);
  const nextSet = { setNo, reps, rpe: rpe ?? null, completedAt: new Date() };

  if (existingIndex >= 0) {
    sessionExercise.performedSets[existingIndex] = nextSet;
  } else {
    sessionExercise.performedSets.push(nextSet);
  }

  sessionExercise.isCompleted = sessionExercise.performedSets.length >= sessionExercise.prescription.sets;
  await sessionExercise.save();

  return sessionExercise;
};

export const completeSession = async (sessionId, userId) => {
  const session = await sessionRepository.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new NotFoundError('Session');
  }

  if (session.status === 'completed') {
    throw new ConflictError('Session already completed');
  }

  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();

  const exercises = await sessionExerciseRepository.findBySessionId(session._id);
  const summary = computeSessionSummary(exercises);
  const { prs } = await updateExerciseMetricsForSession({ userId, sessionId });

  const user = await userRepository.findById(userId);
  if (user) {
    const now = new Date();
    const prev = user.stats.lastWorkoutAt ? new Date(user.stats.lastWorkoutAt) : null;
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = prev ? Math.floor(Math.abs(now - prev) / dayMs) : null;

    user.stats.workoutsCompleted += 1;
    user.stats.lastWorkoutAt = now;
    user.stats.currentStreakDays = diffDays !== null && diffDays <= 1 ? user.stats.currentStreakDays + 1 : 1;
    await user.save();
  }

  logger.info(`Session completed: ${session._id}`);
  return { session, summary, prs };
};

export const skipSession = async (sessionId, userId, reason) => {
  const session = await sessionRepository.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new NotFoundError('Session');
  }

  session.status = 'skipped';
  await session.save();

  logger.info(`Session skipped: ${session._id}`);
  return session;
};

export const getTodaySession = async (userId) => {
  const startOfDayUTC = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  const endOfDayUTC = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

  const session = await sessionRepository.findOne({
    userId,
    plannedDate: { $gte: startOfDayUTC(), $lte: endOfDayUTC() },
  }, { sort: { createdAt: -1 } });

  if (!session) {
    return { session: null, exercises: [] };
  }

  const exercises = await sessionExerciseRepository.findBySessionId(session._id, { sort: { order: 1 } });

  return { session, exercises };
};
