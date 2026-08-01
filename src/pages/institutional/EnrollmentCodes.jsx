import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Ticket, Plus, Download, Copy, Check, ExternalLink, AlertCircle, Loader, RefreshCw, Clock, CheckCircle, XCircle, User, Briefcase, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import { useAuth } from '../../contexts/AuthContext'
import './Programmes.css'

const EnrollmentCodes = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [activeMainTab, setActiveMainTab] = useState('codes') // 'codes' or 'redemptions'
  const [purchases, setPurchases] = useState([])
  const [codes, setCodes] = useState([])
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalCodes: 0,
    codesRedeemed: 0,
    codesRemaining: 0,
    redemptionRate: 0,
    pendingRedemptions: 0,
    approvedRedemptions: 0,
    rejectedRedemptions: 0
  })
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    courseId: '',
    quantity: 1
  })
  const [courses, setCourses] = useState([])
  
  // Redemptions state
  const [activeRedemptionTab, setActiveRedemptionTab] = useState('pending')
  const [redemptionRequests, setRedemptionRequests] = useState([])
  const [processingId, setProcessingId] = useState(null)
  const [rejectionModal, setRejectionModal] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (institutionId) {
      fetchData()
      fetchCourses()
      fetchRedemptions()
    }
  }, [institutionId, activeRedemptionTab])

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('id, title, price, category')
        .eq('status', 'published')
        .order('title')
      
      setCourses(data || [])
    } catch (err) {
      console.error('Error fetching courses:', err)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('institution_course_purchases')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })

      if (purchasesError) throw purchasesError

      // Fetch courses for purchases
      if (purchasesData && purchasesData.length > 0) {
        const courseIds = [...new Set(purchasesData.map(p => p.course_id))]
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, thumbnail_url')
          .in('id', courseIds)

        const courseMap = {}
        coursesData?.forEach(c => {
          courseMap[c.id] = c
        })

        // Enrich purchases with course data
        const enrichedPurchases = purchasesData.map(p => ({
          ...p,
          course: courseMap[p.course_id]
        }))

        setPurchases(enrichedPurchases)

        // Calculate stats
        const totalCodes = purchasesData.reduce((sum, p) => sum + (p.codes_generated || 0), 0)
        const totalRedeemed = purchasesData.reduce((sum, p) => sum + (p.codes_redeemed || 0), 0)
        const redemptionRate = totalCodes > 0 ? ((totalRedeemed / totalCodes) * 100).toFixed(1) : 0

        setStats(prev => ({
          ...prev,
          totalPurchases: purchasesData.length,
          totalCodes,
          codesRedeemed: totalRedeemed,
          codesRemaining: totalCodes - totalRedeemed,
          redemptionRate
        }))
      }

    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRedemptions = async () => {
    try {
      // Fetch redemption requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('code_redemption_requests')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('status', activeRedemptionTab)
        .order('requested_at', { ascending: false })

      if (requestsError) throw requestsError

      // Get course and code details
      if (requestsData && requestsData.length > 0) {
        const courseIds = [...new Set(requestsData.map(r => r.course_id))]
        const codeIds = [...new Set(requestsData.map(r => r.code_id))]

        // Fetch courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, thumbnail_url')
          .in('id', courseIds)

        const courseMap = {}
        coursesData?.forEach(c => {
          courseMap[c.id] = c
        })

        // Fetch codes
        const { data: codesData } = await supabase
          .from('institution_enrollment_codes')
          .select('id, code')
          .in('id', codeIds)

        const codeMap = {}
        codesData?.forEach(c => {
          codeMap[c.id] = c
        })

        // Enrich requests
        const enrichedRequests = requestsData.map(r => ({
          ...r,
          course: courseMap[r.course_id],
          enrollmentCode: codeMap[r.code_id]
        }))

        setRedemptionRequests(enrichedRequests)
      } else {
        setRedemptionRequests([])
      }

      // Fetch stats
      const { data: statsData } = await supabase
        .from('code_redemption_requests')
        .select('status')
        .eq('institution_id', institutionId)

      const redemptionCounts = {
        pending: 0,
        approved: 0,
        rejected: 0
      }

      statsData?.forEach(s => {
        redemptionCounts[s.status]++
      })

      setStats(prev => ({
        ...prev,
        pendingRedemptions: redemptionCounts.pending,
        approvedRedemptions: redemptionCounts.approved,
        rejectedRedemptions: redemptionCounts.rejected
      }))

    } catch (err) {
      console.error('Error fetching redemptions:', err)
    }
  }

  const fetchCodesForPurchase = async (purchaseId) => {
    try {
      
      
      const { data, error } = await supabase
        .from('institution_enrollment_codes')
        .select('*')
        .eq('purchase_id', purchaseId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      
      setCodes(data || [])
      setSelectedPurchase(purchaseId)
      
      if (!data || data.length === 0) {
        alert('No codes found for this purchase. The codes may not have been generated properly.')
      } else {
        // Scroll to codes section after a short delay to allow render
        setTimeout(() => {
          const codesSection = document.getElementById('codes-display-section')
          if (codesSection) {
            codesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    } catch (err) {
      console.error('Error fetching codes:', err)
      alert('Failed to fetch codes: ' + err.message)
    }
  }

  const handleGenerateCodes = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const course = courses.find(c => c.id === generateForm.courseId)
      if (!course) throw new Error('Course not found')

      

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('institution_course_purchases')
        .insert({
          institution_id: institutionId,
          course_id: generateForm.courseId,
          quantity: parseInt(generateForm.quantity),
          price_per_seat: course.price || 0,
          total_amount: (course.price || 0) * parseInt(generateForm.quantity),
          status: 'active',
          purchased_by: user.id,
          purchased_at: new Date().toISOString(),
          codes_generated: 0, // Initialize to 0, will update after generating
          codes_redeemed: 0
        })
        .select()
        .single()

      if (purchaseError) {
        console.error('Purchase error:', purchaseError)
        throw purchaseError
      }

      

      // Generate codes
      const codesToGenerate = parseInt(generateForm.quantity)
      const codeInserts = []

      for (let i = 0; i < codesToGenerate; i++) {
        // Call the database function to generate unique code
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_enrollment_code')

        if (codeError) {
          console.error('Error generating code:', codeError)
          continue
        }

        if (codeData) {
          codeInserts.push({
            purchase_id: purchase.id,
            institution_id: institutionId,
            course_id: generateForm.courseId,
            code: codeData,
            code_type: 'single_use',
            max_uses: 1,
            status: 'active',
            generated_by: user.id,
            generated_at: new Date().toISOString()
          })
        }
      }

      // Insert all codes at once
      if (codeInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('institution_enrollment_codes')
          .insert(codeInserts)

        if (insertError) {
          console.error('Error inserting codes:', insertError)
          throw insertError
        }

        // Update purchase record with actual codes generated count
        const { error: updateError } = await supabase
          .from('institution_course_purchases')
          .update({ codes_generated: codeInserts.length })
          .eq('id', purchase.id)

        if (updateError) {
          console.error('Error updating purchase count:', updateError)
        }

        
      } else {
        throw new Error('Failed to generate any codes')
      }

      // Refresh data
      await fetchData()
      setShowGenerateModal(false)
      setGenerateForm({ courseId: '', quantity: 1 })
      alert(`Successfully generated ${codeInserts.length} enrollment codes!`)

    } catch (err) {
      console.error('Error generating codes:', err)
      alert('Failed to generate codes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadCodes = async (purchaseId) => {
    try {
      const { data } = await supabase
        .from('institution_enrollment_codes')
        .select('code, status, redeemed_at')
        .eq('purchase_id', purchaseId)

      if (!data) return

      const purchase = purchases.find(p => p.id === purchaseId)
      const csv = [
        'Code,Status,Redeemed At',
        ...data.map(c => `${c.code},${c.status},${c.redeemed_at || 'Not redeemed'}`)
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enrollment-codes-${purchase?.course?.title || 'codes'}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (err) {
      console.error('Error downloading codes:', err)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId)

      const { error } = await supabase
        .from('code_redemption_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      alert('Request approved successfully! Employee will be notified.')
      await fetchRedemptions()
      await fetchData() // Refresh code stats

    } catch (err) {
      console.error('Error approving request:', err)
      alert('Failed to approve request: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionModal || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      setProcessingId(rejectionModal.id)

      const { error } = await supabase
        .from('code_redemption_requests')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim()
        })
        .eq('id', rejectionModal.id)

      if (error) throw error

      alert('Request rejected. Employee will be notified.')
      setRejectionModal(null)
      setRejectionReason('')
      await fetchRedemptions()

    } catch (err) {
      console.error('Error rejecting request:', err)
      alert('Failed to reject request: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Enrollment Codes" />
          <div className="content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader size={48} className="spinner" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Enrollment Codes"
          subtitle="Generate and manage bulk enrollment codes for courses"
          actions={
            <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
              <Plus size={18} />
              Generate Codes
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Main Tabs */}
          <div className="programmes-tabs">
            <button 
              className={`tab ${activeMainTab === 'codes' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('codes')}
              style={{
                border: activeMainTab === 'codes' ? '2px solid #0B4F9F' : '2px solid #e0e0e0',
                borderRadius: '8px',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                background: activeMainTab === 'codes' ? '#f0f7ff' : 'white'
              }}
            >
              <Ticket size={18} style={{ marginRight: '8px' }} />
              Code Management
            </button>
            <button 
              className={`tab ${activeMainTab === 'redemptions' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('redemptions')}
              style={{
                border: activeMainTab === 'redemptions' ? '2px solid #0B4F9F' : '2px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                background: activeMainTab === 'redemptions' ? '#f0f7ff' : 'white'
              }}
            >
              <CheckCircle size={18} style={{ marginRight: '8px' }} />
              Redemption Requests
              {stats.pendingRedemptions > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: '#FDB714',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {stats.pendingRedemptions}
                </span>
              )}
            </button>
          </div>

          {/* CODE MANAGEMENT TAB */}
          {activeMainTab === 'codes' && (
            <>
              {/* Stats */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '32px' }}>
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Ticket size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Purchases</div>
                    <div className="stat-value">{stats.totalPurchases}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Ticket size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Codes Generated</div>
                    <div className="stat-value">{stats.totalCodes}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Check size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Codes Redeemed</div>
                    <div className="stat-value">{stats.codesRedeemed}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Ticket size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Codes Remaining</div>
                    <div className="stat-value">{stats.codesRemaining}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <RefreshCw size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Redemption Rate</div>
                    <div className="stat-value">{stats.redemptionRate}%</div>
                  </div>
                </div>
              </div>

          {/* Purchases List */}
          <div className="card">
            <div className="card-header">
              <h3>Code Purchases</h3>
              <p>View and manage your bulk course purchases and enrollment codes</p>
            </div>

            {purchases.length === 0 ? (
              <div className="empty-state">
                <Ticket size={48} />
                <h3>No Code Purchases Yet</h3>
                <p>Generate enrollment codes to distribute courses to your employees</p>
                <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
                  <Plus size={18} />
                  Generate Your First Codes
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Quantity</th>
                      <th>Generated</th>
                      <th>Redeemed</th>
                      <th>Remaining</th>
                      <th>Rate</th>
                      <th>Purchase Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => {
                      const remaining = (purchase.codes_generated || 0) - (purchase.codes_redeemed || 0)
                      const rate = purchase.codes_generated > 0 
                        ? ((purchase.codes_redeemed / purchase.codes_generated) * 100).toFixed(0)
                        : 0

                      return (
                        <tr key={purchase.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {purchase.course?.thumbnail_url && (
                                <img 
                                  src={purchase.course.thumbnail_url} 
                                  alt={purchase.course.title}
                                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <strong>{purchase.course?.title || 'Unknown Course'}</strong>
                              </div>
                            </div>
                          </td>
                          <td>{purchase.quantity}</td>
                          <td>
                            <span className="badge badge-info">{purchase.codes_generated || 0}</span>
                          </td>
                          <td>
                            <span className="badge badge-success">{purchase.codes_redeemed || 0}</span>
                          </td>
                          <td>
                            <span className="badge badge-warning">{remaining}</span>
                          </td>
                          <td>{rate}%</td>
                          <td>{new Date(purchase.purchased_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  
                                  fetchCodesForPurchase(purchase.id)
                                }}
                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                              >
                                <Ticket size={14} style={{ marginRight: '4px' }} />
                                View Codes
                              </button>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadCodes(purchase.id)
                                }}
                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Codes Display */}
          {selectedPurchase && codes.length > 0 && (
            <div id="codes-display-section" className="card" style={{ marginTop: '24px', border: '2px solid #0B4F9F', boxShadow: '0 4px 12px rgba(11, 79, 159, 0.15)' }}>
              <div className="card-header" style={{ background: '#f0f7ff', borderBottom: '2px solid #0B4F9F' }}>
                {(() => {
                  const purchase = purchases.find(p => p.id === selectedPurchase)
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        {purchase?.course?.thumbnail_url && (
                          <img 
                            src={purchase.course.thumbnail_url} 
                            alt={purchase.course.title}
                            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #0B4F9F' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: '#0B4F9F', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Ticket size={24} />
                            Enrollment Codes for: {purchase?.course?.title || 'Unknown Course'}
                          </h3>
                          <p style={{ margin: '4px 0 0 32px', fontSize: '14px', color: '#666' }}>
                            {codes.length} codes • Purchase Date: {purchase?.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setSelectedPurchase(null)
                            setCodes([])
                          }}
                        >
                          Hide Codes
                        </button>
                      </div>
                      <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#666' }}>
                        Share these codes with your employees to grant them access to this course
                      </p>
                    </>
                  )
                })()}
              </div>
              <div className="codes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '24px' }}>
                {codes.map((code) => (
                  <div
                    key={code.id}
                    style={{
                      padding: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: code.status === 'redeemed' ? '#f5f5f5' : 'white',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (code.status === 'active') {
                        e.currentTarget.style.borderColor = '#0B4F9F'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(11, 79, 159, 0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <code style={{ 
                        fontSize: '15px', 
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        color: code.status === 'redeemed' ? '#999' : '#0B4F9F',
                        letterSpacing: '0.5px'
                      }}>
                        {code.code}
                      </code>
                      {code.status === 'active' && (
                        <button
                          className="btn btn-sm"
                          onClick={() => copyCode(code.code)}
                          style={{ padding: '4px 8px', minWidth: '32px' }}
                          title="Copy code"
                        >
                          {copiedCode === code.code ? (
                            <Check size={14} color="#4CAF50" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Status: 
                        <span className={`badge badge-${code.status === 'redeemed' ? 'success' : 'info'}`}>
                          {code.status}
                        </span>
                      </div>
                      {code.redeemed_at && (
                        <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
                          Redeemed: {new Date(code.redeemed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {/* REDEMPTION REQUESTS TAB */}
          {activeMainTab === 'redemptions' && (
            <>
              {/* Redemption Stats */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '32px' }}>
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Clock size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Pending Review</div>
                    <div className="stat-value">{stats.pendingRedemptions}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Approved</div>
                    <div className="stat-value">{stats.approvedRedemptions}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <XCircle size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value">{stats.rejectedRedemptions}</div>
                  </div>
                </div>
              </div>

              {/* Redemption Tabs */}
              <div className="programmes-tabs" style={{ marginTop: '24px' }}>
                <button 
                  className={`tab ${activeRedemptionTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveRedemptionTab('pending')}
                  style={{
                    border: activeRedemptionTab === 'pending' ? '2px solid #0B4F9F' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    background: activeRedemptionTab === 'pending' ? '#f0f7ff' : 'white'
                  }}
                >
                  <Clock size={16} style={{ marginRight: '8px' }} />
                  Pending ({stats.pendingRedemptions})
                </button>
                <button 
                  className={`tab ${activeRedemptionTab === 'approved' ? 'active' : ''}`}
                  onClick={() => setActiveRedemptionTab('approved')}
                  style={{
                    border: activeRedemptionTab === 'approved' ? '2px solid #0B4F9F' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    background: activeRedemptionTab === 'approved' ? '#f0f7ff' : 'white'
                  }}
                >
                  <CheckCircle size={16} style={{ marginRight: '8px' }} />
                  Approved ({stats.approvedRedemptions})
                </button>
                <button 
                  className={`tab ${activeRedemptionTab === 'rejected' ? 'active' : ''}`}
                  onClick={() => setActiveRedemptionTab('rejected')}
                  style={{
                    border: activeRedemptionTab === 'rejected' ? '2px solid #0B4F9F' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    background: activeRedemptionTab === 'rejected' ? '#f0f7ff' : 'white'
                  }}
                >
                  <XCircle size={16} style={{ marginRight: '8px' }} />
                  Rejected ({stats.rejectedRedemptions})
                </button>
              </div>

              {/* Requests List */}
              <div className="requests-list">
                {redemptionRequests.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={48} />
                    <h3>No {activeRedemptionTab} Requests</h3>
                    <p>
                      {activeRedemptionTab === 'pending' 
                        ? 'All redemption requests have been reviewed'
                        : `No ${activeRedemptionTab} requests found`}
                    </p>
                  </div>
                ) : (
                  <>
                    {redemptionRequests.map((request) => (
                      <div key={request.id} className="card" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '24px', padding: '24px' }}>
                          {/* Course Info */}
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                              COURSE
                            </div>
                            {request.course?.thumbnail_url && (
                              <img 
                                src={request.course.thumbnail_url} 
                                alt={request.course.title}
                                style={{ width: '100%', height: '120px', borderRadius: '8px', objectFit: 'cover', marginBottom: '12px' }}
                              />
                            )}
                            <strong style={{ fontSize: '14px' }}>{request.course?.title || 'Unknown Course'}</strong>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                              Code: <code>{request.enrollmentCode?.code || 'N/A'}</code>
                            </div>
                          </div>

                          {/* Employee Details */}
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', fontWeight: '600' }}>
                              EMPLOYEE DETAILS
                            </div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                <User size={18} color="#666" />
                                <div>
                                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{request.user_name}</div>
                                  <div style={{ fontSize: '13px', color: '#666' }}>{request.user_email}</div>
                                </div>
                              </div>

                              {request.employee_id && (
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                  <Briefcase size={18} color="#666" />
                                  <div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>Employee ID</div>
                                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{request.employee_id}</div>
                                  </div>
                                </div>
                              )}

                              {request.department && (
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                  <Building2 size={18} color="#666" />
                                  <div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>Department</div>
                                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{request.department}</div>
                                  </div>
                                </div>
                              )}

                              {request.job_title && (
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                  <Briefcase size={18} color="#666" />
                                  <div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>Job Title</div>
                                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{request.job_title}</div>
                                  </div>
                                </div>
                              )}

                              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                Requested: {new Date(request.requested_at).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', fontWeight: '600' }}>
                              ACTIONS
                            </div>

                            {activeRedemptionTab === 'pending' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processingId === request.id}
                                  style={{ width: '100%' }}
                                >
                                  {processingId === request.id ? (
                                    <>
                                      <Loader size={16} className="spinner" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={16} />
                                      Approve
                                    </>
                                  )}
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => setRejectionModal(request)}
                                  disabled={processingId === request.id}
                                  style={{ width: '100%' }}
                                >
                                  <XCircle size={16} />
                                  Reject
                                </button>
                              </div>
                            )}

                            {activeRedemptionTab === 'approved' && (
                              <div className="info-box" style={{ background: '#E8F5E9' }}>
                                <CheckCircle size={18} color="#388E3C" />
                                <div>
                                  <strong>Approved</strong>
                                  <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                                    {new Date(request.reviewed_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            {activeRedemptionTab === 'rejected' && (
                              <div className="info-box" style={{ background: '#FFEBEE' }}>
                                <XCircle size={18} color="#D32F2F" />
                                <div>
                                  <strong>Rejected</strong>
                                  <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                                    {new Date(request.reviewed_at).toLocaleString()}
                                  </p>
                                  {request.rejection_reason && (
                                    <p style={{ margin: '8px 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                                      Reason: {request.rejection_reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Generate Enrollment Codes</h3>
              <button className="modal-close" onClick={() => setShowGenerateModal(false)}>×</button>
            </div>

            <form onSubmit={handleGenerateCodes} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Select Course *</label>
                <select
                  value={generateForm.courseId}
                  onChange={(e) => setGenerateForm({...generateForm, courseId: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} {course.price > 0 ? `(${course.price} RWF)` : '(FREE)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Codes *</label>
                <input
                  type="number"
                  value={generateForm.quantity}
                  onChange={(e) => setGenerateForm({...generateForm, quantity: e.target.value})}
                  className="form-input"
                  min="1"
                  max="1000"
                  required
                />
                <small className="form-hint">Generate between 1 and 1000 codes at once</small>
              </div>

              <div className="info-box" style={{ marginBottom: '24px' }}>
                <AlertCircle size={18} color="#FDB714" />
                <div>
                  <strong>Important:</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                    Each code can be used once. Employees will need to verify their employment when redeeming codes.
                  </p>
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="spinner" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Ticket size={18} />
                      Generate Codes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="modal-overlay" onClick={() => setRejectionModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Reject Redemption Request</h3>
              <button className="modal-close" onClick={() => setRejectionModal(null)}>×</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="info-box" style={{ marginBottom: '24px' }}>
                <AlertCircle size={18} color="#D32F2F" />
                <div>
                  <strong>Rejecting request from:</strong>
                  <p style={{ margin: '4px 0 0' }}>{rejectionModal.user_name} ({rejectionModal.user_email})</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Explain why this request is being rejected (will be sent to the employee)"
                  required
                />
              </div>

              <div className="button-group">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setRejectionModal(null)
                    setRejectionReason('')
                  }}
                  disabled={processingId}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={processingId || !rejectionReason.trim()}
                >
                  {processingId ? (
                    <>
                      <Loader size={16} className="spinner" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnrollmentCodes
