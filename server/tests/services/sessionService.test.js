import mongoose from 'mongoose';
import Session from '../../models/sessionModel.js';
import SessionExercise from '../../models/sessionExerciseModel.js';
import User from '../../models/userModel.js';
import * as sessionService from '../../services/sessionService.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

describe('Session Service', () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      name: 'Test User',
    });
    userId = user._id;
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const sessionData = {
        name: 'Test Workout',
        type: 'custom',
        goal: 'strength',
        muscles: ['chest', 'triceps'],
        plannedDate: new Date(),
      };

      const session = await sessionService.createSession(userId, sessionData);

      expect(session).toBeDefined();
      expect(session.name).toBe('Test Workout');
      expect(session.userId).toEqual(userId);
      expect(session.status).toBe('planned');
    });

    it('should create session with exercises', async () => {
      const sessionData = {
        name: 'Test Workout',
        exercises: [
          {
            name: 'Bench Press',
            muscles: ['chest'],
            sets: [{ reps: 10 }, { reps: 8 }],
            rest: 90,
          },
        ],
      };

      const session = await sessionService.createSession(userId, sessionData);
      const exercises = await SessionExercise.find({ sessionId: session._id });

      expect(exercises).toHaveLength(1);
      expect(exercises[0].displayName).toBe('Bench Press');
    });

    it('should throw ValidationError if userId is invalid', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        sessionService.createSession(fakeId, { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getSessionById', () => {
    it('should return session if found', async () => {
      const sessionData = { name: 'Test Workout' };
      const created = await sessionService.createSession(userId, sessionData);
      
      const session = await sessionService.getSessionById(created._id, userId);

      expect(session).toBeDefined();
      expect(session._id).toEqual(created._id);
    });

    it('should throw NotFoundError if session not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        sessionService.getSessionById(fakeId, userId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if session belongs to different user', async () => {
      const otherUser = await User.create({
        clerkUserId: 'clerk_456',
        email: 'other@example.com',
        name: 'Other User',
      });

      const sessionData = { name: 'Test Workout' };
      const created = await sessionService.createSession(userId, sessionData);

      await expect(
        sessionService.getSessionById(created._id, otherUser._id)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('listSessions', () => {
    beforeEach(async () => {
      await sessionService.createSession(userId, { name: 'Session 1' });
      await sessionService.createSession(userId, { name: 'Session 2' });
      await sessionService.createSession(userId, { name: 'Session 3' });
    });

    it('should return paginated sessions', async () => {
      const result = await sessionService.listSessions(userId, 1, 2);

      expect(result.sessions).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
    });

    it('should return correct pagination info', async () => {
      const result = await sessionService.listSessions(userId, 1, 2);

      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle page 2', async () => {
      const result = await sessionService.listSessions(userId, 2, 2);

      expect(result.sessions).toHaveLength(1);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('deleteSession', () => {
    it('should delete session and its exercises', async () => {
      const sessionData = {
        name: 'Test Workout',
        exercises: [{ name: 'Bench Press', muscles: ['chest'], sets: [{ reps: 10 }], rest: 90 }],
      };
      const session = await sessionService.createSession(userId, sessionData);

      await sessionService.deleteSession(session._id, userId);

      const deletedSession = await Session.findById(session._id);
      const exercises = await SessionExercise.find({ sessionId: session._id });

      expect(deletedSession).toBeNull();
      expect(exercises).toHaveLength(0);
    });

    it('should throw NotFoundError if session not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        sessionService.deleteSession(fakeId, userId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('startSession', () => {
    it('should start a planned session', async () => {
      const sessionData = { name: 'Test Workout' };
      const session = await sessionService.createSession(userId, sessionData);

      const started = await sessionService.startSession(session._id, userId, {
        sleepScore: 5,
      });

      expect(started.status).toBe('in_progress');
      expect(started.startedAt).toBeDefined();
      expect(started.readiness.sleepScore).toBe(5);
    });

    it('should throw ConflictError if session already completed', async () => {
      const sessionData = { name: 'Test Workout' };
      const session = await sessionService.createSession(userId, sessionData);
      session.status = 'completed';
      await session.save();

      await expect(
        sessionService.startSession(session._id, userId)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('completeSession', () => {
    it('should complete a session and update user stats', async () => {
      const sessionData = {
        name: 'Test Workout',
        exercises: [{ name: 'Bench Press', muscles: ['chest'], sets: [{ reps: 10 }], rest: 90 }],
      };
      const session = await sessionService.createSession(userId, sessionData);
      await sessionService.startSession(session._id, userId);

      const result = await sessionService.completeSession(session._id, userId);

      expect(result.session.status).toBe('completed');
      expect(result.session.completedAt).toBeDefined();
      
      const user = await User.findById(userId);
      expect(user.stats.workoutsCompleted).toBe(1);
    });

    it('should throw ConflictError if session already completed', async () => {
      const sessionData = { name: 'Test Workout' };
      const session = await sessionService.createSession(userId, sessionData);
      session.status = 'completed';
      await session.save();

      await expect(
        sessionService.completeSession(session._id, userId)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('skipSession', () => {
    it('should skip a session', async () => {
      const sessionData = { name: 'Test Workout' };
      const session = await sessionService.createSession(userId, sessionData);

      const skipped = await sessionService.skipSession(session._id, userId, 'Not feeling well');

      expect(skipped.status).toBe('skipped');
    });
  });
});
