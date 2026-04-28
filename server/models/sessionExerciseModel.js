import mongoose from 'mongoose';

const performedSetSchema = new mongoose.Schema(
  {
    setNo: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 0, max: 100 },
    rpe: { type: Number, min: 1, max: 10, default: null },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    sets: { type: Number, required: true, min: 1, max: 12 },
    repMin: { type: Number, required: true, min: 1, max: 50 },
    repMax: { type: Number, required: true, min: 1, max: 50 },
    targetRpe: { type: Number, min: 1, max: 10, default: null },
    restSec: { type: Number, min: 15, max: 600, default: 90 },
  },
  { _id: false }
);

const sessionExerciseSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseKey: { type: String, required: true, trim: true, index: true },
    displayName: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    muscles: [{ type: String, trim: true }],
    equipment: [{ type: String, trim: true }],
    prescription: { type: prescriptionSchema, required: true },
    performedSets: { type: [performedSetSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sessionExerciseSchema.index({ sessionId: 1, order: 1 }, { unique: true });
sessionExerciseSchema.index({ userId: 1, sessionId: 1 });
sessionExerciseSchema.index({ userId: 1, exerciseKey: 1 });

export default mongoose.model('SessionExercise', sessionExerciseSchema);
