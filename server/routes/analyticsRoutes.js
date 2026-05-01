import express from 'express';
import { getDashboard } from '../controllers/analyticsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';

import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Training analytics dashboard
 *     description: Returns aggregated training metrics including adherence, volume trend (8 weeks), muscle frequency breakdown, and estimated 1RM strength leaderboard.
 *     security:
 *       - ClerkBearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AnalyticsDashboard'
 *       409:
 *         description: User not synced
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/dashboard', cacheMiddleware(60), asyncHandler(getDashboard));

export default router;
