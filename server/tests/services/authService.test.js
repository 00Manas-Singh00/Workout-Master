import User from '../../models/userModel.js';
import * as authService from '../../services/authService.js';
import { ValidationError, NotFoundError } from '../../utils/errors.js';

describe('Auth Service', () => {
  describe('syncUser', () => {
    it('should create a new user if it does not exist', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        profile: { level: 'beginner' },
        goals: ['strength'],
      };

      const user = await authService.syncUser('clerk_123', userData);

      expect(user).toBeDefined();
      expect(user.clerkUserId).toBe('clerk_123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.profile.level).toBe('beginner');
      expect(user.goals).toEqual(['strength']);
      expect(user.stats.workoutsCompleted).toBe(0);
    });

    it('should update an existing user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await authService.syncUser('clerk_123', userData);

      const updatedData = {
        email: 'updated@example.com',
        name: 'Updated User',
        profile: { level: 'intermediate' },
      };

      const updatedUser = await authService.syncUser('clerk_123', updatedData);

      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.name).toBe('Updated User');
      expect(updatedUser.profile.level).toBe('intermediate');
    });

    it('should throw ValidationError if clerkUserId is missing', async () => {
      await expect(authService.syncUser(null, {})).rejects.toThrow(ValidationError);
    });
  });

  describe('getUserByClerkId', () => {
    it('should return user if found', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await authService.syncUser('clerk_123', userData);
      const user = await authService.getUserByClerkId('clerk_123');

      expect(user).toBeDefined();
      expect(user.clerkUserId).toBe('clerk_123');
    });

    it('should throw NotFoundError if user not found', async () => {
      await expect(authService.getUserByClerkId('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update user name', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await authService.syncUser('clerk_123', userData);
      const updated = await authService.updateUser(user._id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
    });

    it('should update user profile', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await authService.syncUser('clerk_123', userData);
      const updated = await authService.updateUser(user._id, {
        profile: { level: 'advanced', age: 30 },
      });

      expect(updated.profile.level).toBe('advanced');
      expect(updated.profile.age).toBe(30);
    });

    it('should update user goals', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await authService.syncUser('clerk_123', userData);
      const updated = await authService.updateUser(user._id, {
        goals: ['hypertrophy', 'strength'],
      });

      expect(updated.goals).toEqual(['hypertrophy', 'strength']);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(authService.updateUser(fakeId, {})).rejects.toThrow(NotFoundError);
    });
  });
});
