import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Ticket, Download, Mail, Search, Copy, AlertCircle, CheckCircle, X, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useInstitutionalAuth } from '../../hooks/useInstitutionalAuth'
import './ManageCodes.css'

const ManageCodes = () => {
  const { institution } = useInstitutionalAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSeats: 0,
    codesGenerated: 0,
    codesRedeemed: 0
  })
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showViewCodesModal, setShowViewCodesModal] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    quantity: 10,
    codeType: 'single_use',
    expiryDate: ''
  })
  const [codes, setCodes] = useState([])
  const [selectedCodes, setSelectedCodes] = useState([])
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (institution) {
      fetchPurchases()
    }
  }, [institution])

  const fetchPurchases = async () => {
    try {
      setLoading(true)

      // Fetch purchases with course details
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('institution_course_purchases')
        .select(`
          *,
          courses (
            id,
            title,
            category,
            thumbnail_url,
            instructor_name
          )
        `)
        .eq('institution_id', institution.id)
        .order('purchased_at', { ascending: false })

      if (purchasesError) throw purchasesError

      setPurchases(purchasesData || [])

      // Calculate stats
      const totalSeats = purchasesData?.reduce((sum, p) => sum + p.quantity, 0) || 0
      const codesGenerated = purchasesData?.reduce((sum, p) => sum + (p.codes_generated || 0), 0) || 0
      const codesRedeemed = purchasesData?.reduce((sum, p) => sum + (p.codes_redeemed || 0), 0) || 0

      setStats({ totalSeats, codesGenerated, codesRedeemed })

    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateClick = (purchase) => {
    setSelectedPurchase(purchase)
    setShowGenerateModal(true)
    
    // Set default expiry to 6 months from now
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
    setGenerateForm({
      quantity: Math.min(10, purchase.quantity - (purchase.codes_generated || 0)),
      codeType: 'single_use',
      expiryDate: sixMonthsFromNow.toISOString().split('T')[0]
    })
  }

  const handleGenerateCodes = async () => {
    if (!selectedPurchase) return

    setProcessing(true)
    try {
      const codes = []
      
      // Generate unique codes
      for (let i = 0; i < generateForm.quantity; i++) {
        // Call the generate_enrollment_code function
        const { data: generatedCode, error: codeError } = await supabase
          .rpc('generate_enrollment_code')

        if (codeError) throw codeError

        // Insert code record
        const { data: codeRecord, error: insertError } = await supabase
          .from('institution_enrollment_codes')
          .insert({
            purchase_id: selectedPurchase.id,
            course_id: selectedPurchase.course_id,
            institution_id: institution.id,
            code: generatedCode,
            code_type: generateForm.codeType,
            status: 'active',
            approval_status: 'none',
            expires_at: generateForm.expiryDate ? new Date(generateForm.expiryDate).toISOString() : null
          })
          .select()
          .single()

        if (insertError) throw insertError
        codes.push(codeRecord)
      }

      // Update purchase statistics
      const { error: updateError } = await supabase
        .from('institution_course_purchases')
        .update({
          codes_generated: selectedPurchase.codes_generated + generateForm.quantity
        })
        .eq('id', selectedPurchase.id)

      if (updateError) throw updateError

      alert(`Successfully generated ${generateForm.quantity} enrollment codes!`)
      setShowGenerateModal(false)
      fetchPurchases()

    } catch (error) {
      console.error('Error generating codes:', error)
      alert('Failed to generate codes. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleViewCodes = async (purchase) => {
    setSelectedPurchase(purchase)
    setShowViewCodesModal(true)
    setLoading(true)

    try {
      // Fetch codes for this purchase
      const { data: codesData, error: codesError } = await supabase
        .from('institution_enrollment_codes')
        .select(`
          *,
          code_redemption_requests (
            user_name,
            user_email,
            status
          )
        `)
        .eq('purchase_id', purchase.id)
        .order('created_at', { ascending: false })

      if (codesError) throw codesError

      setCodes(codesData || [])
      setSelectedCodes([])
    } catch (error) {
      console.error('Error fetching codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (codes.length === 0) return

    const csv = [
      ['Code', 'Type', 'Status', 'Redeemed By', 'Generated On', 'Expires'],
      ...codes.map(c => [
        c.code,
        c.code_type === 'single_use' ? 'Single Use' : 'Multi Use',
        c.status,
        c.redeemed_by ? c.code_redemption_requests?.[0]?.user_email || 'Unknown' : 'Not redeemed',
        new Date(c.created_at).toLocaleDateString(),
        c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'No expiry'
      ])
    ]

    const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `enrollment-codes-${selectedPurchase?.courses?.title}-${Date.now()}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const handleCopySelected = () => {
    const selectedCodesList = codes
      .filter(c => selectedCodes.includes(c.id))
      .map(c => c.code)
      .join('\n')

    navigator.clipboard.writeText(selectedCodesList)
    alert(`Copied ${selectedCodes.length} codes to clipboard!`)
  }

  const handleSelectAll = () => {
    if (selectedCodes.length === codes.length) {
      setSelectedCodes([])
    } else {
      setSelectedCodes(codes.map(c => c.id))
    }
  }

  const toggleCodeSelection = (codeId) => {
    setSelectedCodes(prev =>
      prev.includes(codeId)
        ? prev.filter(id => id !== codeId)
        : [...prev, codeId]
    )
  }

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.code_redemption_requests?.[0]?.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAvailableSeats = (purchase) => {
    return purchase.quantity - (purchase.codes_generated || 0)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Manage Enrollment Codes"
          subtitle="Generate and distribute codes from your course purchases"
        />
        
        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid-3">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Ticket size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Seats Purchased</div>
                <div className="stat-value">{stats.totalSeats}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Codes Generated</div>
                <div className="stat-value">{stats.codesGenerated}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Download size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Codes Redeemed</div>
                <div className="stat-value">{stats.codesRedeemed}</div>
              </div>
            </div>
          </div>

          {/* Purchases List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Your Course Purchases</h3>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ color: '#666', marginTop: '16px' }}>Loading purchases...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Ticket size={64} style={{ color: '#ccc', margin: '0 auto 24px' }} />
                <h3 style={{ marginBottom: '12px', color: '#666' }}>No Purchases Yet</h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>Purchase courses to generate enrollment codes for your employees.</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/institutional/billing/purchase'}>
                  Purchase Courses
                </button>
              </div>
            ) : (
              <div className="purchases-list">
                {purchases.map((purchase) => {
                  const availableSeats = getAvailableSeats(purchase)
                  const usagePercent = purchase.quantity > 0 
                    ? Math.round(((purchase.codes_generated || 0) / purchase.quantity) * 100)
                    : 0

                  return (
                    <div key={purchase.id} className="purchase-card">
                      <div className="purchase-header">
                        {purchase.courses?.thumbnail_url && (
                          <img 
                            src={purchase.courses.thumbnail_url}
                            alt={purchase.courses.title}
                            className="purchase-thumbnail"
                          />
                        )}
                        <div className="purchase-info">
                          <h4>{purchase.courses?.title || 'Course'}</h4>
                          <p className="purchase-instructor">
                            By {purchase.courses?.instructor_name || 'Instructor'}
                          </p>
                          <p className="purchase-date">
                            Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="purchase-stats">
                        <div className="purchase-stat">
                          <div className="stat-label">Total Seats</div>
                          <div className="stat-value">{purchase.quantity}</div>
                        </div>
                        <div className="purchase-stat">
                          <div className="stat-label">Codes Generated</div>
                          <div className="stat-value">{purchase.codes_generated || 0}</div>
                        </div>
                        <div className="purchase-stat">
                          <div className="stat-label">Codes Redeemed</div>
                          <div className="stat-value">{purchase.codes_redeemed || 0}</div>
                        </div>
                        <div className="purchase-stat">
                          <div className="stat-label">Available</div>
                          <div className="stat-value">{availableSeats}</div>
                        </div>
                      </div>

                      <div className="purchase-progress">
                        <div className="progress-info">
                          <span>Usage: {usagePercent}%</span>
                          <span>{purchase.codes_generated || 0} of {purchase.quantity} seats</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${usagePercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="purchase-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleGenerateClick(purchase)}
                          disabled={availableSeats === 0}
                        >
                          <Ticket size={18} />
                          Generate Codes
                        </button>
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleViewCodes(purchase)}
                          disabled={(purchase.codes_generated || 0) === 0}
                        >
                          View Codes ({purchase.codes_generated || 0})
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Codes Modal */}
      {showGenerateModal && selectedPurchase && (
        <div className="modal-overlay" onClick={() => !processing && setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Enrollment Codes</h2>
              <button className="modal-close" onClick={() => !processing && setShowGenerateModal(false)} disabled={processing}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-box" style={{ marginBottom: '24px' }}>
                <AlertCircle size={20} style={{ color: '#0B4F9F' }} />
                <div>
                  <strong>{selectedPurchase.courses?.title}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                    Available seats: {getAvailableSeats(selectedPurchase)} of {selectedPurchase.quantity}
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Codes to Generate</label>
                <input
                  type="number"
                  className="form-input"
                  value={generateForm.quantity}
                  onChange={(e) => setGenerateForm({ 
                    ...generateForm, 
                    quantity: Math.min(getAvailableSeats(selectedPurchase), Math.max(1, parseInt(e.target.value) || 1))
                  })}
                  min="1"
                  max={getAvailableSeats(selectedPurchase)}
                  disabled={processing}
                />
                <small className="form-hint">
                  Maximum: {getAvailableSeats(selectedPurchase)} codes
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Code Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="codeType"
                      value="single_use"
                      checked={generateForm.codeType === 'single_use'}
                      onChange={(e) => setGenerateForm({ ...generateForm, codeType: e.target.value })}
                      disabled={processing}
                    />
                    <span>Single-use (one person per code)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="codeType"
                      value="multi_use"
                      checked={generateForm.codeType === 'multi_use'}
                      onChange={(e) => setGenerateForm({ ...generateForm, codeType: e.target.value })}
                      disabled={processing}
                    />
                    <span>Multi-use (unlimited uses until depleted)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={generateForm.expiryDate}
                  onChange={(e) => setGenerateForm({ ...generateForm, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={processing}
                />
                <small className="form-hint">
                  Leave empty for no expiry date
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowGenerateModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerateCodes}
                disabled={processing || generateForm.quantity === 0}
              >
                {processing ? 'Generating...' : `Generate ${generateForm.quantity} Code${generateForm.quantity > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Codes Modal */}
      {showViewCodesModal && selectedPurchase && (
        <div className="modal-overlay" onClick={() => setShowViewCodesModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enrollment Codes - {selectedPurchase.courses?.title}</h2>
              <button className="modal-close" onClick={() => setShowViewCodesModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: '250px' }}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {selectedCodes.length > 0 && (
                  <>
                    <button className="btn btn-outline" onClick={handleCopySelected}>
                      <Copy size={18} />
                      Copy Selected ({selectedCodes.length})
                    </button>
                    <button className="btn btn-outline" onClick={handleDownloadCSV}>
                      <Download size={18} />
                      Download CSV
                    </button>
                  </>
                )}
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                </div>
              ) : filteredCodes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No codes found</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={selectedCodes.length === codes.length && codes.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Redeemed By</th>
                        <th>Generated</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCodes.map((code) => (
                        <tr key={code.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedCodes.includes(code.id)}
                              onChange={() => toggleCodeSelection(code.id)}
                            />
                          </td>
                          <td>
                            <code style={{ 
                              background: '#f5f5f5', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontSize: '13px'
                            }}>
                              {code.code}
                            </code>
                          </td>
                          <td>
                            <span className={`badge ${code.code_type === 'single_use' ? 'badge-blue' : 'badge-purple'}`}>
                              {code.code_type === 'single_use' ? 'Single Use' : 'Multi Use'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              code.status === 'active' ? 'badge-green' : 
                              code.status === 'redeemed' ? 'badge-orange' : 
                              'badge-gray'
                            }`}>
                              {code.status}
                            </span>
                          </td>
                          <td>
                            {code.redeemed_by ? (
                              <span>{code.code_redemption_requests?.[0]?.user_email || 'Unknown'}</span>
                            ) : (
                              <span style={{ color: '#999' }}>Not redeemed</span>
                            )}
                          </td>
                          <td>{new Date(code.created_at).toLocaleDateString()}</td>
                          <td>
                            {code.expires_at ? (
                              new Date(code.expires_at).toLocaleDateString()
                            ) : (
                              <span style={{ color: '#999' }}>No expiry</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowViewCodesModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleDownloadCSV}>
                <Download size={18} />
                Download All as CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCodes
