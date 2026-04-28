import request from 'supertest';
import { createApp } from '../../app.js';
import User from '../../models/userModel.js';
import Session from '../../models/sessionModel.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Session API Integration Tests', () => {
  let app;
  let mongoServer;
  let userId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = createApp();

    const user = await User.create({
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      name: 'Test User',
    });
    userId = user._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Session.deleteMany({});
  });

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({
          name: 'Test Workout',
          type: 'custom',
          goal: 'strength',
          muscles: ['chest', 'triceps'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();
    });

    it('should create session with exercises', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({
          name: 'Test Workout',
          exercises: [
            {
              name: 'Bench Press',
              muscles: ['chest'],
              sets: [{ reps: 10 }, { reps: 8 }],
              rest: 90,
            },
          ],
        });

      expect(response.status).toBe(201);
    });

    it('should return 409 if user not synced', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'nonexistent')
        .send({ name: 'Test Workout' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/sessions', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Session 1' });
      
      await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Session 2' });
    });

    it('should return paginated sessions', async () => {
      const response = await request(app)
        .get('/api/sessions?page=1&limit=10')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should return 409 if user not synced', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'nonexistent');

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return session by id', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Test Workout' });

      const sessionId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(sessionId);
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/sessions/${fakeId}`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Test Workout' });

      const sessionId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/sessions/${fakeId}`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sessions/:id/start', () => {
    it('should start a session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Test Workout' });

      const sessionId = createResponse.body.data._id;

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/start`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ readiness: { sleepScore: 5 } });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should return 409 if session already completed', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Test Workout' });

      const sessionId = createResponse.body.data._id;
      
      await Session.findByIdAndUpdate(sessionId, { status: 'completed' });

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/start`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/sessions/:id/complete', () => {
    it('should complete a session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Test Workout' });

      const sessionId = createResponse.body.data._id;

      await request(app)
        .post(`/api/sessions/${sessionId}/start`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/complete`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('POST /api/sessions/:id/skip', () => {
    it('should skip a session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ name: 'Test Workout' });

      const sessionId = createResponse.body.data._id;

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/skip`)
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({ reason: 'Not feeling well' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('skipped');
    });
  });
});
