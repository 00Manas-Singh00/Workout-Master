import { createClient } from 'redis';
import { env } from './env.js';
import logger from '../utils/logger.js';

let redisClient = null;
let redisAvailable = false;

export const getRedisClient = () => redisClient;

export const isRedisAvailable = () => redisAvailable;

export const connectRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: env.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed');
            redisAvailable = false;
            return new Error('Redis reconnection failed');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
      redisAvailable = true;
    });

    await redisClient.connect();
    logger.info('Redis connection established');
    redisAvailable = true;
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    logger.warn('Continuing without Redis (caching will be disabled)');
    redisAvailable = false;
    redisClient = null;
    return null;
  }
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
    logger.info('Redis disconnected');
  }
};
