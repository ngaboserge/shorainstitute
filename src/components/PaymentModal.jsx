import React, { useState, useEffect } from 'react'
import {
  X, DollarSign, Smartphone, CreditCard, Phone,
  CheckCircle, XCircle, Loader, AlertCircle
} from 'lucide-react'
import { initiatePayment, checkPaymentStatus, formatPrice } from '../services/paymentService'
import './PaymentModal.css'

/**
 * XentriPay checkout modal.
 * MoMo: sends a payment prompt to the learner's phone, then polls status.
 * Card: redirects to the XentriPay hosted checkout page.
 * Enrollment is created server-side only after the gateway confirms payment.
 */

const CARD_PAYMENT_ENABLED = import.meta.env.VITE_CARD_PAYMENT_ENABLED === 'true'
const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 60 // ~5 minutes

const PaymentModal = ({ course, user, onClose, onSuccess }) => {
  const [step, setStep] = useState('method') // method | processing | confirming | success | failed
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [phone, setPhone] = useState('')
  const [referenceId, setReferenceId] = useState(null)
  const [gatewayMessage, setGatewayMessage] = useState(null)
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
      if (polls >= MAX_POLLS) {
        clearInterval(interval)
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [step, referenceId])

  const handlePay = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }

    setError(null)
    setGatewayMessage(null)
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
      setGatewayMessage(
        result.confirmationMessage ||
          (paymentMethod === 'momo'
            ? 'Approve the payment prompt on your phone to continue.'
            : 'Complete your payment on the secure checkout page.')
      )
      setStep('confirming')

      if (paymentMethod === 'card' && result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } else {
      if (result.referenceId) setReferenceId(result.referenceId)
      setError(result.error || 'Failed to initiate payment')
      setStep('failed')
    }
  }

  return (
    <div className="modal-overlay" onClick={step === 'confirming' ? undefined : onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>
              {step === 'success' ? 'Payment Successful!'
                : step === 'failed' ? 'Payment Failed'
                : step === 'confirming' ? 'Confirm Your Payment'
                : 'Complete Payment'}
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Secure payment via XentriPay
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="summary-header">
              <DollarSign size={24} />
              <span>Payment Summary</span>
            </div>
            <div className="summary-content">
              <div className="summary-row">
                <span>Course:</span>
                <strong>{course.title}</strong>
              </div>
              <div className="summary-row">
                <span>Instructor:</span>
                <span>{course.instructor_name}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong className="amount">{formatPrice(course.price, course.currency)}</strong>
              </div>
            </div>
          </div>

          {step === 'method' && (
            <>
              <div className="form-group">
                <label>Payment Method *</label>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`method-option ${paymentMethod === 'momo' ? 'selected' : ''}`}
                >
                  <div className="method-icon momo">
                    <Smartphone size={20} />
                  </div>
                  <div className="method-info">
                    <strong>MTN Mobile Money</strong>
                    <span>Rwanda MoMo (RWF)</span>
                  </div>
                  {paymentMethod === 'momo' && <CheckCircle size={20} className="method-check" />}
                </button>

                <button
                  type="button"
                  onClick={() => CARD_PAYMENT_ENABLED && setPaymentMethod('card')}
                  disabled={!CARD_PAYMENT_ENABLED}
                  className={`method-option ${paymentMethod === 'card' ? 'selected' : ''} ${!CARD_PAYMENT_ENABLED ? 'disabled' : ''}`}
                >
                  <div className="method-icon card">
                    <CreditCard size={20} />
                  </div>
                  <div className="method-info">
                    <strong>Card Payment</strong>
                    <span>{CARD_PAYMENT_ENABLED ? 'Visa, Mastercard via XentriPay' : 'Coming soon — use MoMo for now'}</span>
                  </div>
                  {CARD_PAYMENT_ENABLED && paymentMethod === 'card' && <CheckCircle size={20} className="method-check" />}
                </button>
              </div>

              <div className="form-group">
                <label>
                  {paymentMethod === 'momo' ? 'MTN MoMo Phone Number *' : 'Phone Number *'}
                </label>
                <div className="input-with-icon">
                  <Phone size={20} />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder={paymentMethod === 'momo' ? '0788123456' : '+250 788 123 456'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
                <small className="help-text">
                  {paymentMethod === 'momo'
                    ? 'Rwanda MTN/Airtel number (e.g. 0788123456 or +250788123456)'
                    : 'Any phone number — local or international'}
                </small>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-notice">
                <AlertCircle size={18} />
                <div>
                  <strong>Pay before you enroll:</strong> Your course is unlocked automatically
                  as soon as your payment is confirmed by XentriPay.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handlePay}>
                  <CreditCard size={18} />
                  Pay {formatPrice(course.price, course.currency)}
                </button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="payment-state">
              <Loader size={48} className="spinning state-icon processing" />
              <p className="state-title">Starting payment…</p>
            </div>
          )}

          {step === 'confirming' && (
            <div className="payment-state">
              <div className="state-circle confirming">
                {paymentMethod === 'momo' ? <Smartphone size={32} /> : <CreditCard size={32} />}
              </div>
              <p className="state-title">Confirm your payment</p>
              {paymentMethod === 'momo' ? (
                <p className="state-text">
                  A payment prompt has been sent to your phone.<br />
                  <strong>Open MTN MoMo</strong> and approve the request to complete your purchase.
                </p>
              ) : (
                <p className="state-text">
                  Complete your payment on the secure card checkout page.
                </p>
              )}
              {gatewayMessage && <p className="gateway-message">{gatewayMessage}</p>}
              <div className="state-waiting">
                <Loader size={16} className="spinning" />
                Waiting for payment confirmation…
              </div>
              {referenceId && <span className="payment-ref">Ref: {referenceId}</span>}
            </div>
          )}

          {step === 'success' && (
            <div className="payment-state">
              <div className="state-circle success">
                <CheckCircle size={40} />
              </div>
              <p className="state-title">Payment Complete!</p>
              <p className="state-text">
                You have been enrolled in the course. You can now access all course content.
              </p>
              <button
                className="btn btn-primary btn-full"
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
              >
                Start Learning
              </button>
            </div>
          )}

          {step === 'failed' && (
            <div className="payment-state">
              <div className="state-circle failed">
                <XCircle size={40} />
              </div>
              <p className="state-title">Payment Failed</p>
              <div className="alert alert-error" style={{ textAlign: 'left' }}>
                <AlertCircle size={20} />
                <div>
                  <span>{error || 'Something went wrong. Please try again.'}</span>
                  {referenceId && (
                    <div className="payment-ref" style={{ marginTop: '6px' }}>Ref: {referenceId}</div>
                  )}
                </div>
              </div>
              <p className="help-text">
                If the problem persists, contact support with the reference above.
              </p>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setStep('method')
                    setError(null)
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
