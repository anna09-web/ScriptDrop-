import { Router } from 'express';
import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { stripe } from '../lib/stripe.js';
import { getPlan, amountForInterval, isInterval } from '../lib/plans.js';
import { env } from '../lib/env.js';

export const checkoutRouter = Router();

interface CheckoutBody {
  planId?: unknown;
  interval?: unknown;
}

checkoutRouter.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body as CheckoutBody;

  const plan = getPlan(String(body.planId ?? ''));
  if (!plan) {
    res.status(400).json({ error: 'Unknown plan.' });
    return;
  }
  const interval = body.interval;
  if (!isInterval(interval)) {
    res.status(400).json({ error: 'Invalid billing interval.' });
    return;
  }

  const amount = amountForInterval(plan, interval);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      // Trust the user identity from the verified JWT, never the request body.
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            recurring: { interval },
            product_data: {
              name: `ScriptDrop ${plan.name} (${interval === 'year' ? 'annual' : 'monthly'})`,
            },
          },
        },
      ],
      // Metadata is mirrored onto the subscription so renewal invoices can
      // recompute the monthly generation grant.
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
          generations: String(plan.monthlyGenerations),
        },
      },
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        interval,
        generations: String(plan.monthlyGenerations),
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
