import rateLimit from 'express-rate-limit';
import type { AuthedRequest } from './auth.js';

/**
 * Limits each authenticated user to 10 generate requests per minute.
 * Keyed by user id (set by requireAuth), falling back to IP if absent.
 */
export const generateRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const authed = req as AuthedRequest;
    return authed.user?.id ?? req.ip ?? 'anonymous';
  },
  message: {
    error: 'Too many generations. Please wait a minute and try again.',
  },
});
