import express from 'express';
import { createProgram, getActiveProgram } from '../controllers/programController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createProgramSchema } from '../validators/programValidators.js';

import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(createProgramSchema), asyncHandler(createProgram));
router.get('/active', cacheMiddleware(30), asyncHandler(getActiveProgram));

export default router;
