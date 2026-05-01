import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkout,
  completeWorkout,
  deleteWorkout
} from '../controllers/workoutController.js';
import { protect } from '../middleware/authMiddleware.js';

import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// All workout routes require authentication
router.use(protect);

router.route('/')
  .post(createWorkout)
  .get(cacheMiddleware(30), getWorkouts);

router.route('/:id')
  .get(cacheMiddleware(30), getWorkout)
  .delete(deleteWorkout);

router.route('/:id/complete')
  .put(completeWorkout);

export default router; 