import { Router } from 'express';
import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { stripe } from '../lib/stripe.js';
import { getPack } from '../lib/packs.js';
import { env } from '../lib/env.js';

export const checkoutRouter = Router();

interface CheckoutBody {
  packId?: unknown;
}

checkoutRouter.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body as CheckoutBody;

  const pack = getPack(String(body.packId ?? ''));
  if (!pack) {
    res.status(400).json({ error: 'Unknown credit pack.' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      // Trust the user identity from the verified JWT, never the request body.
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: pack.amountCents,
            product_data: {
              name: `ScriptDrop ${pack.name} — ${pack.credits} credits`,
            },
          },
        },
      ],
      metadata: {
        user_id: user.id,
        pack_id: pack.id,
        pack_name: pack.name,
        credits: String(pack.credits),
      },
      success_url: `${env.frontendUrl}/app?success=true`,
      cancel_url: `${env.frontendUrl}/pricing?canceled=true`,
    });

    if (!session.url) {
      res.status(502).json({ error: 'Could not start checkout. Please try again.' });
      return;
    }

    res.json({ url: session.url });
  } catch {
    res.status(502).json({ error: 'Could not start checkout. Please try again.' });
  }
});
