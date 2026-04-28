import express from 'express';
import { getDashboard } from '../controllers/analyticsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.get('/dashboard', asyncHandler(getDashboard));

export default router;
