import { getRedisClient } from '../config/redis.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

export const cacheMiddleware = (duration = env.cacheTTL) => {
  return async (req, res, next) => {
    const client = getRedisClient();
    
    // Skip caching if Redis is not available
    if (!client) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await client.get(key);
      
      if (cached) {
        logger.debug(`Cache hit for ${key}`);
        return res.json(JSON.parse(cached));
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = async (data) => {
        try {
          await client.setEx(key, duration, JSON.stringify(data));
          logger.debug(`Cached response for ${key}`);
        } catch (error) {
          logger.error('Failed to cache response:', error);
        }
        
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = async (pattern) => {
  const client = getRedisClient();
  
  if (!client) {
    return;
  }

  try {
    const keys = await client.keys(`cache:${pattern}*`);
    
    if (keys.length > 0) {
      await client.del(keys);
      logger.info(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Failed to invalidate cache:', error);
  }
};
