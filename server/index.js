import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const start = async () => {
  try {
    await connectDB(env.mongoUri);
    logger.info('Connected to MongoDB');

    const app = await createApp();
    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Startup error:', error.message);
    process.exit(1);
  }
};

start();
