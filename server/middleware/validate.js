import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || target,
      issue: issue.message,
    }));

    logger.warn(`Validation failed for ${req.method} ${req.path}:`, details);

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details,
      },
    });
  }

  req[target] = result.data;
  return next();
};
