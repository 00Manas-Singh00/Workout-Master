import express from 'express';
import authRoutes from './authRoutes.js';
import programRoutes from './programRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import healthRoutes from './healthRoutes.js';
import chatRoutes from './chatRoutes.js';

const apiRouter = express.Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/programs', programRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/recommendations', recommendationRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/chat', chatRoutes);

export default apiRouter;
