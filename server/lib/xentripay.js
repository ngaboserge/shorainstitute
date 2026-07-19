/**
 * XentriPay Collections API v2 helpers.
 * Ported from the tutor-space reference implementation.
 * Docs: https://test.xentripay.com / https://xentripay.com
 */

import { timingSafeEqual } from 'crypto';

export const XENTRIPAY_V2_PATHS = {
    initiateCollection: '/api/collections/initiate',
    collectionStatus: (refid) => `/api/collections/status/${encodeURIComponent(refid)}`,
};

export const XENTRIPAY_V2_BASE_URLS = {
    sandbox: 'https://test.xentripay.com',
    production: 'https://xentripay.com',
};

export function getXentriPayConfig() {
    const apiKey = process.env.XENTRIPAY_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('XentriPay is not configured. Set XENTRIPAY_API_KEY.');
    }

    const sandbox = process.env.XENTRIPAY_SANDBOX !== 'false';
    let baseUrl =
        process.env.XENTRIPAY_BASE_URL?.trim() ||
        (sandbox ? XENTRIPAY_V2_BASE_URLS.sandbox : XENTRIPAY_V2_BASE_URLS.production);

    baseUrl = baseUrl.replace(/\/$/, '');

    if (/\/v1\b|api\.xentripay\.com/i.test(baseUrl)) {
        throw new Error(
            'XENTRIPAY_BASE_URL must be v2 (https://test.xentripay.com or https://xentripay.com)',
        );
    }

    return {
        apiKey,
        baseUrl,
        sandbox,
        chargesIncluded: process.env.XENTRIPAY_CHARGES_INCLUDED !== 'false',
        webhookSecret: process.env.XENTRIPAY_WEBHOOK_SECRET?.trim() || null,
    };
}

/** Rwanda MoMo: cnumber = 10 digits (078…); msisdn = 25078… */
export function normalizeRwandaMomoPhones(input) {
    const digits = String(input || '').replace(/\D/g, '');

    let local = digits;
    if (local.startsWith('250') && local.length >= 12) {
        local = '0' + local.slice(3);
    }
    if (local.length === 9 && (local.startsWith('7') || local.startsWith('8'))) {
        local = '0' + local;
    }

    if (!/^0\d{9}$/.test(local)) {
        throw new Error('Phone must be a valid Rwanda number (10 digits, e.g. 0781234567)');
    }

    return {
        cnumber: local,
        msisdn: `250${local.slice(1)}`,
    };
}

/**
 * Lenient normalization for international card payments.
 * For card (pmethod=cc) the phone is only a customer reference — the payment
 * happens on the hosted card page. XentriPay still validates:
 *   - cnumber: exactly 10 digits, starts with 0
 *   - msisdn:  >= 12 digits with a Rwanda prefix
 */
export function normalizeInternationalPhone(input) {
    if (!input || !String(input).trim()) {
        throw new Error('Phone number is required');
    }

    const digits = String(input).replace(/\D/g, '');

    if (digits.length < 7) {
        throw new Error('Please enter a valid phone number');
    }

    try {
        return normalizeRwandaMomoPhones(input);
    } catch {
        const last8 = digits.slice(-8).padStart(8, '0');
        const cnumber = `07${last8}`;
        const msisdn = `250${cnumber.slice(1)}`;
        return { cnumber, msisdn };
    }
}

export const XENTRIPAY_MIN_AMOUNT_RWF = 100;

/**
 * XentriPay only collects in RWF. Convert USD/EUR prices before initiating.
 */
export function resolveXentriPayCollectionAmount(pricing) {
    const currency = (pricing.currency || 'RWF').toUpperCase();
    let amountRwf;

    if (currency === 'RWF') {
        amountRwf = Math.round(Number(pricing.amount));
    } else if (currency === 'USD') {
        const rate = Number(process.env.USD_TO_RWF_RATE || 1463.5);
        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error('USD conversion rate is not configured');
        }
        amountRwf = Math.round(Number(pricing.amount) * rate);
    } else if (currency === 'EUR') {
        const rate = Number(process.env.EUR_TO_RWF_RATE || 1590);
        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error('EUR conversion rate is not configured');
        }
        amountRwf = Math.round(Number(pricing.amount) * rate);
    } else {
        throw new Error(`XentriPay does not support ${currency}. Set the course price in RWF.`);
    }

    if (!Number.isFinite(amountRwf) || amountRwf < XENTRIPAY_MIN_AMOUNT_RWF) {
        throw new Error(
            `Minimum XentriPay amount is ${XENTRIPAY_MIN_AMOUNT_RWF} RWF` +
                (currency !== 'RWF'
                    ? ` (≈ ${currency} ${pricing.amount} is too low after conversion)`
                    : ''),
        );
    }

    return amountRwf;
}

export function mapXentriCollectionStatus(status) {
    const s = String(status || '').trim().toUpperCase();
    if (['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'COMPLETE', 'PAID'].includes(s)) {
        return 'success';
    }
    if (['FAILED', 'FAILURE', 'CANCELLED', 'CANCELED', 'REVERSED'].includes(s)) {
        return 'failed';
    }
    return 'pending';
}

async function xentriRequest(cfg, method, path, body) {
    const url = `${cfg.baseUrl}${path}`;
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-XENTRIPAY-KEY': cfg.apiKey,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        console.error('[XentriPay] Non-JSON response:', { url, status: res.status, text });
        throw new Error('Invalid response from XentriPay');
    }

    if (!res.ok) {
        const msg = data.message || `XentriPay error (${res.status})`;
        console.error('[XentriPay] HTTP error:', {
            url, method, status: res.status,
            request: body ? { ...body, cnumber: body.cnumber ? '***' : undefined } : undefined,
            response: data,
        });
        const err = new Error(msg);
        err.xentriStatus = res.status;
        err.xentriResponse = data;
        throw err;
    }

    if (data.success === 0) {
        const msg = data.reply || data.message || 'Payment initiation failed';
        console.error('[XentriPay] Gateway rejection:', {
            url, method,
            request: body ? { ...body, cnumber: body.cnumber ? '***' : undefined } : undefined,
            response: data,
        });
        const err = new Error(msg);
        err.xentriResponse = data;
        throw err;
    }

    return data;
}

export async function initiateXentriCollection(body) {
    const cfg = getXentriPayConfig();
    return xentriRequest(cfg, 'POST', XENTRIPAY_V2_PATHS.initiateCollection, body);
}

export async function getXentriCollectionStatus(refid) {
    const cfg = getXentriPayConfig();
    return xentriRequest(cfg, 'GET', XENTRIPAY_V2_PATHS.collectionStatus(refid));
}

export function verifyXentriWebhookSecret(provided) {
    const secret = process.env.XENTRIPAY_WEBHOOK_SECRET?.trim();

    // XentriPay dashboard webhook UI is URL-only (no shared secret header).
    // When unset, accept the webhook and rely on getXentriCollectionStatus() verification.
    if (!secret) return true;

    if (!provided?.trim()) return false;

    const a = Buffer.from(provided.trim());
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

/** Public site base URL (no trailing slash). Used for card return + callbacks. */
export function getSiteUrl() {
    return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

/** Card checkout return URL after XentriPay hosted payment. */
export function buildXentriCardReturnUrl(referenceId) {
    const base = (
        process.env.XENTRIPAY_CARD_RETURN_URL_BASE?.trim() || getSiteUrl()
    ).replace(/\/$/, '');
    return `${base}/payment/success?ref=${encodeURIComponent(referenceId)}&payment=return`;
}

const COLLECTION_SUCCESS_EVENTS = new Set([
    'COLLECTION_SUCCESSFUL',
    'PAYMENT_REQUEST_COMPLETED',
    'CHECKOUT_SUCCESSFUL',
    'PAYMENT_LINK_CONTRIBUTION_SUCCESSFUL',
]);

const COLLECTION_FAIL_EVENTS = new Set([
    'COLLECTION_FAILED',
    'PAYMENT_REQUEST_FAILED',
    'PAYMENT_REQUEST_REVERSED',
    'PAYMENT_LINK_CONTRIBUTION_FAILED',
    'PAYMENT_LINK_EXPIRED',
]);

function pickString(...values) {
    for (const v of values) {
        if (v == null) continue;
        const s = String(v).trim();
        if (s) return s;
    }
    return undefined;
}

function eventToStatus(event) {
    const e = event.toUpperCase();
    if (COLLECTION_SUCCESS_EVENTS.has(e)) return 'SUCCESS';
    if (COLLECTION_FAIL_EVENTS.has(e)) return 'FAILED';
    return undefined;
}

export function normalizeXentriWebhookPayload(body) {
    const event = pickString(body.event, body.type, body.eventType, body.event_type);
    const data =
        body.data && typeof body.data === 'object' && !Array.isArray(body.data)
            ? body.data
            : body.payload && typeof body.payload === 'object'
              ? body.payload
              : {};

    const refid = pickString(
        data.refid,
        data.refId,
        data.internalRef,
        data.internal_ref,
        body.refid,
        body.refId,
    );

    const customerReference = pickString(
        data.customerReference,
        data.customer_reference,
        data.customerRef,
        body.customerReference,
        body.customer_reference,
    );

    const status =
        pickString(data.status, body.status) ||
        (event ? eventToStatus(event) : undefined);

    return { event, refid, customerReference, status };
}
