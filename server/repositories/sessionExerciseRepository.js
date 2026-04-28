import SessionExercise from '../models/sessionExerciseModel.js';
import { BaseRepository } from './baseRepository.js';

export class SessionExerciseRepository extends BaseRepository {
  constructor() {
    super(SessionExercise);
  }

  async findBySessionId(sessionId, options = {}) {
    return await this.find({ sessionId }, options);
  }

  async findByUserId(userId, options = {}) {
    return await this.find({ userId }, options);
  }

  async findBySessionIdAndUserId(sessionId, userId) {
    return await this.findOne({ sessionId, userId });
  }

  async findByExerciseKey(exerciseKey, userId) {
    return await this.find({ exerciseKey, userId });
  }

  async addPerformedSet(sessionExerciseId, setData) {
    const exercise = await this.findById(sessionExerciseId);
    if (!exercise) return null;

    const existingIndex = exercise.performedSets.findIndex((s) => s.setNo === setData.setNo);
    if (existingIndex >= 0) {
      exercise.performedSets[existingIndex] = setData;
    } else {
      exercise.performedSets.push(setData);
    }

    exercise.isCompleted = exercise.performedSets.length >= exercise.prescription.sets;
    return await exercise.save();
  }

  async updateCompletionStatus(sessionExerciseId, isCompleted) {
    return await this.updateById(sessionExerciseId, { isCompleted });
  }

  async deleteBySessionId(sessionId) {
    return await this.model.deleteMany({ sessionId });
  }

  async countBySessionId(sessionId) {
    return await this.count({ sessionId });
  }

  async countByUserId(userId) {
    return await this.count({ userId });
  }
}

export default new SessionExerciseRepository();
