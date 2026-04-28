import logger from './logger.js';

export class AppError extends Error {
  constructor(code, message, statusCode = 500, details = []) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = []) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super('CONFLICT', message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500);
  }
}

export const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Async error:', error);
      next(error);
    });
  };
};
