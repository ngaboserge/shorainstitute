/**
 * Serverless Function: Institutional Payment Status
 * GET /api/institutional-payment-status?purchase_id=PURCHASE_ID
 *
 * Check the payment status for an institutional course purchase
 */

import { getSupabaseAdmin } from '../server/lib/supabase-payments.js'
import {
  getXentriCollectionStatus,
  mapXentriCollectionStatus,
} from '../server/lib/xentripay.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const purchaseId = req.query.purchase_id

  if (!purchaseId) {
    return res.status(400).json({
      success: false,
      error: 'Missing purchase_id parameter',
    })
  }

  try {
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database unavailable' })
    }

    // Get purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('institution_course_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found',
      })
    }

    // If already completed or failed, return that status
    if (purchase.status === 'completed' || purchase.status === 'failed') {
      return res.status(200).json({
        success: purchase.status === 'completed',
        status: purchase.status,
        purchaseId: purchase.id,
      })
    }

    // Check with payment gateway if we have a provider reference
    if (purchase.provider_ref_id) {
      try {
        const statusRes = await getXentriCollectionStatus(purchase.provider_ref_id)
        const normalizedStatus = mapXentriCollectionStatus(statusRes.status)

        // Update our database if status changed
        if (normalizedStatus === 'success' || normalizedStatus === 'failed') {
          const newStatus = normalizedStatus === 'success' ? 'completed' : 'failed'
          
          await supabase
            .from('institution_course_purchases')
            .update({
              status: newStatus,
              payment_confirmed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            })
            .eq('id', purchase.id)

          return res.status(200).json({
            success: normalizedStatus === 'success',
            status: newStatus,
            purchaseId: purchase.id,
          })
        }

        return res.status(200).json({
          success: false,
          status: 'pending',
          purchaseId: purchase.id,
        })

      } catch (error) {
        console.error('[institutional-payment-status] Gateway check failed:', error.message)
        // Return current database status if gateway check fails
        return res.status(200).json({
          success: false,
          status: purchase.status,
          purchaseId: purchase.id,
        })
      }
    }

    // No provider reference yet, return pending
    return res.status(200).json({
      success: false,
      status: 'pending',
      purchaseId: purchase.id,
    })

  } catch (error) {
    console.error('[institutional-payment-status] Error:', error.message)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}
