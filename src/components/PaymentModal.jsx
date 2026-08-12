import React, { useState, useEffect } from 'react'
import {
  X, Smartphone, CreditCard, Phone,
  CheckCircle, XCircle, Loader, AlertCircle
} from 'lucide-react'
import { initiatePayment, checkPaymentStatus, formatPrice } from '../services/paymentService'
import './PaymentModal.css'

/**
 * Compact XentriPay checkout modal.
 * MoMo: in-app prompt + status poll.
 * Card: popup checkout (gateway blocks iframe) + status poll while staying on this page.
 */

const CARD_PAYMENT_ENABLED = import.meta.env.VITE_CARD_PAYMENT_ENABLED === 'true'
const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 60

function openCardCheckoutWindow(url) {
  const width = Math.min(520, window.screen.availWidth - 40)
  const height = Math.min(720, window.screen.availHeight - 60)
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
  const features = [
    `popup=yes`,
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'noopener=no',
    'noreferrer=no',
  ].join(',')

  return window.open(url, 'shora_xentripay_checkout', features)
}

const PaymentModal = ({ course, user, onClose, onSuccess }) => {
  const [step, setStep] = useState('method')
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [phone, setPhone] = useState('')
  const [referenceId, setReferenceId] = useState(null)
  const [cardCheckoutUrl, setCardCheckoutUrl] = useState(null)
  const [cardPopup, setCardPopup] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if ((step !== 'confirming' && step !== 'card_checkout') || !referenceId) return

    let polls = 0
    const interval = setInterval(async () => {
      const status = await checkPaymentStatus(referenceId)

      if (status.status === 'success') {
        clearInterval(interval)
        try { cardPopup?.close() } catch { /* ignore */ }
        setCardPopup(null)
        setStep('success')
      } else if (status.status === 'failed') {
        clearInterval(interval)
        try { cardPopup?.close() } catch { /* ignore */ }
        setCardPopup(null)
        setError('Payment was not completed. Please try again.')
        setStep('failed')
      }

      polls += 1
      if (polls >= MAX_POLLS) clearInterval(interval)
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [step, referenceId, cardPopup])

  useEffect(() => {
    if (step !== 'card_checkout' || !cardPopup) return

    const watch = setInterval(() => {
      if (cardPopup.closed) {
        clearInterval(watch)
        setCardPopup(null)
      }
    }, 800)

    return () => clearInterval(watch)
  }, [step, cardPopup])

  const handlePay = async () => {
    if (!phone.trim()) {
      setError(
        paymentMethod === 'card'
          ? 'Enter your phone number to proceed to card payment'
          : 'Enter your MoMo number'
      )
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

      if (paymentMethod === 'card' && result.redirectUrl) {
        setCardCheckoutUrl(result.redirectUrl)
        const popup = openCardCheckoutWindow(result.redirectUrl)
        if (popup) {
          setCardPopup(popup)
          setStep('card_checkout')
        } else {
          // Popup blocked — stay in app and offer a manual open, or fall back to same tab
          setStep('card_checkout')
        }
        return
      }

      setStep('confirming')
    } else {
      if (result.referenceId) setReferenceId(result.referenceId)
      setError(result.error || 'Failed to start payment')
      setStep('failed')
    }
  }

  const reopenCardCheckout = () => {
    if (!cardCheckoutUrl) return
    if (cardPopup && !cardPopup.closed) {
      try { cardPopup.focus() } catch { /* ignore */ }
      return
    }
    const popup = openCardCheckoutWindow(cardCheckoutUrl)
    if (popup) setCardPopup(popup)
  }

  const priceLabel = formatPrice(course.price, course.currency)

  return (
    <div
      className="modal-overlay"
      onClick={step === 'confirming' || step === 'card_checkout' ? undefined : onClose}
    >
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {step === 'success' ? 'Payment successful'
              : step === 'failed' ? 'Payment failed'
              : step === 'confirming' ? 'Approve on your phone'
              : step === 'card_checkout' ? 'Complete card payment'
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
                <p className="field-hint">
                  {paymentMethod === 'momo'
                    ? 'Enter the MTN MoMo number that will receive the payment prompt.'
                    : 'Enter your phone number to continue. A secure payment window will open — you stay on this page.'}
                </p>
              </div>

              {error && (
                <div className="alert alert-error compact">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="button" className="btn btn-primary btn-full pay-cta" onClick={handlePay}>
                {paymentMethod === 'card' ? 'Proceed to pay' : `Pay ${priceLabel}`}
              </button>
              <button type="button" className="link-cancel" onClick={onClose}>
                Cancel
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="payment-state compact">
              <Loader size={36} className="spinning state-icon processing" />
              <p className="state-title">
                {paymentMethod === 'card'
                  ? 'Preparing secure card payment…'
                  : 'Sending payment request…'}
              </p>
            </div>
          )}

          {step === 'card_checkout' && (
            <div className="payment-state compact">
              <div className="state-circle confirming">
                <CreditCard size={28} />
              </div>
              <p className="state-title">Complete payment in the secure window</p>
              <p className="state-text">
                Finish your card payment for <strong>{priceLabel}</strong> in the
                checkout window. This page will update automatically when it succeeds.
              </p>
              <div className="state-waiting">
                <Loader size={14} className="spinning" />
                Waiting for confirmation…
              </div>
              {referenceId && <span className="payment-ref">{referenceId}</span>}
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={reopenCardCheckout}
              >
                {cardPopup && !cardPopup.closed ? 'Focus payment window' : 'Reopen payment window'}
              </button>
              <button
                type="button"
                className="link-cancel"
                onClick={() => {
                  try { cardPopup?.close() } catch { /* ignore */ }
                  setCardPopup(null)
                  setStep('method')
                  setError(null)
                }}
              >
                Cancel
              </button>
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
                  setCardCheckoutUrl(null)
                  setCardPopup(null)
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
