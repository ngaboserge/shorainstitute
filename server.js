/**
 * Production entry point for cPanel's "Setup Node.js App" (Passenger).
 * Serves the Vite build from dist/ and wires up the /api/* handlers
 * (same handler modules used by scripts/local-api-server.mjs in dev).
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import paymentInitiate from './api/payment-initiate.js';
import paymentStatus from './api/payment-status.js';
import xentripayWebhook from './api/xentripay-webhook.js';
import xentripayWebhookAlt from './api/webhooks/xentripay.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

app.post('/api/payment-initiate', paymentInitiate);
app.get('/api/payment-status', paymentStatus);
app.post('/api/xentripay-webhook', xentripayWebhook);
app.post('/api/webhooks/xentripay', xentripayWebhookAlt);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
});
