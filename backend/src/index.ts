import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './lib/env.js';
import { meRouter } from './routes/me.js';
import { generateRouter } from './routes/generate.js';
import { checkoutRouter } from './routes/checkout.js';
import { webhookRouter } from './routes/webhook.js';

const app = express();

// Security headers.
app.use(helmet());

// Lock CORS to the configured frontend origin only.
app.use(
  cors({
    origin: env.frontendUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  }),
);

// IMPORTANT: the Stripe webhook needs the raw body for signature verification,
// so it is mounted with express.raw BEFORE the global JSON parser.
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// Everything else uses JSON.
app.use(express.json({ limit: '64kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/me', meRouter);
app.use('/api/generate', generateRouter);
app.use('/api/checkout', checkoutRouter);

// Fallback 404 for unknown API routes.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(env.port, () => {
  console.log(`ScriptDrop API listening on port ${env.port}`);
});
