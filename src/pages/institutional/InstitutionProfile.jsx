import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  ArrowLeft, ArrowRight, Building2, MapPin, Phone, 
  CheckCircle, ChevronRight, Save, Mail, Globe, Calendar
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './InstitutionProfile.css'

const InstitutionProfile = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [existingData, setExistingData] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    institution_type: 'university',
    registration_number: '',
    country: 'Rwanda',
    city: '',
    timezone: 'Africa/Kigali',
    logo_url: '',
    portal_display_name: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    default_language: 'English',
    academic_year: '2025-2026',
    reporting_frequency: 'Monthly'
  })

  useEffect(() => {
    if (institutionId) {
      fetchInstitutionData()
    }
  }, [institutionId])

  const fetchInstitutionData = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single()

      if (error) throw error

      if (data) {
        setExistingData(data)
        setFormData({
          name: data.name || '',
          institution_type: data.institution_type || 'university',
          registration_number: data.registration_number || '',
          country: data.country || 'Rwanda',
          city: data.city || '',
          timezone: data.timezone || 'Africa/Kigali',
          logo_url: data.logo_url || '',
          portal_display_name: data.portal_display_name || '',
          primary_contact_name: data.primary_contact_name || '',
          primary_contact_email: data.primary_contact_email || '',
          primary_contact_phone: data.primary_contact_phone || '',
          default_language: data.default_language || 'English',
          academic_year: data.academic_year || '2025-2026',
          reporting_frequency: data.reporting_frequency || 'Monthly'
        })
      }
    } catch (err) {
      console.error('Error fetching institution data:', err)
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleLogoUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${institutionId}-logo-${Date.now()}.${fileExt}`
      const filePath = `institution-logos/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath)

      // Update form data with new logo URL
      setFormData({ ...formData, logo_url: publicUrl })
      alert('Logo uploaded successfully!')

    } catch (err) {
      console.error('Error uploading logo:', err)
      alert(`Failed to upload logo: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const convertGoogleDriveUrl = (url) => {
    // Convert Google Drive share link to direct link
    const match = url.match(/\/file\/d\/([^\/]+)/)
    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`
    }
    return url
  }

  const handleLogoUrlChange = (e) => {
    let url = e.target.value
    // Auto-convert Google Drive links
    if (url.includes('drive.google.com')) {
      url = convertGoogleDriveUrl(url)
    }
    setFormData({ ...formData, logo_url: url })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('institutions')
        .update({
          name: formData.name,
          institution_type: formData.institution_type,
          registration_number: formData.registration_number,
          country: formData.country,
          city: formData.city,
          timezone: formData.timezone,
          logo_url: formData.logo_url,
          portal_display_name: formData.portal_display_name,
          primary_contact_name: formData.primary_contact_name,
          primary_contact_email: formData.primary_contact_email,
          primary_contact_phone: formData.primary_contact_phone,
          default_language: formData.default_language,
          academic_year: formData.academic_year,
          reporting_frequency: formData.reporting_frequency,
          updated_at: new Date().toISOString()
        })
        .eq('id', institutionId)

      if (error) throw error

      alert('Institution profile updated successfully!')
      navigate('/institutional/overview')

    } catch (err) {
      console.error('Error updating institution profile:', err)
      alert(`Failed to update profile: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Information', icon: Building2 },
    { number: 2, title: 'Location & Timezone', icon: MapPin },
    { number: 3, title: 'Contact Details', icon: Phone },
    { number: 4, title: 'Learning Preferences', icon: Calendar }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Institution Profile"
          subtitle="Set up your institution's profile and preferences."
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/settings')}>
              <ArrowLeft size={18} />
              Back to Settings
            </button>
          }
        />

        <div className="content-wrapper">
          <div className="cohort-wizard">
            <div className="cohort-main">
              {/* Progress Steps */}
              <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = currentStep === step.number
                    const isCompleted = currentStep > step.number
                    
                    return (
                      <React.Fragment key={step.number}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          opacity: isActive || isCompleted ? 1 : 0.5
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isCompleted ? '#4CAF50' : isActive ? '#2196F3' : '#E0E0E0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                          }}>
                            {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Step {step.number}</div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{step.title}</div>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <ChevronRight size={20} style={{ color: '#BDBDBD', flexShrink: 0 }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Basic Information</h3>

                  <div className="form-group">
                    <label>Institution name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., National Bank of Rwanda"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Institution type *</label>
                      <select
                        value={formData.institution_type}
                        onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                        required
                      >
                        <option value="university">University</option>
                        <option value="college">College</option>
                        <option value="corporate">Corporate</option>
                        <option value="government">Government</option>
                        <option value="ngo">NGO</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Registration number</label>
                      <input
                        type="text"
                        value={formData.registration_number}
                        onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                        placeholder="Official registration/license number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Portal display name</label>
                    <input
                      type="text"
                      value={formData.portal_display_name}
                      onChange={(e) => setFormData({ ...formData, portal_display_name: e.target.value })}
                      placeholder="e.g., BNR Learning Hub"
                    />
                    <small className="form-help-text">Custom name for your learning portal</small>
                  </div>

                  <div className="form-group">
                    <label>Logo</label>
                    
                    {/* Logo Preview */}
                    {formData.logo_url && (
                      <div style={{ 
                        marginBottom: '12px', 
                        padding: '12px', 
                        border: '1px solid #E0E0E0', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <img 
                          src={formData.logo_url} 
                          alt="Institution logo preview" 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'contain',
                            border: '1px solid #E0E0E0',
                            borderRadius: '4px',
                            padding: '4px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div style={{ flex: 1, fontSize: '13px', color: '#666', wordBreak: 'break-all' }}>
                          {formData.logo_url}
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="logo-upload" 
                        className="btn btn-secondary"
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          opacity: uploading ? 0.6 : 1
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Upload from Computer'}
                      </label>
                      <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                        Max 2MB • PNG, JPG, SVG
                      </small>
                    </div>

                    {/* URL Input */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: '13px', marginBottom: '8px', color: '#666' }}>
                        Or paste a URL:
                      </div>
                      <input
                        type="url"
                        value={formData.logo_url}
                        onChange={handleLogoUrlChange}
                        placeholder="https://example.com/logo.png or Google Drive link"
                      />
                      <small className="form-help-text">
                        Supports direct image URLs and Google Drive links
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Timezone */}
              {currentStep === 2 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Location & Timezone</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Country *</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        required
                      >
                        <option value="Rwanda">Rwanda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Burundi">Burundi</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Kigali"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Timezone *</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      required
                    >
                      <option value="Africa/Kigali">Africa/Kigali (CAT - UTC+2)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT - UTC+3)</option>
                      <option value="Africa/Lagos">Africa/Lagos (WAT - UTC+1)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST - UTC+2)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New York (EST/EDT)</option>
                    </select>
                    <small className="form-help-text">
                      Used for scheduling cohorts, deadlines, and reports
                    </small>
                  </div>

                  <div className="card" style={{ background: '#F5F5F5', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      📍 Location and timezone settings help us deliver content and notifications at the right time for your learners.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Details */}
              {currentStep === 3 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Primary Contact Details</h3>

                  <div className="form-group">
                    <label>Contact person name *</label>
                    <input
                      type="text"
                      value={formData.primary_contact_name}
                      onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email address *</label>
                      <input
                        type="email"
                        value={formData.primary_contact_email}
                        onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
                        placeholder="email@institution.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone number</label>
                      <input
                        type="tel"
                        value={formData.primary_contact_phone}
                        onChange={(e) => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                        placeholder="+250 700 000 000"
                      />
                    </div>
                  </div>

                  <div className="card" style={{ background: '#F5F5F5', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      📧 This contact will receive important notifications about your institution's learning programs and billing.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Learning Preferences */}
              {currentStep === 4 && (
                <div className="card">
                  <h3 style={{ marginBottom: '24px' }}>Learning Preferences</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Default language *</label>
                      <select
                        value={formData.default_language}
                        onChange={(e) => setFormData({ ...formData, default_language: e.target.value })}
                        required
                      >
                        <option value="English">English</option>
                        <option value="French">French</option>
                        <option value="Kinyarwanda">Kinyarwanda</option>
                        <option value="Swahili">Swahili</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Academic year</label>
                      <input
                        type="text"
                        value={formData.academic_year}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        placeholder="e.g., 2025-2026"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Reporting frequency *</label>
                    <select
                      value={formData.reporting_frequency}
                      onChange={(e) => setFormData({ ...formData, reporting_frequency: e.target.value })}
                      required
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                    <small className="form-help-text">
                      How often you'd like to receive automated progress reports
                    </small>
                  </div>

                  <div className="card" style={{ background: '#E8F5E9', marginTop: '20px', border: '1px solid #4CAF50' }}>
                    <p style={{ fontSize: '13px', color: '#2E7D32', margin: 0 }}>
                      ✅ Review your information and click "Save Profile" to complete the setup.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {currentStep > 1 && (
                  <button className="btn btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
                
                {currentStep < 4 && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && !formData.name) ||
                      (currentStep === 2 && (!formData.city || !formData.country)) ||
                      (currentStep === 3 && (!formData.primary_contact_name || !formData.primary_contact_email))
                    }
                  >
                    Next
                    <ArrowRight size={18} />
                  </button>
                )}

                {currentStep === 4 && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    <CheckCircle size={18} />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                )}
              </div>
            </div>

            {/* Summary Panel */}
            <div className="cohort-summary">
              <div className="card">
                <h4 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 600 }}>Summary</h4>

                <div className="summary-section">
                  <div className="summary-label">
                    <Building2 size={14} />
                    Institution
                  </div>
                  <div className="summary-value">{formData.name || '—'}</div>
                  {formData.institution_type && (
                    <div className="summary-subvalue">
                      {formData.institution_type.charAt(0).toUpperCase() + formData.institution_type.slice(1)}
                    </div>
                  )}
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <MapPin size={14} />
                    Location
                  </div>
                  <div className="summary-value">
                    {formData.city ? `${formData.city}, ${formData.country}` : '—'}
                  </div>
                  {formData.timezone && (
                    <div className="summary-subvalue">{formData.timezone}</div>
                  )}
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <Mail size={14} />
                    Contact
                  </div>
                  <div className="summary-value">{formData.primary_contact_name || '—'}</div>
                  {formData.primary_contact_email && (
                    <div className="summary-subvalue">{formData.primary_contact_email}</div>
                  )}
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <Globe size={14} />
                    Language
                  </div>
                  <div className="summary-value">{formData.default_language}</div>
                </div>

                <div className="summary-section">
                  <div className="summary-label">
                    <Calendar size={14} />
                    Reporting
                  </div>
                  <div className="summary-value">{formData.reporting_frequency}</div>
                  {formData.academic_year && (
                    <div className="summary-subvalue">AY: {formData.academic_year}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstitutionProfile
