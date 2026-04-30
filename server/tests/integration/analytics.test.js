import request from 'supertest';
import { createApp } from '../../app.js';
import User from '../../models/userModel.js';
import Session from '../../models/sessionModel.js';
import ExerciseMetrics from '../../models/exerciseMetricsModel.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Analytics API Integration Tests', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = await createApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await ExerciseMetrics.deleteMany({});
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return 401 when no auth header is provided', async () => {
      const response = await request(app).get('/api/analytics/dashboard');
      // Clerk middleware returns 401 or 403 without a token
      expect([401, 403]).toContain(response.status);
    });

    it('should return 409 when user has not been synced', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_not_synced');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return dashboard data with correct shape for a synced user', async () => {
      // Create a synced user first
      const user = await User.create({
        clerkUserId: 'clerk_analytics_test',
        email: 'analytics@example.com',
        name: 'Analytics User',
        stats: { currentStreakDays: 5, workoutsCompleted: 3 },
      });

      // Create some completed sessions
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

      await Session.insertMany([
        {
          userId: user._id,
          name: 'Session 1',
          type: 'full_body',
          goal: 'strength',
          muscles: ['chest', 'triceps'],
          plannedDate: twoDaysAgo,
          completedAt: twoDaysAgo,
          status: 'completed',
        },
        {
          userId: user._id,
          name: 'Session 2',
          type: 'upper_lower',
          goal: 'hypertrophy',
          muscles: ['back', 'biceps'],
          plannedDate: fourDaysAgo,
          completedAt: fourDaysAgo,
          status: 'completed',
        },
        {
          userId: user._id,
          name: 'Session 3',
          type: 'full_body',
          goal: 'strength',
          muscles: ['chest', 'shoulders'],
          plannedDate: now,
          status: 'planned',
        },
      ]);

      // Create exercise metrics
      await ExerciseMetrics.insertMany([
        {
          userId: user._id,
          exerciseKey: 'bench_press',
          estimated1RM: 100,
          bestSet: { reps: 5, at: twoDaysAgo },
          progressionState: 'up',
          lastPerformedAt: twoDaysAgo,
        },
        {
          userId: user._id,
          exerciseKey: 'squat',
          estimated1RM: 140,
          bestSet: { reps: 5, at: fourDaysAgo },
          progressionState: 'hold',
          lastPerformedAt: fourDaysAgo,
        },
      ]);

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_analytics_test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const d = response.body.data;

      // Required fields present
      expect(d).toHaveProperty('adherence28d');
      expect(d).toHaveProperty('sessionsCompleted28d');
      expect(d).toHaveProperty('volumeTrend');
      expect(d).toHaveProperty('muscleBreakdown');
      expect(d).toHaveProperty('strengthTrends');
      expect(d).toHaveProperty('prCount28d');
      expect(d).toHaveProperty('streakDays');

      // Type checks
      expect(typeof d.adherence28d).toBe('number');
      expect(Array.isArray(d.volumeTrend)).toBe(true);
      expect(Array.isArray(d.muscleBreakdown)).toBe(true);
      expect(Array.isArray(d.strengthTrends)).toBe(true);

      // Correct session count
      expect(d.sessionsCompleted28d).toBe(2);

      // Adherence = 2 completed of 3 planned = 67%
      expect(d.adherence28d).toBe(67);

      // Streak from user.stats
      expect(d.streakDays).toBe(5);

      // Strength trends: should have both exercises, sorted by 1RM desc
      expect(d.strengthTrends.length).toBe(2);
      expect(d.strengthTrends[0].estimated1RM).toBeGreaterThanOrEqual(
        d.strengthTrends[1].estimated1RM
      );
      expect(d.strengthTrends[0]).toHaveProperty('exercise');
      expect(d.strengthTrends[0]).toHaveProperty('progressionState');

      // Muscle breakdown: chest should appear twice
      const chestEntry = d.muscleBreakdown.find(
        (m) => m.muscle.toLowerCase() === 'chest'
      );
      expect(chestEntry).toBeDefined();
      expect(chestEntry.count).toBe(2);
    });

    it('should return 0 adherence and empty arrays for a user with no sessions', async () => {
      await User.create({
        clerkUserId: 'clerk_empty_user',
        email: 'empty@example.com',
        name: 'Empty User',
      });

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_empty_user');

      expect(response.status).toBe(200);
      const d = response.body.data;
      expect(d.adherence28d).toBe(0);
      expect(d.sessionsCompleted28d).toBe(0);
      expect(d.strengthTrends).toHaveLength(0);
    });
  });
});
