import express from 'express';
import { getMe, syncAuth, updateMe } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { syncAuthSchema, updateMeSchema } from '../validators/authValidators.js';

const router = express.Router();

router.use(requireAuth);
router.post('/sync', validate(syncAuthSchema), asyncHandler(syncAuth));
router.get('/me', cacheMiddleware(60), asyncHandler(getMe));
router.patch('/me', validate(updateMeSchema), asyncHandler(updateMe));

export default router;
