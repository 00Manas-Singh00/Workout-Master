import User from '../models/userModel.js';
import { env } from '../config/env.js';
import { fail } from '../utils/http.js';
import { verifyClerkSessionToken } from '../services/clerkTokenService.js';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
};

const applyDevHeaderAuth = async (req, devClerkUserId) => {
  req.auth = { clerkUserId: devClerkUserId, mode: 'dev-header' };
  req.user = await User.findOne({ clerkUserId: devClerkUserId });
};

export const requireAuth = async (req, res, next) => {
  try {
    const bearerToken = getBearerToken(req);
    const devClerkUserId = String(req.headers['x-clerk-user-id'] || '').trim();

    if (!bearerToken) {
      if (env.nodeEnv !== 'production' && devClerkUserId) {
        await applyDevHeaderAuth(req, devClerkUserId);
        return next();
      }

      return fail(res, 'AUTH_REQUIRED', 'Authorization token is required', 401);
    }

    try {
      const verified = await verifyClerkSessionToken(bearerToken);
      const clerkUserId = verified?.sub;

      if (!clerkUserId) {
        return fail(res, 'AUTH_INVALID', 'Token missing Clerk subject claim', 401);
      }

      const user = await User.findOne({ clerkUserId });

      req.auth = {
        clerkUserId,
        sessionId: verified?.sid || null,
        authorizedParty: verified?.azp || null,
        rawClaims: verified,
        mode: 'verified-token',
      };
      req.user = user || null;

      return next();
    } catch (verifyError) {
      if (env.nodeEnv !== 'production' && devClerkUserId) {
        await applyDevHeaderAuth(req, devClerkUserId);
        return next();
      }

      return fail(
        res,
        verifyError.code || 'AUTH_INVALID',
        verifyError.message || 'Invalid authentication token',
        verifyError.status || 401
      );
    }
  } catch (error) {
    return fail(res, error.code || 'AUTH_INVALID', error.message || 'Invalid authentication token', error.status || 401);
  }
};
