import User from '../models/userModel.js';
import { BaseRepository } from './baseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByClerkUserId(clerkUserId) {
    return await this.findOne({ clerkUserId });
  }

  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async updateProfile(userId, profileData) {
    return await this.updateById(userId, {
      $set: { profile: profileData },
    });
  }

  async updateGoals(userId, goals) {
    return await this.updateById(userId, { goals });
  }

  async updateStats(userId, stats) {
    return await this.updateById(userId, {
      $set: { stats },
    });
  }

  async incrementWorkoutCount(userId) {
    return await this.updateById(userId, {
      $inc: { 'stats.workoutsCompleted': 1 },
    });
  }
}

export default new UserRepository();
