import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Loader, XCircle } from 'lucide-react'
import { checkPaymentStatus } from '../../services/paymentService'
import './PaymentSuccess.css'

/**
 * Card checkout return page (same pattern as tutor-space):
 *   /payment/success?ref=REFERENCE_ID&payment=return
 *
 * XentriPay redirects the browser here after card payment.
 * We poll /api/payment-status until the gateway confirms —
 * enrollment is fulfilled server-side on success.
 */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ref = searchParams.get('ref')

  const [status, setStatus] = useState('checking') // checking | success | failed | pending

  useEffect(() => {
    if (!ref) {
      setStatus('failed')
      return
    }

    let cancelled = false
    let intervalId = null
    let timeoutId = null

    const applyStatus = (next) => {
      if (cancelled) return
      setStatus(next)
    }

    const pollOnce = async () => {
      const result = await checkPaymentStatus(ref)
      if (result.status === 'success') {
        applyStatus('success')
        return true
      }
      if (result.status === 'failed') {
        applyStatus('failed')
        return true
      }
      return false
    }

    const start = async () => {
      try {
        const done = await pollOnce()
        if (done || cancelled) return

        applyStatus('pending')
        intervalId = setInterval(async () => {
          const doneNow = await pollOnce()
          if (doneNow && intervalId) clearInterval(intervalId)
        }, 5000)

        // Stop polling after 2 minutes (same as tutor-space)
        timeoutId = setTimeout(() => {
          if (intervalId) clearInterval(intervalId)
        }, 120000)
      } catch {
        applyStatus('pending')
      }
    }

    start()

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [ref])

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        {status === 'checking' && (
          <>
            <Loader size={48} className="result-icon pending spinning" />
            <h1>Verifying payment…</h1>
            <p>Please wait while we confirm your payment with XentriPay.</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <Loader size={48} className="result-icon pending spinning" />
            <h1>Payment processing</h1>
            <p>
              Your payment is being confirmed. You will be enrolled automatically
              once it completes.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/learner/browse')}
            >
              Back to courses
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={56} className="result-icon success" />
            <h1>Payment successful!</h1>
            <p>You have been enrolled. You can now access your course content.</p>
            <div className="result-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/learner/courses')}
              >
                Go to My Courses
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/learner/browse')}
              >
                Browse more
              </button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={56} className="result-icon failed" />
            <h1>Payment failed</h1>
            <p>
              {ref
                ? 'There was an issue processing your payment. Please try again.'
                : 'Invalid payment reference. Please try purchasing again.'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/learner/browse')}
            >
              Back to courses
            </button>
          </>
        )}

        {ref && <span className="result-ref">Reference: {ref}</span>}
      </div>
    </div>
  )
}

export default PaymentSuccess
