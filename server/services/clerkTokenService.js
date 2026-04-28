import { verifyToken } from '@clerk/backend';
import { env } from '../config/env.js';

export const verifyClerkSessionToken = async (token) => {
  const verified = await verifyToken(token, {
    secretKey: env.clerkSecretKey || undefined,
    jwtKey: env.clerkJwtKey || undefined,
    authorizedParties: env.clerkAuthorizedParties.length ? env.clerkAuthorizedParties : undefined,
    audience: env.clerkAudience.length ? env.clerkAudience : undefined,
  });

  if (verified.errors) {
    const message = verified.errors[0]?.message || 'Token verification failed';
    const error = new Error(message);
    error.code = 'AUTH_INVALID';
    error.status = 401;
    throw error;
  }

  return verified;
};
