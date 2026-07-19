import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { checkPaymentStatus } from '../../services/paymentService'
import './PaymentSuccess.css'

/**
 * Card checkout return page: /payment/success?ref=REFERENCE_ID
 * Polls the server until the gateway confirms or rejects the payment.
 */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const referenceId = searchParams.get('ref')

  const [status, setStatus] = useState('pending') // pending | success | failed

  useEffect(() => {
    if (!referenceId) {
      setStatus('failed')
      return
    }

    let polls = 0
    let cancelled = false

    const poll = async () => {
      const result = await checkPaymentStatus(referenceId)
      if (cancelled) return

      if (result.status === 'success') {
        setStatus('success')
        return
      }
      if (result.status === 'failed') {
        setStatus('failed')
        return
      }

      polls += 1
      if (polls < 24) {
        setTimeout(poll, 5000)
      } else {
        setStatus('failed')
      }
    }

    poll()
    return () => { cancelled = true }
  }, [referenceId])

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        {status === 'pending' && (
          <>
            <Loader size={48} className="result-icon pending spinning" />
            <h1>Verifying your payment…</h1>
            <p>Please wait while we confirm your payment with XentriPay.</p>
            {referenceId && <span className="result-ref">Ref: {referenceId}</span>}
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={56} className="result-icon success" />
            <h1>Payment Successful!</h1>
            <p>You have been enrolled in your course. Happy learning!</p>
            <button className="btn btn-primary" onClick={() => navigate('/learner/courses')}>
              Go to My Courses
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={56} className="result-icon failed" />
            <h1>Payment Not Confirmed</h1>
            <p>
              We could not confirm your payment. If you were charged, contact support
              {referenceId ? ' with the reference below' : ''}.
            </p>
            {referenceId && <span className="result-ref">Ref: {referenceId}</span>}
            <div className="result-actions">
              <Link to="/learner/browse" className="btn btn-secondary">Browse Courses</Link>
              <Link to="/learner/courses" className="btn btn-primary">My Courses</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccess
