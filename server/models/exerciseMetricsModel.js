import mongoose from 'mongoose';

const exerciseMetricsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseKey: { type: String, required: true, index: true },
    estimated1RM: { type: Number, default: 0 },
    bestSet: {
      reps: { type: Number, default: 0 },
      at: { type: Date, default: null },
    },
    rollingVolume4w: { type: Number, default: 0 },
    rollingSets4w: { type: Number, default: 0 },
    progressionState: { type: String, enum: ['up', 'hold', 'deload'], default: 'hold' },
    stagnationCounter: { type: Number, default: 0 },
    lastPerformedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

exerciseMetricsSchema.index({ userId: 1, exerciseKey: 1 }, { unique: true });

export default mongoose.model('ExerciseMetrics', exerciseMetricsSchema);
