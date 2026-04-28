import mongoose from 'mongoose';
import { ok } from '../utils/http.js';

export const health = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const db = dbState === 1 ? 'up' : 'down';

  return ok(res, {
    service: 'workout-master-api',
    status: db === 'up' ? 'ok' : 'degraded',
    db,
    timestamp: new Date().toISOString(),
  });
};
