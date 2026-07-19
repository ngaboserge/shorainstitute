// Payment service — calls the /api payment endpoints (XentriPay).
// Prices are resolved server-side from the database, never from the client.

import { supabase } from '../lib/supabase'

async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  return headers
}

/**
 * Initiate a XentriPay payment for a course.
 * @param {{ courseId: string, email: string, name: string, phone: string, paymentMethod: 'momo' | 'card' }} request
 */
export async function initiatePayment(request) {
  try {
    const headers = await getAuthHeaders()
    if (!headers['Authorization']) {
      return { success: false, error: 'You must be logged in to pay' }
    }

    const response = await fetch('/api/payment-initiate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        courseId: request.courseId,
        email: request.email,
        name: request.name,
        phone: request.phone,
        paymentMethod: request.paymentMethod
      })
    })

    const data = await response.json()

    if (response.status === 401) {
      return { success: false, error: 'Session expired — please sign in again' }
    }

    return {
      success: data.success,
      status: data.status,
      referenceId: data.referenceId,
      redirectUrl: data.redirectUrl,
      amount: data.amount,
      currency: data.currency,
      message: data.message,
      confirmationMessage: data.confirmationMessage || data.message,
      error: data.success ? undefined : (data.error || 'Payment initiation failed')
    }
  } catch (error) {
    console.error('[Payment] Error:', error)
    return { success: false, error: 'Failed to connect to payment service' }
  }
}

/**
 * Check the status of a payment by reference ID.
 * Returns { status: 'pending' | 'success' | 'failed' }.
 */
export async function checkPaymentStatus(referenceId) {
  try {
    const params = new URLSearchParams({ ref: referenceId })
    const response = await fetch(`/api/payment-status?${params.toString()}`)
    const data = await response.json()

    return {
      success: data.success,
      status: data.status || 'pending',
      referenceId: data.referenceId || referenceId
    }
  } catch {
    return { success: false, status: 'pending', referenceId }
  }
}

export function formatPrice(amount, currency = 'RWF') {
  if (!amount || amount === 0) return 'Free'

  if (currency === 'USD') {
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (currency === 'EUR') {
    return `€${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return `RWF ${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
