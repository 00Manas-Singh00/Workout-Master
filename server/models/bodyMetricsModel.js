import mongoose from 'mongoose';

const bodyMetricsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    weightKg: { type: Number, min: 25, max: 300, required: true },
    waistCm: { type: Number, min: 30, max: 250, default: null },
    bodyFatPct: { type: Number, min: 2, max: 70, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

bodyMetricsSchema.index({ userId: 1, date: -1 });

export default mongoose.model('BodyMetrics', bodyMetricsSchema);
