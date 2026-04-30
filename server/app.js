import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { requestId } from './middleware/requestId.js';
import { cacheMiddleware } from './middleware/cache.js';
import { connectRedis } from './config/redis.js';
import logger from './utils/logger.js';
import { swaggerSpec } from './config/swagger.js';

const isAllowedDevOrigin = (origin = '') => {
  if (!origin) return true;

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    return isLocalHost;
  } catch {
    return false;
  }
};

const buildCorsOptions = () => ({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (env.nodeEnv !== 'production' && isAllowedDevOrigin(origin)) {
      return callback(null, true);
    }

    if (env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-user-id'],
});

export const createApp = async () => {
  const app = express();

  // ── Sentry (must be first) ─────────────────────────────────────────────────
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: env.nodeEnv,
      tracesSampleRate: env.nodeEnv === 'production' ? 0.2 : 1.0,
      integrations: [Sentry.httpIntegration(), Sentry.mongooseIntegration()],
    });
    app.use(Sentry.expressErrorHandler());
    logger.info('Sentry error monitoring initialized');
  }

  // Initialize Redis connection
  await connectRedis();

  // Security middleware
  if (env.nodeEnv === 'production') {
    app.use(helmet());
  }

  // Compression middleware
  app.use(compression());

  // Request ID tracking
  app.use(requestId);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors(buildCorsOptions()));

  // Rate limiting
  app.use('/api', generalLimiter);
  app.use('/api/auth', authLimiter);

  // ── Swagger UI ─────────────────────────────────────────────────────────────
  const enableSwagger = env.nodeEnv !== 'production' || process.env.ENABLE_SWAGGER === 'true';
  if (enableSwagger) {
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Workout Master API',
        customCss: `
          .swagger-ui .topbar { background-color: #000; }
          .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,<svg/>'); width: 0; }
          .swagger-ui .topbar-wrapper::before { content: 'WORKOUT MASTER API'; color: white; font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 0.1em; }
        `,
        swaggerOptions: { persistAuthorization: true },
      })
    );
    // Also expose the raw spec for CI validation / external tooling
    app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
    logger.info('Swagger UI available at /api/docs');
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.nodeEnv,
    });
  });

  app.use('/api', apiRouter);

  if (env.nodeEnv === 'production') {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
