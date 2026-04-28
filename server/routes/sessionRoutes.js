import express from 'express';
import {
  completeSession,
  createSession,
  deleteSession,
  getSessionById,
  getTodaySession,
  listSessions,
  logSet,
  skipSession,
  startSession,
  getAIRecommendation,
} from '../controllers/sessionController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';
import {
  completeSessionSchema,
  logSetSchema,
  skipSessionSchema,
  startSessionSchema,
} from '../validators/sessionValidators.js';

const router = express.Router();

router.use(requireAuth);

router.route('/').post(asyncHandler(createSession)).get(cacheMiddleware(30), asyncHandler(listSessions));
router.get('/today', cacheMiddleware(30), asyncHandler(getTodaySession));
router.get('/:id', cacheMiddleware(30), asyncHandler(getSessionById));
router.delete('/:id', asyncHandler(async (req, res, next) => {
  await invalidateCache('/api/sessions');
  next();
}), asyncHandler(deleteSession));
router.post('/:id/start', validate(startSessionSchema), asyncHandler(startSession));
router.post('/:id/log-set', validate(logSetSchema), asyncHandler(logSet));
router.post('/:id/complete', validate(completeSessionSchema), asyncHandler(async (req, res, next) => {
  await invalidateCache('/api/sessions');
  next();
}), asyncHandler(completeSession));
router.post('/:id/skip', validate(skipSessionSchema), asyncHandler(async (req, res, next) => {
  await invalidateCache('/api/sessions');
  next();
}), asyncHandler(skipSession));
router.post('/ai-recommendation', asyncHandler(getAIRecommendation));

export default router;
