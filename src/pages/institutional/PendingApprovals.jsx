import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Clock, CheckCircle, XCircle, User, Briefcase, Building2, Search, Filter, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useInstitutionalAuth } from '../../hooks/useInstitutionalAuth'
import './PendingApprovals.css'

const PendingApprovals = () => {
  const { institution } = useInstitutionalAuth()
  const institutionId = institution?.id
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [selectedRequests, setSelectedRequests] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    if (institutionId) {
      fetchRequests()
    }
  }, [institutionId, filterStatus])

  const fetchRequests = async () => {
    try {
      setLoading(true)

      // Fetch redemption requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('code_redemption_requests')
        .select(`
          *,
          institution_enrollment_codes (
            code,
            expires_at
          ),
          courses (
            title,
            category,
            thumbnail_url
          ),
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('institution_id', institutionId)
        .eq('status', filterStatus)
        .order('requested_at', { ascending: false })

      if (requestsError) throw requestsError

      setRequests(requestsData || [])

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('code_redemption_requests')
        .select('status')
        .eq('institution_id', institutionId)

      if (statsError) throw statsError

      const newStats = {
        pending: statsData?.filter(r => r.status === 'pending').length || 0,
        approved: statsData?.filter(r => r.status === 'approved').length || 0,
        rejected: statsData?.filter(r => r.status === 'rejected').length || 0
      }
      setStats(newStats)

    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request) => {
    if (!confirm(`Approve enrollment request for ${request.user_name}?`)) return

    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update request status
      const { error: updateError } = await supabase
        .from('code_redemption_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      // Trigger will automatically create enrollment
      await fetchRequests()
      alert('Request approved successfully!')

    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (request) => {
    const reason = prompt('Reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update request status
      const { error: updateError } = await supabase
        .from('code_redemption_requests')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || 'Not verified as employee',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      // Reset code approval status so it can be used again
      const { error: codeError } = await supabase
        .from('institution_enrollment_codes')
        .update({
          approval_status: 'rejected',
          redeemed_by: null,
          redeemed_at: null
        })
        .eq('id', request.code_id)

      if (codeError) throw codeError

      await fetchRequests()
      alert('Request rejected successfully.')

    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      alert('Please select requests to approve')
      return
    }

    if (!confirm(`Approve ${selectedRequests.length} selected request(s)?`)) return

    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update all selected requests
      const { error: updateError } = await supabase
        .from('code_redemption_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', selectedRequests)

      if (updateError) throw updateError

      setSelectedRequests([])
      await fetchRequests()
      alert('Requests approved successfully!')

    } catch (error) {
      console.error('Error bulk approving:', error)
      alert('Failed to approve requests. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredRequests = requests.filter(request => 
    request.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map(r => r.id))
    }
  }

  const toggleSelect = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit)
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
      }
    }
    return 'Just now'
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Code Redemption Approvals"
          subtitle="Review and approve employee enrollment requests"
          actions={
            filterStatus === 'pending' && selectedRequests.length > 0 && (
              <button 
                className="btn btn-primary"
                onClick={handleBulkApprove}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Approve Selected ({selectedRequests.length})
                  </>
                )}
              </button>
            )
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid-3">
            <div 
              className={`stat-card ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon orange">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
            </div>

            <div 
              className={`stat-card ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Approved</div>
                <div className="stat-value">{stats.approved}</div>
              </div>
            </div>

            <div 
              className={`stat-card ${filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('rejected')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon red">
                <XCircle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Rejected</div>
                <div className="stat-value">{stats.rejected}</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {filterStatus === 'pending' ? 'Pending Requests' : 
                 filterStatus === 'approved' ? 'Approved Requests' : 
                 'Rejected Requests'}
              </h3>
              <div className="search-box" style={{ width: '300px' }}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader size={48} className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#666' }}>Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Clock size={48} style={{ color: '#ccc', margin: '0 auto 16px' }} />
                <h3 style={{ marginBottom: '8px', color: '#666' }}>
                  No {filterStatus} requests
                </h3>
                <p style={{ color: '#999' }}>
                  {filterStatus === 'pending' 
                    ? 'All caught up! No pending approvals at the moment.'
                    : `No ${filterStatus} requests to show.`}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {filterStatus === 'pending' && (
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th>Employee</th>
                      <th>Course</th>
                      <th>Verification Details</th>
                      <th>Requested</th>
                      {filterStatus !== 'pending' && <th>Reviewed</th>}
                      {filterStatus === 'pending' && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        {filterStatus === 'pending' && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => toggleSelect(request.id)}
                            />
                          </td>
                        )}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={request.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${request.user_id}`}
                              alt={request.user_name}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 500 }}>{request.user_name}</div>
                              <div style={{ fontSize: '13px', color: '#666' }}>{request.user_email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {request.courses?.thumbnail_url && (
                              <img 
                                src={request.courses.thumbnail_url}
                                alt={request.courses.title}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '6px',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 500 }}>{request.courses?.title || 'Unknown Course'}</div>
                              {request.courses?.category && (
                                <div style={{ fontSize: '12px', color: '#666' }}>{request.courses.category}</div>
                              )}
                              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                Code: {request.institution_enrollment_codes?.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px' }}>
                            {request.employee_id && (
                              <div style={{ marginBottom: '4px' }}>
                                <User size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                <strong>ID:</strong> {request.employee_id}
                              </div>
                            )}
                            {request.department && (
                              <div style={{ marginBottom: '4px' }}>
                                <Building2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                <strong>Dept:</strong> {request.department}
                              </div>
                            )}
                            {request.job_title && (
                              <div>
                                <Briefcase size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                <strong>Role:</strong> {request.job_title}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {getTimeSince(request.requested_at)}
                          </div>
                        </td>
                        {filterStatus !== 'pending' && (
                          <td>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              {request.reviewed_at ? getTimeSince(request.reviewed_at) : 'N/A'}
                            </div>
                            {request.rejection_reason && (
                              <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                                Reason: {request.rejection_reason}
                              </div>
                            )}
                          </td>
                        )}
                        {filterStatus === 'pending' && (
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApprove(request)}
                                disabled={processing}
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleReject(request)}
                                disabled={processing}
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovals
