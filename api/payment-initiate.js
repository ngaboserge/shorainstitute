/**
 * Serverless Function: Payment Initiate (XentriPay)
 * POST /api/payment-initiate
 *
 * Requires: Authorization: Bearer <supabase_jwt>
 * Body: { courseId, email, name, phone, paymentMethod: 'momo' | 'card' }
 *
 * The price is resolved server-side from the courses table.
 * Enrollment happens ONLY after the gateway confirms payment
 * (webhook or status poll) via update_course_payment_status.
 */

import { verifyAuthUser } from '../server/lib/auth.js';
import {
    getSupabaseAdmin,
    createPaymentRecord,
    generateReferenceId,
    resolveCoursePrice,
    assertNotAlreadyEnrolled,
    updatePaymentProviderRef,
} from '../server/lib/supabase-payments.js';
import {
    getXentriPayConfig,
    initiateXentriCollection,
    normalizeRwandaMomoPhones,
    normalizeInternationalPhone,
    resolveXentriPayCollectionAmount,
    buildXentriCardReturnUrl,
} from '../server/lib/xentripay.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const userId = await verifyAuthUser(req);
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { courseId, email, name, phone, paymentMethod = 'momo' } = req.body || {};

        if (!courseId || !email || !name) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!['momo', 'card'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, error: 'Invalid payment method' });
        }

        if (!phone) {
            return res.status(400).json({ success: false, error: 'Phone number is required' });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return res.status(500).json({ success: false, error: 'Payment system unavailable' });
        }

        try {
            getXentriPayConfig();
        } catch {
            return res.status(500).json({ success: false, error: 'XentriPay not configured' });
        }

        let pricing;
        try {
            pricing = await resolveCoursePrice(supabase, { courseId, studentId: userId });
            await assertNotAlreadyEnrolled(supabase, { courseId, studentId: userId });
        } catch (e) {
            return res.status(400).json({ success: false, error: e.message });
        }

        const pmethod = paymentMethod === 'card' ? 'cc' : 'momo';

        let phones;
        try {
            // MoMo requires a valid Rwanda number; card accepts any international number.
            phones = pmethod === 'momo'
                ? normalizeRwandaMomoPhones(phone)
                : normalizeInternationalPhone(phone);
        } catch (e) {
            return res.status(400).json({ success: false, error: e.message });
        }

        let xentriAmount;
        try {
            xentriAmount = resolveXentriPayCollectionAmount(pricing);
        } catch (e) {
            return res.status(400).json({ success: false, error: e.message });
        }

        const referenceId = generateReferenceId();

        // Create pending payment record before calling the gateway
        try {
            await createPaymentRecord(supabase, {
                p_user_id: userId,
                p_course_id: courseId,
                p_amount: pricing.amount,
                p_currency: pricing.currency,
                p_reference_id: referenceId,
                p_payment_method: pmethod === 'momo' ? 'mobile_money' : 'card',
                p_payer_phone: phone,
                p_payer_email: email,
                p_payment_provider: 'xentripay',
            });
        } catch (e) {
            console.error('[payment-initiate] create record failed:', e);
            return res.status(500).json({ success: false, error: 'Could not start payment' });
        }

        const cfg = getXentriPayConfig();
        const returnUrl = pmethod === 'cc' ? buildXentriCardReturnUrl(referenceId) : undefined;

        const collectionBody = {
            email,
            cname: name,
            amount: xentriAmount,
            cnumber: phones.cnumber,
            msisdn: phones.msisdn,
            currency: 'RWF',
            pmethod,
            chargesIncluded: cfg.chargesIncluded,
            ...(returnUrl && { returl: returnUrl, redirecturl: returnUrl }),
        };

        let response;
        try {
            response = await initiateXentriCollection(collectionBody);
        } catch (e) {
            console.error('[payment-initiate] XentriPay rejected:', {
                referenceId,
                pmethod,
                amount: xentriAmount,
                error: e.message,
                xentriResponse: e.xentriResponse || null,
            });
            return res.status(400).json({
                success: false,
                error: e.message,
                referenceId,
            });
        }

        const providerRefId = response.refid;
        if (!providerRefId) {
            console.error('[payment-initiate] No refid in XentriPay response:', {
                referenceId,
                response,
            });
            return res.status(500).json({
                success: false,
                error: 'Payment gateway did not return a reference. Please try again.',
                referenceId,
            });
        }

        const redirectUrl = response.url?.trim() || null;
        if (pmethod === 'cc' && !redirectUrl) {
            console.error('[payment-initiate] Card checkout URL missing:', {
                referenceId,
                response,
            });
            return res.status(400).json({
                success: false,
                error: 'Card checkout URL was not returned by the gateway. Please try again.',
                referenceId,
            });
        }

        await updatePaymentProviderRef(supabase, referenceId, {
            providerRefId,
            paymentProvider: 'xentripay',
        });

        const confirmationMessage =
            pmethod === 'cc'
                ? 'You will be redirected to complete your card payment on the secure checkout page.'
                : 'A payment request was sent to your phone. Open MTN MoMo and approve the prompt to confirm your payment.';

        return res.status(200).json({
            success: true,
            status: 'awaiting_confirmation',
            gateway: 'xentripay',
            referenceId,
            redirectUrl,
            amount: xentriAmount,
            currency: 'RWF',
            message: response.reply || confirmationMessage,
            confirmationMessage,
        });
    } catch (error) {
        console.error('[payment-initiate] Unhandled error:', {
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            success: false,
            error: error.message || 'Payment initiation failed',
        });
    }
}
