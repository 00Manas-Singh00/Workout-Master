import Session from '../models/sessionModel.js';
import ExerciseMetrics from '../models/exerciseMetricsModel.js';
import User from '../models/userModel.js';
import { ok, fail } from '../utils/http.js';

const daysAgo = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
};

export const getDashboard = async (req, res) => {
  if (!req.user?._id) return fail(res, 'USER_NOT_SYNCED', 'User must sync profile first', 409);

  const [completedSessions, allRecentSessions, metrics, user] = await Promise.all([
    Session.countDocuments({ userId: req.user._id, status: 'completed', completedAt: { $gte: daysAgo(28) } }),
    Session.countDocuments({ userId: req.user._id, plannedDate: { $gte: daysAgo(28) } }),
    ExerciseMetrics.find({ userId: req.user._id }),
    User.findById(req.user._id),
  ]);

  const adherence28d = allRecentSessions > 0 ? Math.round((completedSessions / allRecentSessions) * 100) : 0;
  const prCount28d = metrics.filter((m) => m.updatedAt >= daysAgo(28) && m.bestSet?.loadKg > 0).length;

  return ok(res, {
    adherence28d,
    sessionsCompleted28d: completedSessions,
    volumeTrend: [],
    prCount28d,
    streakDays: user?.stats?.currentStreakDays || 0,
  });
};
