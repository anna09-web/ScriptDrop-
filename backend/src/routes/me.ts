import { Router } from 'express';
import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const meRouter = Router();

/**
 * GET /api/me — returns the authenticated user's profile.
 * Lazily creates the profile row if a DB trigger hasn't yet (defensive).
 */
meRouter.get('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;

  let { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('email, credits, total_credits_purchased, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Could not load your profile.' });
    return;
  }

  if (!profile) {
    const { data: created, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: user.id, email: user.email })
      .select('email, credits, total_credits_purchased, created_at')
      .single();
    if (insertError) {
      res.status(500).json({ error: 'Could not initialize your profile.' });
      return;
    }
    profile = created;
  }

  const { count } = await supabaseAdmin
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  res.json({
    email: profile.email,
    credits: profile.credits,
    total_credits_purchased: profile.total_credits_purchased,
    total_generations: count ?? 0,
    created_at: profile.created_at,
  });
});
