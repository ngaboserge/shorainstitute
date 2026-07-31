import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Ticket, CheckCircle, AlertCircle, Loader, User, Briefcase, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import './RedeemCode.css'

const RedeemCode = () => {
  const { user, profile } = useAuth()
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1: Enter code, 2: Verification form, 3: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [codeData, setCodeData] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [institutionData, setInstitutionData] = useState(null)
  
  const [verificationForm, setVerificationForm] = useState({
    employeeId: '',
    department: '',
    jobTitle: ''
  })

  const handleCodeValidation = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Format code (add hyphens if missing)
      const formattedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
      const codeWithHyphens = formattedCode.length === 16 
        ? `${formattedCode.slice(0, 4)}-${formattedCode.slice(4, 8)}-${formattedCode.slice(8, 12)}-${formattedCode.slice(12)}`
        : code.toUpperCase().trim()

      // Validate code (simplified query without JOIN)
      const { data: codeRecord, error: codeError } = await supabase
        .from('institution_enrollment_codes')
        .select('*')
        .eq('code', codeWithHyphens)
        .single()

      if (codeError || !codeRecord) {
        setError('Invalid code. Please check and try again.')
        return
      }

      // Get course details separately
      const { data: course } = await supabase
        .from('courses')
        .select('id, title, description, thumbnail_url, category')
        .eq('id', codeRecord.course_id)
        .single()

      // Get institution details separately
      const { data: institution } = await supabase
        .from('institutions')
        .select('name')
        .eq('id', codeRecord.institution_id)
        .single()

      // Check if code is already used
      if (codeRecord.status === 'redeemed') {
        setError('This code has already been redeemed.')
        return
      }

      // Check if code is expired
      if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
        setError('This code has expired.')
        return
      }

      // Check if user already has a pending request for this code
      const { data: existingRequest } = await supabase
        .from('code_redemption_requests')
        .select('*')
        .eq('code_id', codeRecord.id)
        .eq('user_id', user.id)
        .single()

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          setError('You already have a pending request for this code.')
        } else if (existingRequest.status === 'approved') {
          setError('You have already redeemed this code.')
        } else {
          setError('Your previous request for this code was rejected.')
        }
        return
      }

      // Valid code - proceed to verification
      setCodeData(codeRecord)
      setCourseData(course)
      setInstitutionData(institution)
      setStep(2)

    } catch (err) {
      console.error('Code validation error:', err)
      setError('Failed to validate code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Create redemption request
      const { error: requestError } = await supabase
        .from('code_redemption_requests')
        .insert({
          code_id: codeData.id,
          institution_id: codeData.institution_id,
          course_id: codeData.course_id,
          user_id: user.id,
          user_email: user.email,
          user_name: profile?.full_name || 'Learner',
          employee_id: verificationForm.employeeId.trim(),
          department: verificationForm.department.trim(),
          job_title: verificationForm.jobTitle.trim(),
          status: 'pending',
          requested_at: new Date().toISOString()
        })

      if (requestError) throw requestError

      // Update code to show it's been claimed (pending approval)
      const { error: updateError } = await supabase
        .from('institution_enrollment_codes')
        .update({
          redeemed_by: user.id,
          redeemed_at: new Date().toISOString(),
          approval_status: 'pending'
        })
        .eq('id', codeData.id)

      if (updateError) throw updateError

      // Success!
      setStep(3)

    } catch (err) {
      console.error('Request submission error:', err)
      setError('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Redeem Enrollment Code"
          subtitle="Enter your institutional enrollment code to access courses"
        />
        
        <div className="content-wrapper">
          {/* Step 1: Enter Code */}
          {step === 1 && (
            <div className="redeem-card">
              <div className="redeem-icon">
                <Ticket size={48} />
              </div>
              
              <h2>Enter Your Enrollment Code</h2>
              <p className="redeem-subtitle">
                Your institution has provided you with an enrollment code.<br/>
                Enter it below to request access to the course.
              </p>

              <form onSubmit={handleCodeValidation} className="redeem-form">
                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Enrollment Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="code-input"
                    placeholder="INST-XXXX-XXXX-XXXX"
                    required
                    maxLength={19}
                    disabled={loading}
                  />
                  <small className="form-hint">
                    Format: INST-XXXX-XXXX-XXXX (dashes are optional)
                  </small>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={loading || code.trim().length < 10}
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="spinner" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Validate Code
                    </>
                  )}
                </button>
              </form>

              <div className="redeem-info">
                <h4>How it works:</h4>
                <ol>
                  <li>Enter the code provided by your institution</li>
                  <li>Verify your employment details</li>
                  <li>Wait for admin approval (usually within 24 hours)</li>
                  <li>Start learning once approved!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 2: Verification Form */}
          {step === 2 && courseData && (
            <div className="redeem-card">
              <div className="course-preview">
                {courseData.thumbnail_url ? (
                  <img src={courseData.thumbnail_url} alt={courseData.title} />
                ) : (
                  <div className="course-preview-placeholder">
                    <Ticket size={48} />
                  </div>
                )}
                <div className="course-preview-content">
                  <h3>{courseData.title}</h3>
                  <p>{institutionData?.name || 'Institution'}</p>
                  {courseData.category && (
                    <span className="course-badge">{courseData.category}</span>
                  )}
                </div>
              </div>

              <div className="verification-section">
                <h2>Verify Your Employment</h2>
                <p className="verification-subtitle">
                  Please provide your employment details so {institutionData?.name || 'your institution'} can verify you are their employee.
                </p>

                <form onSubmit={handleSubmitRequest} className="verification-form">
                  {error && (
                    <div className="alert alert-error">
                      <AlertCircle size={20} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      <User size={18} />
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={verificationForm.employeeId}
                      onChange={(e) => setVerificationForm({...verificationForm, employeeId: e.target.value})}
                      className="form-input"
                      placeholder="e.g., EMP-12345"
                      required
                      disabled={loading}
                    />
                    <small className="form-hint">
                      Your official employee ID from {institutionData?.name || 'your institution'}
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Building2 size={18} />
                      Department *
                    </label>
                    <input
                      type="text"
                      value={verificationForm.department}
                      onChange={(e) => setVerificationForm({...verificationForm, department: e.target.value})}
                      className="form-input"
                      placeholder="e.g., Finance, IT, HR"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Briefcase size={18} />
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={verificationForm.jobTitle}
                      onChange={(e) => setVerificationForm({...verificationForm, jobTitle: e.target.value})}
                      className="form-input"
                      placeholder="e.g., Financial Analyst"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="info-box" style={{ marginTop: '24px' }}>
                    <AlertCircle size={18} style={{ color: '#FDB714' }} />
                    <div>
                      <strong>Approval Required</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                        Your institution will review your information to verify you are their employee before granting access.
                      </p>
                    </div>
                  </div>

                  <div className="button-group">
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-large"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader size={20} className="spinner" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && courseData && (
            <div className="redeem-card success-card">
              <div className="success-icon">
                <CheckCircle size={64} />
              </div>
              
              <h2>Request Submitted Successfully!</h2>
              <p className="success-subtitle">
                Your enrollment request for <strong>{courseData.title}</strong> has been submitted to {institutionData?.name || 'your institution'}.
              </p>

              <div className="success-details">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="status-badge pending">Pending Approval</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Course:</span>
                  <span>{courseData.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Institution:</span>
                  <span>{institutionData?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="info-box" style={{ marginTop: '24px' }}>
                <AlertCircle size={18} style={{ color: '#0B4F9F' }} />
                <div>
                  <strong>What happens next?</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Your institution will review your employment details</li>
                    <li>You'll receive an email notification once approved or rejected</li>
                    <li>If approved, the course will appear in your dashboard</li>
                    <li>This usually takes less than 24 hours</li>
                  </ul>
                </div>
              </div>

              <div className="button-group" style={{ marginTop: '32px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.location.href = '/learner/courses'}
                >
                  View My Courses
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setStep(1)
                    setCode('')
                    setVerificationForm({ employeeId: '', department: '', jobTitle: '' })
                    setCodeData(null)
                    setCourseData(null)
                    setInstitutionData(null)
                    setError(null)
                  }}
                >
                  Redeem Another Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RedeemCode
