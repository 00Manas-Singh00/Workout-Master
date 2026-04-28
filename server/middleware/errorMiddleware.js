import { fail } from '../utils/http.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const notFound = (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  fail(res, 'NOT_FOUND', `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    logger.error(`${err.code}: ${err.message}`, {
      requestId: req.id,
      path: req.path,
      method: req.method,
      details: err.details,
    });

    return fail(res, err.code, err.message, err.statusCode, err.details);
  }

  // Handle unexpected errors
  logger.error('Unexpected error:', {
    requestId: req.id,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message || 'Unexpected server error';
  const details = err.details || [];

  return fail(res, code, message, status, details);
};
