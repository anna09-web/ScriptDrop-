import { Router } from 'express';
import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { stripe } from '../lib/stripe.js';
import { env } from '../lib/env.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const webhookRouter = Router();

/**
 * Stripe webhook. The raw body is required for signature verification, so the
 * express.raw() body parser is applied to this path in index.ts BEFORE the
 * global express.json() parser.
 */
webhookRouter.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).send('Missing Stripe signature.');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      // req.body is a Buffer here thanks to express.raw().
      req.body as Buffer,
      signature,
      env.stripeWebhookSecret,
    );
  } catch {
    res.status(400).send('Webhook signature verification failed.');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id ?? session.client_reference_id ?? '';
    const packName = session.metadata?.pack_name ?? 'Unknown';
    const credits = Number(session.metadata?.credits ?? '0');
    const amountCents = session.amount_total ?? 0;

    if (!userId || credits <= 0) {
      // Nothing actionable, but acknowledge so Stripe stops retrying.
      res.json({ received: true });
      return;
    }

    // Atomic, idempotent credit grant keyed on the unique Stripe session id.
    // The RPC inserts the order (unique constraint guards double-processing of
    // retried webhooks) and adds credits in a single transaction.
    const { error } = await supabaseAdmin.rpc('fulfill_order', {
      p_user_id: userId,
      p_stripe_session_id: session.id,
      p_pack_name: packName,
      p_credits_added: credits,
      p_amount_cents: amountCents,
    });

    if (error) {
      // Returning 500 makes Stripe retry, which is safe because fulfill_order
      // is idempotent on stripe_session_id.
      console.error('Order fulfillment failed; Stripe will retry.');
      res.status(500).send('Fulfillment failed.');
      return;
    }
  }

  res.json({ received: true });
});
