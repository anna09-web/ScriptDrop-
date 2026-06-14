import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Verifies the Supabase JWT from the Authorization header server-side using the
 * admin client. Rejects the request before any downstream handler runs if the
 * token is missing or invalid.
 */
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  req.user = {
    id: data.user.id,
    email: data.user.email ?? '',
  };
  next();
}
