import { Router } from 'express';
import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { generateRateLimiter } from '../middleware/rateLimit.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateScripts } from '../lib/anthropic.js';

export const generateRouter = Router();

const PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts'];
const HOOK_STYLES = [
  'Problem/Solution',
  'Storytime',
  'Shocking Stat',
  'Hot Take',
  'Before/After',
  'POV',
];
const TONES = [
  'Casual & Relatable',
  'Energetic & Hype',
  'Calm & Trustworthy',
  'Funny & Sarcastic',
];

const MAX_PRODUCT_LENGTH = 500;

interface GenerateBody {
  product?: unknown;
  platform?: unknown;
  hookStyle?: unknown;
  tone?: unknown;
}

function sanitizeProduct(input: string): string {
  // Replace ASCII control characters (0-31 and 127) with spaces, collapse
  // remaining whitespace, trim, and cap length before it reaches the prompt.
  const stripped = Array.from(input)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : ch;
    })
    .join('');
  return stripped.replace(/\s+/g, ' ').trim().slice(0, MAX_PRODUCT_LENGTH);
}

generateRouter.post(
  '/',
  requireAuth,
  generateRateLimiter,
  async (req: AuthedRequest, res: Response) => {
    const user = req.user!;
    const body = req.body as GenerateBody;

    if (typeof body.product !== 'string') {
      res.status(400).json({ error: 'A product description or URL is required.' });
      return;
    }
    const product = sanitizeProduct(body.product);
    if (product.length < 3) {
      res
        .status(400)
        .json({ error: 'Please describe your product in a bit more detail.' });
      return;
    }

    const platform = String(body.platform ?? '');
    const hookStyle = String(body.hookStyle ?? '');
    const tone = String(body.tone ?? '');

    if (!PLATFORMS.includes(platform)) {
      res.status(400).json({ error: 'Please choose a valid platform.' });
      return;
    }
    if (!HOOK_STYLES.includes(hookStyle)) {
      res.status(400).json({ error: 'Please choose a valid hook style.' });
      return;
    }
    if (!TONES.includes(tone)) {
      res.status(400).json({ error: 'Please choose a valid tone.' });
      return;
    }

    // Atomically deduct one credit before doing any paid work.
    const { data: deducted, error: deductError } = await supabaseAdmin.rpc(
      'deduct_credit',
      { user_id: user.id },
    );
    if (deductError) {
      res.status(500).json({ error: 'Could not check your credit balance.' });
      return;
    }
    if (deducted === false) {
      res.status(402).json({ error: 'Insufficient credits.' });
      return;
    }

    try {
      const result = await generateScripts({ product, platform, hookStyle, tone });

      // Persist the generation. If this fails the user still got their scripts,
      // so we log and continue rather than erroring out.
      const { error: saveError } = await supabaseAdmin.from('generations').insert({
        user_id: user.id,
        product_input: product,
        hook_style: hookStyle,
        platform,
        scripts: result.scripts,
      });
      if (saveError) {
        console.error('Failed to persist generation row.');
      }

      res.json({ scripts: result.scripts });
    } catch {
      // The AI call failed after we deducted — refund the credit so the user
      // isn't charged for nothing.
      await supabaseAdmin.rpc('add_credits', {
        user_id: user.id,
        amount: 1,
        purchased: false,
      });
      res.status(502).json({
        error:
          'The script generator is having a moment. Your credit was not used — try again.',
      });
    }
  },
);
