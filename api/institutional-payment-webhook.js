/**
 * Serverless Function: Institutional Payment Webhook
 * POST /api/institutional-payment-webhook
 *
 * Handles payment confirmations for institutional course purchases
 * Updates purchase status and enables code generation upon successful payment
 */

import { getSupabaseAdmin } from '../server/lib/supabase-payments.js'
import {
  verifyXentriWebhookSecret,
  normalizeXentriWebhookPayload,
  mapXentriCollectionStatus,
  getXentriCollectionStatus,
} from '../server/lib/xentripay.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Verify webhook signature
  const headerSecret = req.headers['x-xentripay-webhook-secret']
  const authHeader = req.headers['authorization']
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined
  const secret = headerSecret || bearer

  if (!verifyXentriWebhookSecret(secret)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const payload = req.body || {}
  const normalized = normalizeXentriWebhookPayload(payload)

  if (!normalized.refid && !normalized.customerReference) {
    return res.status(200).json({ ok: true, handled: 'skipped' })
  }

  const mapped = normalized.status ? mapXentriCollectionStatus(normalized.status) : 'pending'
  if (mapped === 'pending') {
    return res.status(200).json({ ok: true, handled: 'pending' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Database unavailable' })
  }

  let targetPurchase = null

  // Try to find purchase by provider_ref_id
  if (normalized.refid) {
    const { data: purchase } = await supabase
      .from('institution_course_purchases')
      .select('*')
      .eq('provider_ref_id', normalized.refid)
      .maybeSingle()
    targetPurchase = purchase
  }

  // Try to find by customer reference (purchase ID)
  if (!targetPurchase && normalized.customerReference) {
    const { data: byCustomerRef } = await supabase
      .from('institution_course_purchases')
      .select('*')
      .eq('id', normalized.customerReference)
      .maybeSingle()
    targetPurchase = byCustomerRef
  }

  if (!targetPurchase) {
    return res.status(200).json({ ok: true, handled: 'no_purchase' })
  }

  // Skip if already processed
  if (targetPurchase.status === 'completed' || targetPurchase.status === 'approved') {
    return res.status(200).json({ ok: true, handled: 'already_processed' })
  }

  // Double-check with XentriPay API before updating (defense in depth)
  let verifiedStatus = mapped
  const statusRefId = targetPurchase.provider_ref_id || normalized.refid
  try {
    if (statusRefId) {
      const statusRes = await getXentriCollectionStatus(statusRefId)
      verifiedStatus = mapXentriCollectionStatus(statusRes.status)
    }
  } catch (e) {
    console.error('[institutional-payment-webhook] status verification failed:', e.message)
    return res.status(200).json({ ok: true, handled: 'verification_failed' })
  }

  if (verifiedStatus === 'pending') {
    return res.status(200).json({ ok: true, handled: 'pending' })
  }

  // Update purchase status
  const newStatus = verifiedStatus === 'success' ? 'completed' : 'failed'
  
  const { error: updateError } = await supabase
    .from('institution_course_purchases')
    .update({
      status: newStatus,
      payment_confirmed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      webhook_data: payload
    })
    .eq('id', targetPurchase.id)

  if (updateError) {
    console.error('[institutional-payment-webhook] update failed:', updateError)
    return res.status(500).json({ success: false, error: 'Update failed' })
  }

  console.log(`[institutional-payment-webhook] Purchase ${targetPurchase.id} status: ${newStatus}`)

  return res.status(200).json({ ok: true, handled: 'updated', status: newStatus })
}
