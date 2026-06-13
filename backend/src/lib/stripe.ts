import Stripe from 'stripe';
import { env } from './env.js';

// Pin to the SDK's expected API version. Cast keeps this resilient across
// minor SDK bumps that change the pinned literal.
export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
});
