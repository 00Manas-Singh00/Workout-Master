import request from 'supertest';
import { createApp } from '../../app.js';
import User from '../../models/userModel.js';

describe('Auth API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/sync', () => {
    it('should sync a new user', async () => {
      const response = await request(app)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          profile: { level: 'beginner' },
          goals: ['strength'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.name).toBe('Test User');
    });

    it('should update an existing user', async () => {
      await User.create({
        clerkUserId: 'clerk_123',
        email: 'old@example.com',
        name: 'Old Name',
      });

      const response = await request(app)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({
          email: 'new@example.com',
          name: 'New Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('new@example.com');
      expect(response.body.data.name).toBe('New Name');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({
          email: 'invalid-email',
          name: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      const user = await User.create({
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123');

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should return 404 when user not synced', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'nonexistent');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('should update user profile', async () => {
      const user = await User.create({
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        name: 'Test User',
      });

      const response = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({
          name: 'Updated Name',
          profile: { level: 'intermediate' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.profile.level).toBe('intermediate');
    });

    it('should return 400 for empty update', async () => {
      const response = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .set('x-clerk-user-id', 'clerk_123')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
