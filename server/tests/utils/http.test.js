import { jest } from '@jest/globals';
import { ok, fail } from '../../utils/http.js';

describe('HTTP Utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('ok', () => {
    it('should send a successful response with data', () => {
      const data = { id: 1, name: 'Test' };
      ok(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should accept custom status code', () => {
      const data = { id: 1 };
      ok(mockRes, data, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should default to status 200 when not provided', () => {
      ok(mockRes, {});

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('fail', () => {
    it('should send an error response with code and message', () => {
      fail(mockRes, 'ERROR_CODE', 'Error message', 400);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ERROR_CODE',
          message: 'Error message',
          details: [],
        },
      });
    });

    it('should accept custom details array', () => {
      const details = [{ field: 'email', issue: 'Invalid email' }];
      fail(mockRes, 'VALIDATION_ERROR', 'Validation failed', 400, details);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    });

    it('should default to status 400 when not provided', () => {
      fail(mockRes, 'ERROR_CODE', 'Error message');

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should default to empty details array when not provided', () => {
      fail(mockRes, 'ERROR_CODE', 'Error message', 500);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ERROR_CODE',
          message: 'Error message',
          details: [],
        },
      });
    });
  });
});
