import express from 'express';
import { getNextLoadRecommendation } from '../controllers/recommendationController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.get('/exercise/:exerciseKey/next-load', asyncHandler(getNextLoadRecommendation));

export default router;
