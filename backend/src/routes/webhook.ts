import { Router } from 'express';
import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { stripe } from '../lib/stripe.js';
import { env } from '../lib/env.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const webhookRouter = Router();

/**
 * Applies a subscription's monthly generation grant idempotently. The RPC keys
 * on the Stripe event id, so retried webhooks never double-grant.
 */
async function applySubscription(params: {
  eventId: string;
  userId: string;
  planId: string;
  interval: string;
  generations: number;
  status: string;
}): Promise<{ error: unknown }> {
  const { error } = await supabaseAdmin.rpc('apply_subscription', {
    p_event_id: params.eventId,
    p_user_id: params.userId,
    p_plan: params.planId,
    p_interval: params.interval,
    p_generations: params.generations,
    p_status: params.status,
  });
  return { error };
}

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
      req.body as Buffer,
      signature,
      env.stripeWebhookSecret,
    );
  } catch {
    res.status(400).send('Webhook signature verification failed.');
    return;
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        const userId =
          session.metadata?.user_id ?? session.client_reference_id ?? '';
        const planId = session.metadata?.plan_id ?? '';
        const interval = session.metadata?.interval ?? 'month';
        const generations = Number(session.metadata?.generations ?? '0');

        if (userId && generations > 0) {
          const { error } = await applySubscription({
            eventId: event.id,
            userId,
            planId,
            interval,
            generations,
            status: 'active',
          });
          if (error) {
            res.status(500).send('Fulfillment failed.');
            return;
          }
        }
      }
    } else if (event.type === 'invoice.paid') {
      // Renewal: refill the monthly generation grant. Skip the first invoice
      // (subscription_create) since checkout.session.completed already granted.
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id ?? '';
        const planId = sub.metadata?.plan_id ?? '';
        const generations = Number(sub.metadata?.generations ?? '0');

        if (userId && generations > 0) {
          const { error } = await applySubscription({
            eventId: event.id,
            userId,
            planId,
            interval: 'month',
            generations,
            status: 'active',
          });
          if (error) {
            res.status(500).send('Renewal failed.');
            return;
          }
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id ?? '';
      if (userId) {
        const { error } = await supabaseAdmin.rpc('set_subscription_status', {
          p_user_id: userId,
          p_status: 'canceled',
        });
        if (error) {
          res.status(500).send('Cancellation update failed.');
          return;
        }
      }
    }
  } catch {
    // Returning 500 makes Stripe retry; our RPCs are idempotent on event id.
    res.status(500).send('Webhook handling failed.');
    return;
  }

  res.json({ received: true });
});
