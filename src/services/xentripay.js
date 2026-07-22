/**
 * XentriPay Payment Gateway Service
 * Handles payment initialization, verification, and processing
 */

const XENTRIPAY_API_KEY = import.meta.env.VITE_XENTRIPAY_API_KEY
const XENTRIPAY_BASE_URL = import.meta.env.VITE_XENTRIPAY_BASE_URL || 'https://api.xentripay.com/v1'
const XENTRIPAY_MODE = import.meta.env.VITE_XENTRIPAY_MODE || 'test'

class XentriPayService {
  constructor() {
    this.apiKey = XENTRIPAY_API_KEY
    this.baseUrl = XENTRIPAY_BASE_URL
    this.mode = XENTRIPAY_MODE

    if (!this.apiKey) {
      console.warn('XentriPay API key not configured')
    }
  }

  /**
   * Initialize payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment response with payment URL
   */
  async initializePayment(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency || 'RWF',
          customer: {
            name: paymentData.customerName,
            email: paymentData.customerEmail,
            phone: paymentData.customerPhone
          },
          metadata: {
            course_id: paymentData.courseId,
            course_title: paymentData.courseTitle,
            user_id: paymentData.userId,
            enrollment_id: paymentData.enrollmentId
          },
          callback_url: paymentData.callbackUrl,
          return_url: paymentData.returnUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Payment initialization failed')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay initialization error:', error)
      throw error
    }
  }

  /**
   * Verify payment status
   * @param {string} transactionId - Transaction reference
   * @returns {Promise<Object>} Payment verification result
   */
  async verifyPayment(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Payment verification failed')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay verification error:', error)
      throw error
    }
  }

  /**
   * Get available payment methods
   * @returns {Promise<Array>} List of payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }

      return await response.json()
    } catch (error) {
      console.error('Payment methods error:', error)
      // Return default Rwanda payment methods
      return this.getDefaultPaymentMethods()
    }
  }

  /**
   * Get default payment methods for Rwanda
   * @returns {Array} Default payment methods
   */
  getDefaultPaymentMethods() {
    return [
      {
        id: 'mtn_momo',
        name: 'MTN Mobile Money',
        icon: '📱',
        description: 'Pay with MTN MoMo',
        popular: true
      },
      {
        id: 'airtel_money',
        name: 'Airtel Money',
        icon: '📱',
        description: 'Pay with Airtel Money',
        popular: true
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard',
        popular: false
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: '🏦',
        description: 'Direct bank payment',
        popular: false
      }
    ]
  }

  /**
   * Process refund
   * @param {string} transactionId - Original transaction ID
   * @param {number} amount - Amount to refund
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(transactionId, amount, reason = '') {
    try {
      const response = await fetch(`${this.baseUrl}/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          amount: amount,
          reason: reason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Refund failed')
      }

      return await response.json()
    } catch (error) {
      console.error('XentriPay refund error:', error)
      throw error
    }
  }

  /**
   * Get transaction details
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransaction(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Mode': this.mode
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transaction')
      }

      return await response.json()
    } catch (error) {
      console.error('Get transaction error:', error)
      throw error
    }
  }

  /**
   * Get supported currencies
   * @returns {Array} Supported currencies
   */
  getSupportedCurrencies() {
    return [
      { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' }
    ]
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency = 'RWF') {
    const symbols = { RWF: 'FRw', USD: '$', EUR: '€' }
    const symbol = symbols[currency] || currency
    
    return `${symbol} ${amount.toLocaleString()}`
  }

  /**
   * Validate payment amount
   * @param {number} amount - Amount to validate
   * @param {string} currency - Currency code
   * @returns {boolean} Whether amount is valid
   */
  validateAmount(amount, currency = 'RWF') {
    const minAmounts = { RWF: 100, USD: 1, EUR: 1 }
    const maxAmounts = { RWF: 10000000, USD: 10000, EUR: 10000 }

    const min = minAmounts[currency] || 1
    const max = maxAmounts[currency] || 1000000

    return amount >= min && amount <= max
  }

  /**
   * Check if payment gateway is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return !!this.apiKey && !!this.baseUrl
  }

  /**
   * Get configuration status
   * @returns {Object} Configuration details
   */
  getConfig() {
    return {
      configured: this.isConfigured(),
      mode: this.mode,
      baseUrl: this.baseUrl
    }
  }
}

// Export singleton instance
export default new XentriPayService()
