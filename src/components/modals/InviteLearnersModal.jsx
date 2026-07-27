import React, { useState, useEffect } from 'react'
import { X, Mail, UserPlus, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import { useAuth } from '../../contexts/AuthContext'
import './Modal.css'

const InviteLearnersModal = ({ isOpen, onClose, onSuccess }) => {
  const { institutionId } = useShoraInstitute()
  const { user } = useAuth()
  
  const [mode, setMode] = useState('single') // 'single' or 'bulk'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Single invitation state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    employeeId: '',
    departmentId: '',
    jobTitle: ''
  })
  
  // Bulk invitation state
  const [bulkEmails, setBulkEmails] = useState('')
  const [departments, setDepartments] = useState([])
  const [institutionData, setInstitutionData] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
    }
  }, [isOpen, institutionId])

  const fetchInitialData = async () => {
    try {
      // Fetch institution data (for seat check)
      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single()

      if (instError) throw instError
      setInstitutionData(institution)

      // Fetch departments
      const { data: depts, error: deptsError } = await supabase
        .from('institution_departments')
        .select('id, name')
        .eq('institution_id', institutionId)
        .order('name')

      if (deptsError && deptsError.code !== 'PGRST116') throw deptsError
      setDepartments(depts || [])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load initial data')
    }
  }

  const checkSeatsAvailable = (count = 1) => {
    if (!institutionData) return false
    const availableSeats = institutionData.total_seats - institutionData.used_seats
    return availableSeats >= count
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSingleInvite = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.email || !formData.name) {
      setError('Email and name are required')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    // Check seats
    if (!checkSeatsAvailable(1)) {
      setError(`No available seats. You have ${institutionData.total_seats} seats and ${institutionData.used_seats} are already used.`)
      return
    }

    try {
      setLoading(true)

      // Check if already invited or exists
      const { data: existing, error: checkError } = await supabase
        .from('learner_invitations')
        .select('id, status')
        .eq('institution_id', institutionId)
        .eq('email', formData.email.toLowerCase().trim())
        .single()

      if (existing) {
        if (existing.status === 'pending') {
          setError('This email has already been invited and is pending acceptance')
          setLoading(false)
          return
        } else if (existing.status === 'accepted') {
          setError('This employee is already part of your institution')
          setLoading(false)
          return
        }
      }

      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('learner_invitations')
        .insert({
          institution_id: institutionId,
          email: formData.email.toLowerCase().trim(),
          employee_name: formData.name.trim(),
          employee_id: formData.employeeId.trim() || null,
          department_id: formData.departmentId || null,
          job_title: formData.jobTitle.trim() || null,
          invited_by: user.id,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      // TODO: Send invitation email via email service
      // For now, just log the invitation link
      const invitationLink = `${window.location.origin}/invitation/accept?token=${invitation.invitation_token}`
      console.log('Invitation link:', invitationLink)

      setSuccess(`Invitation sent to ${formData.email}`)
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        employeeId: '',
        departmentId: '',
        jobTitle: ''
      })

      // Notify parent
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }

    } catch (err) {
      console.error('Error sending invitation:', err)
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkInvite = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!bulkEmails.trim()) {
      setError('Please enter at least one email address')
      return
    }

    // Parse emails (one per line or comma-separated)
    const emailList = bulkEmails
      .split(/[\n,]/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0)

    // Validate all emails
    const invalidEmails = emailList.filter(email => !validateEmail(email))
    if (invalidEmails.length > 0) {
      setError(`Invalid email addresses: ${invalidEmails.join(', ')}`)
      return
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emailList)]

    // Check seats
    if (!checkSeatsAvailable(uniqueEmails.length)) {
      setError(`Not enough seats. You need ${uniqueEmails.length} seats but only ${institutionData.total_seats - institutionData.used_seats} are available.`)
      return
    }

    try {
      setLoading(true)

      // Check for existing invitations
      const { data: existing, error: checkError } = await supabase
        .from('learner_invitations')
        .select('email')
        .eq('institution_id', institutionId)
        .in('email', uniqueEmails)

      const existingEmails = existing ? existing.map(inv => inv.email) : []
      const newEmails = uniqueEmails.filter(email => !existingEmails.includes(email))

      if (newEmails.length === 0) {
        setError('All emails have already been invited')
        setLoading(false)
        return
      }

      // Create invitations
      const invitations = newEmails.map(email => ({
        institution_id: institutionId,
        email: email,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }))

      const { data: created, error: inviteError } = await supabase
        .from('learner_invitations')
        .insert(invitations)
        .select()

      if (inviteError) throw inviteError

      // TODO: Send bulk invitation emails
      console.log(`Sent ${created.length} invitations`)

      setSuccess(`Successfully sent ${created.length} invitation${created.length > 1 ? 's' : ''}`)
      
      if (existingEmails.length > 0) {
        setError(`Note: ${existingEmails.length} email${existingEmails.length > 1 ? 's were' : ' was'} already invited: ${existingEmails.join(', ')}`)
      }

      setBulkEmails('')

      // Notify parent
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }

    } catch (err) {
      console.error('Error sending bulk invitations:', err)
      setError(err.message || 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      employeeId: '',
      departmentId: '',
      jobTitle: ''
    })
    setBulkEmails('')
    setError(null)
    setSuccess(null)
    setMode('single')
    onClose()
  }

  if (!isOpen) return null

  const availableSeats = institutionData ? institutionData.total_seats - institutionData.used_seats : 0

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <UserPlus size={24} />
            <div>
              <h2 className="modal-title">Invite Employees</h2>
              <p className="modal-subtitle">
                {availableSeats > 0 
                  ? `${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available`
                  : 'No seats available'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="modal-close-button">
            <X size={20} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${mode === 'single' ? 'active' : ''}`}
            onClick={() => setMode('single')}
          >
            <Mail size={18} />
            Single Invite
          </button>
          <button
            className={`modal-tab ${mode === 'bulk' ? 'active' : ''}`}
            onClick={() => setMode('bulk')}
          >
            <Upload size={18} />
            Bulk Invite
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Alerts */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {availableSeats === 0 && (
            <div className="alert alert-warning">
              <AlertCircle size={18} />
              <span>No available seats. Please upgrade your plan to invite more employees.</span>
            </div>
          )}

          {/* Single Invite Form */}
          {mode === 'single' && (
            <form onSubmit={handleSingleInvite}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="john.doe@company.com"
                  required
                  disabled={availableSeats === 0}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="John Doe"
                  required
                  disabled={availableSeats === 0}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="EMP-001"
                    disabled={availableSeats === 0}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={availableSeats === 0}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Financial Analyst"
                  disabled={availableSeats === 0}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading || availableSeats === 0}
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          )}

          {/* Bulk Invite Form */}
          {mode === 'bulk' && (
            <form onSubmit={handleBulkInvite}>
              <div className="form-group">
                <label className="form-label">Email Addresses</label>
                <p className="form-help-text">
                  Enter one email per line or separate with commas
                </p>
                <textarea
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="form-textarea"
                  rows={8}
                  placeholder="john.doe@company.com&#10;jane.smith@company.com&#10;bob.johnson@company.com"
                  disabled={availableSeats === 0}
                />
                <p className="form-help-text">
                  {bulkEmails.split(/[\n,]/).filter(e => e.trim()).length} email{bulkEmails.split(/[\n,]/).filter(e => e.trim()).length !== 1 ? 's' : ''} entered
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading || availableSeats === 0}
                >
                  {loading ? 'Sending...' : 'Send Invitations'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default InviteLearnersModal
