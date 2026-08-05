import React, { useState, useEffect } from 'react'
import {
  X, Smartphone, CreditCard, Phone,
  CheckCircle, XCircle, Loader, AlertCircle
} from 'lucide-react'
import { initiatePayment, checkPaymentStatus, formatPrice } from '../services/paymentService'
import './PaymentModal.css'

/**
 * Compact XentriPay checkout modal.
 * MoMo prompt + status poll; card redirects when enabled.
 */

const CARD_PAYMENT_ENABLED = import.meta.env.VITE_CARD_PAYMENT_ENABLED === 'true'
const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 60

const PaymentModal = ({ course, user, onClose, onSuccess }) => {
  const [step, setStep] = useState('method')
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [phone, setPhone] = useState('')
  const [referenceId, setReferenceId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (step !== 'confirming' || !referenceId) return

    let polls = 0
    const interval = setInterval(async () => {
      const status = await checkPaymentStatus(referenceId)

      if (status.status === 'success') {
        clearInterval(interval)
        setStep('success')
      } else if (status.status === 'failed') {
        clearInterval(interval)
        setError('Payment was not completed. Please try again.')
        setStep('failed')
      }

      polls += 1
      if (polls >= MAX_POLLS) clearInterval(interval)
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [step, referenceId])

  const handlePay = async () => {
    if (!phone.trim()) {
      setError('Enter your phone number')
      return
    }

    setError(null)
    setStep('processing')

    const result = await initiatePayment({
      courseId: course.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      phone,
      paymentMethod
    })

    if (result.success && result.referenceId) {
      setReferenceId(result.referenceId)
      setStep('confirming')

      if (paymentMethod === 'card' && result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } else {
      if (result.referenceId) setReferenceId(result.referenceId)
      setError(result.error || 'Failed to start payment')
      setStep('failed')
    }
  }

  const priceLabel = formatPrice(course.price, course.currency)

  return (
    <div className="modal-overlay" onClick={step === 'confirming' ? undefined : onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {step === 'success' ? 'Payment successful'
              : step === 'failed' ? 'Payment failed'
              : step === 'confirming' ? 'Approve on your phone'
              : step === 'processing' ? 'Starting…'
              : 'Pay to enroll'}
          </h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {(step === 'method' || step === 'processing') && (
            <div className="payment-summary compact">
              <div className="summary-main">
                <span className="summary-course">{course.title}</span>
                <strong className="amount">{priceLabel}</strong>
              </div>
            </div>
          )}

          {step === 'method' && (
            <>
              {CARD_PAYMENT_ENABLED && (
                <div className="method-toggle">
                  <button
                    type="button"
                    className={`method-chip ${paymentMethod === 'momo' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                  >
                    <Smartphone size={16} />
                    MoMo
                  </button>
                  <button
                    type="button"
                    className={`method-chip ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={16} />
                    Card
                  </button>
                </div>
              )}

              <div className="form-group compact">
                <label htmlFor="pay-phone">
                  {paymentMethod === 'momo' ? 'MoMo number' : 'Phone number'}
                </label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    id="pay-phone"
                    type="tel"
                    className="form-input"
                    placeholder="078xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-error compact">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="button" className="btn btn-primary btn-full pay-cta" onClick={handlePay}>
                Pay {priceLabel}
              </button>
              <button type="button" className="link-cancel" onClick={onClose}>
                Cancel
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="payment-state compact">
              <Loader size={36} className="spinning state-icon processing" />
              <p className="state-title">Sending payment request…</p>
            </div>
          )}

          {step === 'confirming' && (
            <div className="payment-state compact">
              <div className="state-circle confirming">
                <Smartphone size={28} />
              </div>
              <p className="state-title">Approve on your phone</p>
              <p className="state-text">
                Open MTN MoMo and confirm the payment for <strong>{priceLabel}</strong>.
              </p>
              <div className="state-waiting">
                <Loader size={14} className="spinning" />
                Waiting for confirmation…
              </div>
              {referenceId && <span className="payment-ref">{referenceId}</span>}
            </div>
          )}

          {step === 'success' && (
            <div className="payment-state compact">
              <div className="state-circle success">
                <CheckCircle size={32} />
              </div>
              <p className="state-title">You&apos;re enrolled</p>
              <p className="state-text">{course.title}</p>
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
              >
                Start learning
              </button>
            </div>
          )}

          {step === 'failed' && (
            <div className="payment-state compact">
              <div className="state-circle failed">
                <XCircle size={32} />
              </div>
              <p className="state-title">Payment failed</p>
              <p className="state-text">{error || 'Please try again.'}</p>
              {referenceId && <span className="payment-ref">{referenceId}</span>}
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => {
                  setStep('method')
                  setError(null)
                }}
              >
                Try again
              </button>
              <button type="button" className="link-cancel" onClick={onClose}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
