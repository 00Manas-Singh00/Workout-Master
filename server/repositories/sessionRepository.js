import Session from '../models/sessionModel.js';
import { BaseRepository } from './baseRepository.js';

export class SessionRepository extends BaseRepository {
  constructor() {
    super(Session);
  }

  async findByUserId(userId, options = {}) {
    return await this.find({ userId }, options);
  }

  async findByUserIdAndStatus(userId, status) {
    return await this.find({ userId, status });
  }

  async findByUserIdAndDateRange(userId, startDate, endDate) {
    return await this.find({
      userId,
      plannedDate: { $gte: startDate, $lte: endDate },
    });
  }

  async findByUserIdAndDate(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.findOne({
      userId,
      plannedDate: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  async updateStatus(sessionId, status) {
    return await this.updateById(sessionId, { status });
  }

  async updateStatusWithTimestamp(sessionId, status, timestampField) {
    return await this.updateById(sessionId, {
      status,
      [timestampField]: new Date(),
    });
  }

  async addReadiness(sessionId, readiness) {
    return await this.updateById(sessionId, { readiness });
  }

  async countByUserId(userId) {
    return await this.count({ userId });
  }

  async countByUserIdAndStatus(userId, status) {
    return await this.count({ userId, status });
  }
}

export default new SessionRepository();
