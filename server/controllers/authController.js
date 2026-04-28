import { ok } from '../utils/http.js';
import { serializeUser } from '../utils/serializeUser.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import * as authService from '../services/authService.js';

export const syncAuth = async (req, res) => {
  const clerkUserId = req.auth?.clerkUserId;
  const user = await authService.syncUser(clerkUserId, req.body);
  return ok(res, serializeUser(user));
};

export const getMe = async (req, res) => {
  if (!req.user) {
    throw new NotFoundError('User');
  }
  return ok(res, serializeUser(req.user));
};

export const updateMe = async (req, res) => {
  if (!req.user) {
    throw new NotFoundError('User');
  }
  const updated = await authService.updateUser(req.user._id, req.body);
  return ok(res, serializeUser(updated));
};
