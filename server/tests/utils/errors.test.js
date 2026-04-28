import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
} from '../../utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError('TEST_CODE', 'Test message', 400, [{ field: 'test' }]);
      
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual([{ field: 'test' }]);
      expect(error.isOperational).toBe(true);
    });

    it('should have default values for optional parameters', () => {
      const error = new AppError('TEST_CODE', 'Test message');
      
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual([]);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with status 400', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with status 401', () => {
      const error = new AuthenticationError();
      
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      
      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an AuthorizationError with status 403', () => {
      const error = new AuthorizationError();
      
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with status 404', () => {
      const error = new NotFoundError('User');
      
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError with status 409', () => {
      const error = new ConflictError();
      
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError with status 429', () => {
      const error = new RateLimitError();
      
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('InternalServerError', () => {
    it('should create an InternalServerError with status 500', () => {
      const error = new InternalServerError();
      
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });
});
