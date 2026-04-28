import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    profile: {
      age: { type: Number, min: 13, max: 100, default: null },
      sex: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        default: 'prefer_not_to_say',
      },
      heightCm: { type: Number, min: 100, max: 250, default: null },
      weightKg: { type: Number, min: 25, max: 300, default: null },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      equipmentAccess: [
        {
          type: String,
          enum: ['bodyweight', 'dumbbells', 'barbell', 'machines', 'bands', 'kettlebell'],
        },
      ],
    },
    goals: [
      {
        type: String,
        enum: ['strength', 'hypertrophy', 'fat_loss', 'general_fitness', 'sports_performance'],
      },
    ],
    stats: {
      workoutsCompleted: { type: Number, default: 0 },
      adherenceLast28d: { type: Number, default: 0 },
      currentStreakDays: { type: Number, default: 0 },
      lastWorkoutAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Compound index for user lookup by clerkUserId
userSchema.index({ clerkUserId: 1 });

export default mongoose.model('User', userSchema);
