import mongoose from 'mongoose';

const readinessSchema = new mongoose.Schema(
  {
    sleepScore: { type: Number, min: 1, max: 5, default: null },
    sorenessScore: { type: Number, min: 1, max: 5, default: null },
    stressScore: { type: Number, min: 1, max: 5, default: null },
    energyScore: { type: Number, min: 1, max: 5, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null, index: true },
    name: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['full_body', 'upper_lower', 'push_pull_legs', 'bro_split', 'bodybuilder_split', 'individual', 'custom'],
      default: 'custom',
    },
    goal: {
      type: String,
      enum: ['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance', 'strength_power', 'growth_hypertrophy', 'cardiovascular_endurance'],
      default: 'general_fitness',
    },
    muscles: [{ type: String, trim: true }],
    plannedDate: { type: Date, required: true, index: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    status: {
      type: String,
      required: true,
      enum: ['planned', 'in_progress', 'completed', 'skipped'],
      default: 'planned',
      index: true,
    },
    readiness: { type: readinessSchema, default: () => ({}) },
    coachNotes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, plannedDate: -1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ userId: 1, plannedDate: -1, status: 1 });

export default mongoose.model('Session', sessionSchema);
