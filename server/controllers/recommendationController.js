import ExerciseMetrics from '../models/exerciseMetricsModel.js';
import { ok, fail } from '../utils/http.js';
import { suggestNextLoad } from '../services/progressionService.js';

export const getNextLoadRecommendation = async (req, res) => {
  if (!req.user?._id) return fail(res, 'USER_NOT_SYNCED', 'User must sync profile first', 409);

  const { exerciseKey } = req.params;
  const metrics = await ExerciseMetrics.findOne({ userId: req.user._id, exerciseKey });

  if (!metrics) {
    return ok(res, {
      exerciseKey,
      currentEstimated1RM: 0,
      progressionState: 'hold',
      recommendation: {
        loadKg: 0,
        sets: 3,
        repMin: 8,
        repMax: 10,
        targetRpe: 7,
      },
      rationale: 'No prior exercise data. Start conservative.',
    });
  }

  const next = suggestNextLoad({ currentLoadKg: metrics.bestSet.loadKg, progressionState: metrics.progressionState });

  return ok(res, {
    exerciseKey,
    currentEstimated1RM: metrics.estimated1RM,
    progressionState: metrics.progressionState,
    recommendation: {
      loadKg: next.loadKg,
      sets: metrics.progressionState === 'deload' ? 3 : 4,
      repMin: metrics.progressionState === 'deload' ? 6 : 4,
      repMax: metrics.progressionState === 'deload' ? 8 : 6,
      targetRpe: metrics.progressionState === 'deload' ? 7 : 8,
    },
    rationale: next.note,
  });
};
