import { createClient } from '@supabase/supabase-js';

const REFERENCE_ID_PATTERN = /^[A-Za-z0-9_-]{4,128}$/;

export function sanitizeReferenceId(referenceId) {
    const ref = String(referenceId || '').trim();
    if (!REFERENCE_ID_PATTERN.test(ref)) {
        return null;
    }
    return ref;
}

export function getSupabaseAdmin() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) return null;
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function findPaymentByReference(supabase, referenceId) {
    const ref = sanitizeReferenceId(referenceId);
    if (!ref) return null;

    const { data: byReference, error: refError } = await supabase
        .from('course_payments')
        .select('id, reference_id, provider_ref_id, payment_provider, status, user_id, course_id')
        .eq('reference_id', ref)
        .maybeSingle();

    if (refError) {
        console.error('[payments] lookup error:', refError);
        return null;
    }
    if (byReference) return byReference;

    const { data: byProvider, error: provError } = await supabase
        .from('course_payments')
        .select('id, reference_id, provider_ref_id, payment_provider, status, user_id, course_id')
        .eq('provider_ref_id', ref)
        .maybeSingle();

    if (provError) {
        console.error('[payments] provider lookup error:', provError);
        return null;
    }
    return byProvider;
}

/**
 * Resolve the course price server-side. Never trust client-provided amounts.
 */
export async function resolveCoursePrice(supabase, { courseId, studentId }) {
    const { data, error } = await supabase
        .from('courses')
        .select('id, title, price, currency, is_paid, status, instructor_id')
        .eq('id', courseId)
        .maybeSingle();

    if (error || !data) {
        throw new Error('Course not found');
    }

    if (data.status !== 'published') {
        throw new Error('Course is not available for enrollment');
    }

    if (!data.is_paid || Number(data.price) <= 0) {
        throw new Error('This course is free — no payment required');
    }

    if (data.instructor_id === studentId) {
        throw new Error('You cannot purchase your own course');
    }

    const amount = Number(data.price);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Course has no valid price');
    }

    return {
        amount,
        currency: data.currency || 'RWF',
        title: data.title,
    };
}

/**
 * Reject when the learner already has active access or a pending gateway payment.
 */
export async function assertNotAlreadyEnrolled(supabase, { courseId, studentId }) {
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, payment_status')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();

    if (enrollment && ['free', 'approved'].includes(enrollment.payment_status)) {
        throw new Error('You are already enrolled in this course');
    }
}

export async function createPaymentRecord(supabase, params) {
    const { data, error } = await supabase.rpc('create_course_payment_record', params);
    if (!error) return data;

    console.warn('[payments] RPC create_course_payment_record failed, trying direct insert:', error.message);

    const row = {
        user_id: params.p_user_id,
        course_id: params.p_course_id,
        amount: params.p_amount,
        currency: params.p_currency,
        reference_id: params.p_reference_id,
        payment_reference: params.p_reference_id,
        payment_method: params.p_payment_method,
        payer_phone: params.p_payer_phone,
        payer_email: params.p_payer_email,
        payment_provider: params.p_payment_provider || 'xentripay',
        status: 'pending',
    };

    const { data: inserted, error: insertError } = await supabase
        .from('course_payments')
        .insert(row)
        .select('id')
        .single();

    if (insertError) {
        console.error('[payments] direct insert failed:', insertError);
        throw new Error('Failed to create payment record');
    }

    return inserted.id;
}

export async function updatePaymentProviderRef(supabase, referenceId, { providerRefId, paymentProvider }) {
    const ref = sanitizeReferenceId(referenceId);
    if (!ref || !providerRefId) return;

    const payload = { provider_ref_id: providerRefId };
    if (paymentProvider) payload.payment_provider = paymentProvider;

    const { error } = await supabase.from('course_payments').update(payload).eq('reference_id', ref);
    if (error) {
        console.warn('[payments] provider ref update failed:', error.message);
    }
}

/**
 * Update payment status; on 'success' the RPC enrolls the learner atomically.
 */
export async function updatePaymentStatus(supabase, referenceId, status, transactionId, callbackData) {
    const ref = sanitizeReferenceId(referenceId);
    if (!ref) return null;

    const { data, error } = await supabase.rpc('update_course_payment_status', {
        p_reference_id: ref,
        p_status: status,
        p_transaction_id: transactionId || null,
        p_callback_data: callbackData || null,
    });
    if (error) {
        console.error('[payments] update_course_payment_status error:', error);
        return null;
    }
    return data;
}

export function generateReferenceId() {
    const date = new Date();
    const dateStr =
        date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `SHORA-${dateStr}-${random}`;
}
