/**
 * Serverless Function: Payment Status
 * GET /api/payment-status?ref=REFERENCE_ID
 *
 * Public (used by the payment confirmation UI) — returns status only, no PII.
 * Enrollment is fulfilled server-side when the gateway confirms payment.
 */

import {
    getSupabaseAdmin,
    findPaymentByReference,
    updatePaymentStatus,
    sanitizeReferenceId,
} from '../server/lib/supabase-payments.js';
import {
    getXentriCollectionStatus,
    mapXentriCollectionStatus,
} from '../server/lib/xentripay.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const referenceId = sanitizeReferenceId(req.query.ref);
    if (!referenceId) {
        return res.status(400).json({
            success: false,
            error: 'Invalid or missing reference ID',
        });
    }

    try {
        const supabase = getSupabaseAdmin();
        let payment = null;

        if (supabase) {
            payment = await findPaymentByReference(supabase, referenceId);
        }

        const providerRefId = payment?.provider_ref_id || referenceId;

        const statusRes = await getXentriCollectionStatus(providerRefId);
        const normalizedStatus = mapXentriCollectionStatus(statusRes.status);

        if (
            supabase &&
            payment &&
            payment.status === 'pending' &&
            (normalizedStatus === 'success' || normalizedStatus === 'failed')
        ) {
            await updatePaymentStatus(
                supabase,
                payment.reference_id,
                normalizedStatus,
                statusRes.refid,
                statusRes,
            );
        }

        return res.status(200).json({
            success: normalizedStatus === 'success',
            gateway: 'xentripay',
            status: normalizedStatus,
            referenceId: payment?.reference_id || referenceId,
        });
    } catch (error) {
        console.error('[payment-status] Error:', error.message);
        return res.status(500).json({
            success: false,
            status: 'pending',
            referenceId,
        });
    }
}
