import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    goal: {
      type: String,
      required: true,
      enum: ['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance'],
    },
    splitType: {
      type: String,
      required: true,
      enum: ['full_body', 'upper_lower', 'push_pull_legs', 'bro_split', 'individual'],
    },
    daysPerWeek: { type: Number, required: true, min: 2, max: 7 },
    sessionDurationMin: { type: Number, min: 20, max: 180, default: 60 },
    currentWeek: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

programSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('Program', programSchema);
