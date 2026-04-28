import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export const requestId = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  logger.info(`Request ${requestId} - ${req.method} ${req.path}`);
  
  const originalSend = res.send;
  res.send = function (data) {
    logger.info(`Response ${requestId} - Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };
  
  next();
};
