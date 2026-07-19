/**
 * Serverless Function: XentriPay Webhook
 * POST /api/xentripay-webhook
 *
 * Register this URL in XentriPay → Webhooks (select all collection events).
 * Before enrolling, the reported status is re-verified against the
 * XentriPay status API (defense in depth).
 */

import {
    getSupabaseAdmin,
    updatePaymentStatus,
} from '../server/lib/supabase-payments.js';
import {
    verifyXentriWebhookSecret,
    normalizeXentriWebhookPayload,
    mapXentriCollectionStatus,
    getXentriCollectionStatus,
} from '../server/lib/xentripay.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const headerSecret = req.headers['x-xentripay-webhook-secret'];
    const authHeader = req.headers['authorization'];
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const secret = headerSecret || bearer;

    if (!verifyXentriWebhookSecret(secret)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const payload = req.body || {};
    const normalized = normalizeXentriWebhookPayload(payload);

    if (!normalized.refid && !normalized.customerReference) {
        return res.status(200).json({ ok: true, handled: 'skipped' });
    }

    const mapped = normalized.status ? mapXentriCollectionStatus(normalized.status) : 'pending';
    if (mapped === 'pending') {
        return res.status(200).json({ ok: true, handled: 'pending' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return res.status(500).json({ success: false, error: 'Database unavailable' });
    }

    let targetPayment = null;

    if (normalized.refid) {
        const { data: payment } = await supabase
            .from('course_payments')
            .select('reference_id, status, payment_provider, provider_ref_id')
            .eq('provider_ref_id', normalized.refid)
            .maybeSingle();
        targetPayment = payment;
    }

    if (!targetPayment && normalized.customerReference) {
        const { data: byCustomerRef } = await supabase
            .from('course_payments')
            .select('reference_id, status, payment_provider, provider_ref_id')
            .eq('reference_id', normalized.customerReference)
            .maybeSingle();
        targetPayment = byCustomerRef;
    }

    if (!targetPayment && normalized.refid) {
        const { data: byRef } = await supabase
            .from('course_payments')
            .select('reference_id, status, payment_provider, provider_ref_id')
            .eq('reference_id', normalized.refid)
            .maybeSingle();
        targetPayment = byRef;
    }

    if (!targetPayment) {
        return res.status(200).json({ ok: true, handled: 'no_payment' });
    }

    if (targetPayment.status === 'approved') {
        return res.status(200).json({ ok: true, handled: 'already_processed' });
    }

    // Double-check with XentriPay API before enrolling (defense in depth)
    let verifiedStatus = mapped;
    const statusRefId = targetPayment.provider_ref_id || normalized.refid;
    try {
        if (statusRefId) {
            const statusRes = await getXentriCollectionStatus(statusRefId);
            verifiedStatus = mapXentriCollectionStatus(statusRes.status);
        }
    } catch (e) {
        console.error('[xentripay-webhook] status verification failed:', e.message);
        return res.status(200).json({ ok: true, handled: 'verification_failed' });
    }

    if (verifiedStatus === 'pending') {
        return res.status(200).json({ ok: true, handled: 'pending' });
    }

    await updatePaymentStatus(
        supabase,
        targetPayment.reference_id,
        verifiedStatus === 'success' ? 'success' : 'failed',
        statusRefId || normalized.refid,
        payload,
    );

    return res.status(200).json({ ok: true, handled: 'updated' });
}
