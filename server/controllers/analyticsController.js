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
  const prCount28d = metrics.filter((m) => m.updatedAt >= daysAgo(28) && m.bestSet?.reps > 0).length;

  // ── Volume trend: completed sessions per week, last 8 weeks ─────────────────
  const volumeTrendRaw = await Session.aggregate([
    {
      $match: {
        userId: req.user._id,
        status: 'completed',
        completedAt: { $gte: daysAgo(56) },
      },
    },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$completedAt' },
          week: { $isoWeek: '$completedAt' },
        },
        sessions: { $sum: 1 },
        weekStart: { $min: '$completedAt' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  const volumeTrend = volumeTrendRaw.map((w) => ({
    week: new Date(w.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: w.sessions,
  }));

  // Backfill empty weeks so the chart always has 8 data points
  if (volumeTrend.length < 8) {
    const existing = new Set(volumeTrend.map((v) => v.week));
    for (let i = 7; i >= 0; i--) {
      const label = new Date(daysAgo(i * 7)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!existing.has(label)) {
        volumeTrend.push({ week: label, sessions: 0 });
        existing.add(label);
      }
    }
    volumeTrend.sort((a, b) => new Date(a.week) - new Date(b.week));
  }

  // ── Muscle breakdown: frequency across all completed sessions ────────────────
  const muscleBreakdownRaw = await Session.aggregate([
    {
      $match: {
        userId: req.user._id,
        status: 'completed',
        muscles: { $exists: true, $ne: [] },
      },
    },
    { $unwind: '$muscles' },
    { $group: { _id: '$muscles', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const muscleBreakdown = muscleBreakdownRaw.map((m) => ({
    muscle: m._id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count: m.count,
  }));

  // ── Strength trends: top exercises by estimated 1RM ──────────────────────────
  const strengthTrends = metrics
    .filter((m) => m.estimated1RM > 0)
    .sort((a, b) => b.estimated1RM - a.estimated1RM)
    .slice(0, 8)
    .map((m) => ({
      exercise: m.exerciseKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      estimated1RM: Math.round(m.estimated1RM),
      bestSetReps: m.bestSet?.reps || 0,
      lastPerformedAt: m.lastPerformedAt,
      progressionState: m.progressionState,
    }));

  return ok(res, {
    adherence28d,
    sessionsCompleted28d: completedSessions,
    volumeTrend,
    muscleBreakdown,
    strengthTrends,
    prCount28d,
    streakDays: user?.stats?.currentStreakDays || 0,
  });
};
