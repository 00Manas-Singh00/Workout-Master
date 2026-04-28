import express from 'express';
import { createProgram, getActiveProgram } from '../controllers/programController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/clerkAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createProgramSchema } from '../validators/programValidators.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(createProgramSchema), asyncHandler(createProgram));
router.get('/active', asyncHandler(getActiveProgram));

export default router;
