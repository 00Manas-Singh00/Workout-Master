import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/workout-master',
  corsOrigins:
    process.env.NODE_ENV === 'production'
      ? ['https://your-vercel-app.vercel.app', 'https://workout-master.vercel.app']
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  clerkJwtKey: process.env.CLERK_JWT_KEY || '',
  clerkAuthorizedParties: parseCsv(process.env.CLERK_AUTHORIZED_PARTIES || process.env.CLERK_ALLOWED_ORIGINS || ''),
  clerkAudience: parseCsv(process.env.CLERK_AUDIENCE || ''),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || '900000',
  rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  enableHelmet: process.env.ENABLE_HELMET === 'true',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheTTL: Number(process.env.CACHE_TTL || '300'),
};
