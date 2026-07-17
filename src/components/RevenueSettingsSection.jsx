import React, { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Check, AlertCircle, Save, Edit2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const RevenueSettingsSection = ({ userId, profile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [settings, setSettings] = useState({
    commission_type: 'percentage',
    commission_value: 70,
    payout_method: 'bank_transfer',
    bank_account_name: '',
    bank_account_number: '',
    bank_name: '',
    mobile_money_number: '',
    mobile_money_provider: 'mtn',
    paypal_email: ''
  })

  useEffect(() => {
    if (profile) {
      setSettings({
        commission_type: profile.commission_type || 'percentage',
        commission_value: profile.commission_value || 70,
        payout_method: profile.payout_method || 'bank_transfer',
        bank_account_name: profile.bank_account_name || '',
        bank_account_number: profile.bank_account_number || '',
        bank_name: profile.bank_name || '',
        mobile_money_number: profile.mobile_money_number || '',
        mobile_money_provider: profile.mobile_money_provider || 'mtn',
        paypal_email: profile.paypal_email || ''
      })
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const calculateSplit = (coursePrice) => {
    const price = parseFloat(coursePrice) || 500 // Default example price
    let trainerAmount, platformAmount
    
    if (settings.commission_type === 'percentage') {
      trainerAmount = price * (settings.commission_value / 100)
      platformAmount = price - trainerAmount
    } else {
      // Fixed platform fee
      platformAmount = Math.min(parseFloat(settings.commission_value), price)
      trainerAmount = price - platformAmount
    }
    
    return { trainerAmount, platformAmount, totalPrice: price }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          commission_type: settings.commission_type,
          commission_value: parseFloat(settings.commission_value),
          payout_method: settings.payout_method,
          bank_account_name: settings.bank_account_name,
          bank_account_number: settings.bank_account_number,
          bank_name: settings.bank_name,
          mobile_money_number: settings.mobile_money_number,
          mobile_money_provider: settings.mobile_money_provider,
          paypal_email: settings.paypal_email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setSuccessMessage('Revenue settings saved successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving revenue settings:', error)
      setErrorMessage('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const split = calculateSplit(500)

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="section-header">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} />
            Revenue Sharing & Payout Settings
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            Configure how revenue is split and how you receive payouts
          </p>
        </div>
        <button 
          className="btn-text"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit2 size={16} />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {successMessage && (
        <div style={{
          padding: '12px',
          background: '#d1fae5',
          color: '#065f46',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '12px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* Revenue Split Settings */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
          Commission Structure
        </h4>
        
        {isEditing ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Commission Type
              </label>
              <select
                name="commission_type"
                value={settings.commission_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="percentage">Percentage Split (You get a % of course price)</option>
                <option value="fixed">Fixed Platform Fee (Platform gets fixed amount, you get rest)</option>
              </select>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {settings.commission_type === 'percentage' 
                  ? 'You receive a percentage of each course sale'
                  : 'Platform charges a fixed fee, you receive the remaining amount'}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                {settings.commission_type === 'percentage' 
                  ? 'Your Percentage (%)' 
                  : 'Platform Fixed Fee (USD)'}
              </label>
              <input
                type="number"
                name="commission_value"
                value={settings.commission_value}
                onChange={handleInputChange}
                min={settings.commission_type === 'percentage' ? 0 : 0}
                max={settings.commission_type === 'percentage' ? 100 : undefined}
                step={settings.commission_type === 'percentage' ? 1 : 0.01}
                style={{
                  width: '200px',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder={settings.commission_type === 'percentage' ? '70' : '50.00'}
              />
              <span style={{ marginLeft: '8px', color: '#666' }}>
                {settings.commission_type === 'percentage' ? '%' : 'USD'}
              </span>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {settings.commission_type === 'percentage'
                  ? `You get ${settings.commission_value}%, Platform gets ${100 - settings.commission_value}%`
                  : `Platform gets $${settings.commission_value} per sale, you get the rest`}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 500 }}>Structure:</span>
              <span>
                {settings.commission_type === 'percentage' 
                  ? `${settings.commission_value}% / ${100 - settings.commission_value}% split`
                  : `$${settings.commission_value} fixed platform fee`}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {settings.commission_type === 'percentage'
                ? `You receive ${settings.commission_value}% of each course sale, SHORA Institute receives ${100 - settings.commission_value}%`
                : `SHORA Institute receives $${settings.commission_value} per sale, you receive the remaining amount`}
            </div>
          </div>
        )}

        {/* Example Calculation */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#eff6ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#1e40af' }}>
            Example: $500 Course
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#666', fontSize: '12px' }}>You Receive:</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0B4F9F' }}>
                ${split.trainerAmount.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '12px' }}>Platform Fee:</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#666' }}>
                ${split.platformAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Method Settings */}
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
          Payout Method
        </h4>
        
        {isEditing ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Preferred Payout Method
              </label>
              <select
                name="payout_method"
                value={settings.payout_method}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {/* Bank Transfer Fields */}
            {settings.payout_method === 'bank_transfer' && (
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Bank Account Details</h5>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Account Holder Name</label>
                  <input
                    type="text"
                    name="bank_account_name"
                    value={settings.bank_account_name}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Full name on account"
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Account Number</label>
                  <input
                    type="text"
                    name="bank_account_number"
                    value={settings.bank_account_number}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={settings.bank_name}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="e.g., Bank of Kigali"
                  />
                </div>
              </div>
            )}

            {/* Mobile Money Fields */}
            {settings.payout_method === 'mobile_money' && (
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Mobile Money Details</h5>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Provider</label>
                  <select
                    name="mobile_money_provider"
                    value={settings.mobile_money_provider}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile_money_number"
                    value={settings.mobile_money_number}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
              </div>
            )}

            {/* PayPal Fields */}
            {settings.payout_method === 'paypal' && (
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>PayPal Details</h5>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>PayPal Email</label>
                  <input
                    type="email"
                    name="paypal_email"
                    value={settings.paypal_email}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Payout Settings'}
            </button>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CreditCard size={16} color="#0B4F9F" />
              <span style={{ fontWeight: 600 }}>
                {settings.payout_method === 'bank_transfer' ? 'Bank Transfer' :
                 settings.payout_method === 'mobile_money' ? 'Mobile Money' : 'PayPal'}
              </span>
            </div>
            {settings.payout_method === 'bank_transfer' && settings.bank_name && (
              <div style={{ fontSize: '13px', color: '#666' }}>
                {settings.bank_name} • {settings.bank_account_number ? `****${settings.bank_account_number.slice(-4)}` : 'Not set'}
              </div>
            )}
            {settings.payout_method === 'mobile_money' && settings.mobile_money_number && (
              <div style={{ fontSize: '13px', color: '#666' }}>
                {settings.mobile_money_provider.toUpperCase()} • {settings.mobile_money_number}
              </div>
            )}
            {settings.payout_method === 'paypal' && settings.paypal_email && (
              <div style={{ fontSize: '13px', color: '#666' }}>
                {settings.paypal_email}
              </div>
            )}
            {!settings.bank_name && !settings.mobile_money_number && !settings.paypal_email && (
              <div style={{ fontSize: '13px', color: '#999' }}>
                No payout details configured yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Box */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#fff7ed',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#9a3412'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Important:</strong> Payouts are processed monthly. Revenue from approved course payments will be transferred to your account by the 15th of each month.
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueSettingsSection
