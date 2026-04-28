import express from 'express';
import { health } from '../controllers/healthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(health));

export default router;
