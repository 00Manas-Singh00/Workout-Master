import ExerciseMetrics from '../models/exerciseMetricsModel.js';
import SessionExercise from '../models/sessionExerciseModel.js';

export const computeSessionSummary = (sessionExercises = []) => {
  let totalSets = 0;
  let totalReps = 0;

  for (const exercise of sessionExercises) {
    for (const set of exercise.performedSets || []) {
      totalSets += 1;
      totalReps += set.reps || 0;
    }
  }

  return {
    totalSets,
    totalReps,
  };
};

export const updateExerciseMetricsForSession = async ({ userId, sessionId }) => {
  const exercises = await SessionExercise.find({ userId, sessionId });
  const prs = [];

  for (const exercise of exercises) {
    const sets = exercise.performedSets || [];
    if (!sets.length) continue;

    const topSet = sets.reduce((best, cur) => {
      if (!best) return { set: cur, reps: cur.reps };
      return cur.reps > best.reps ? { set: cur, reps: cur.reps } : best;
    }, null);

    const metric = await ExerciseMetrics.findOne({ userId, exerciseKey: exercise.exerciseKey });
    const prevBestReps = metric?.bestSet?.reps || 0;

    const rollingSets4w = sets.length;

    const next = await ExerciseMetrics.findOneAndUpdate(
      { userId, exerciseKey: exercise.exerciseKey },
      {
        $set: {
          bestSet: {
            reps: topSet.set.reps,
            at: topSet.set.completedAt || new Date(),
          },
          rollingSets4w,
          lastPerformedAt: new Date(),
        },
        $setOnInsert: {
          stagnationCounter: 0,
        },
      },
      { upsert: true, new: true }
    );

    const isPR = topSet.set.reps > prevBestReps;

    if (isPR) prs.push(exercise.exerciseKey);
  }

  return { prs };
};
