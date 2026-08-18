import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import RevenueSettingsSection from '../../components/RevenueSettingsSection'
import ImageUpload from '../../components/ImageUpload'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Edit, Check, Star, Clock, Globe, Shield, Calendar, MapPin, Phone, Mail, Linkedin, GraduationCap, MoreVertical, Twitter, Briefcase } from 'lucide-react'
import './Profile.css'

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({
    coursesCount: 0,
    publishedCourses: 0,
    totalStudents: 0,
    averageRating: 0
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    title: '',
    expertise: '',
    headline: '',
    profile_photo_url: '',
    years_experience: '',
    company: '',
    job_title: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    specializations: []
  })

  useEffect(() => {
    if (user?.id) {
      loadProfileData()
    }
    // Initialize form data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        title: profile.title || 'Senior Finance & Investment Consultant',
        expertise: profile.expertise || 'Capital Markets, Corporate Finance, Investment Strategy',
        headline: profile.headline || '',
        profile_photo_url: profile.profile_photo_url || '',
        years_experience: profile.years_experience || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        website_url: profile.website_url || '',
        specializations: profile.specializations || []
      })
    }
  }, [user?.id, profile])

  const loadProfileData = async () => {
    try {
      // Load trainer courses
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4)

      if (error) throw error

      const publishedCourses = courses?.filter(c => c.status === 'published') || []
      const totalStudents = courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0
      const avgRating = courses?.length > 0
        ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
        : 0

      setStats({
        coursesCount: courses?.length || 0,
        publishedCourses: publishedCourses.length,
        totalStudents,
        averageRating: avgRating
      })

      setRecentCourses(courses || [])
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSuccessMessage('')
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          title: formData.title,
          expertise: formData.expertise,
          headline: formData.headline,
          profile_photo_url: formData.profile_photo_url,
          years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
          company: formData.company,
          job_title: formData.job_title,
          linkedin_url: formData.linkedin_url,
          twitter_url: formData.twitter_url,
          website_url: formData.website_url,
          specializations: formData.specializations,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      if (refreshProfile) {
        await refreshProfile()
      }

      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const credentials = [
    { type: 'Chartered Financial Analyst (CFA)', issuer: 'CFA Institute', date: 'Issued Dec 2019', status: 'Verified' },
    { type: 'Master of Business Administration (MBA)', issuer: 'University of Cape Town', date: 'Issued Dec 2015', status: 'Verified' },
    { type: 'Bachelor of Commerce (BCom)', issuer: 'Makerere University', date: 'Issued Dec 2012', status: 'Verified' },
    { type: 'Ethical Certificate or Credential', issuer: 'ICPAK (CPD) (New York)', date: '', status: 'Verified' }
  ]

  const expertise = ['Capital Markets', 'Investment Strategy', 'Corporate Finance', 'Financial Modeling', 'Valuation', 'Risk Management', 'Entrepreneurial Finance']
  
  const topicApprovals = recentCourses.map(course => ({
    name: course.title,
    status: course.status === 'published' ? 'Approved' : 'Pending Review'
  }))

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Trainer Profile & Credentials"
          subtitle="Manage your professional profile, credentials, and teaching preferences."
          actions={
            <div className="trainer-badge">
              <Shield size={18} style={{color: '#FDB714'}} />
              <span>INVITED TRAINER</span>
              <span className="member-since">Member since {formatDate(profile?.created_at)}</span>
            </div>
          }
        />
        
        <div className="content-wrapper">
          <div className="profile-grid">
            {/* Left Column - Main Profile */}
            <div className="profile-main">
              {/* Profile Header Card */}
              <div className="card profile-header-card">
                {successMessage && (
                  <div style={{
                    padding: '12px',
                    background: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    {successMessage}
                  </div>
                )}
                
                <div className="profile-header-content">
                  <div className="profile-avatar-section">
                    {formData.profile_photo_url ? (
                      <img
                        src={formData.profile_photo_url}
                        alt={formData.full_name}
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #e5e7eb'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: '600'
                      }}>
                        {formData.full_name?.charAt(0) || profile?.full_name?.charAt(0) || 'T'}
                      </div>
                    )}
                    <button className="btn btn-sm btn-secondary edit-photo-btn" onClick={() => setIsEditing(true)}>
                      <Edit size={16} />
                      Edit Photo
                    </button>
                  </div>
                  <div className="profile-info-section">
                    <div className="profile-name-row">
                      <h2 className="profile-name">{formData.full_name || profile?.full_name || 'Trainer'}</h2>
                      <button 
                        className="btn-icon" 
                        onClick={() => setIsEditing(!isEditing)}
                        title={isEditing ? 'Cancel editing' : 'Edit profile'}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                    {formData.headline && (
                      <p className="profile-title" style={{ fontSize: '16px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                        {formData.headline}
                      </p>
                    )}
                    <p className="profile-title">{formData.title}</p>
                    {formData.company && formData.job_title && (
                      <p className="profile-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Briefcase size={14} />
                        {formData.job_title} at {formData.company}
                      </p>
                    )}
                    <p className="profile-subtitle">{formData.expertise}</p>
                    {formData.years_experience && (
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {formData.years_experience}+ years of experience
                      </p>
                    )}
                    <div className="profile-badge-row">
                      <span className="profile-badge verified">
                        <Check size={14} />
                        SHORA Institute
                      </span>
                      <span className="profile-badge invited">
                        <Shield size={14} />
                        SHORA INVITED TRAINER
                      </span>
                    </div>
                    <div className="profile-stats-quick">
                      <div className="quick-stat">
                        <strong>{stats.coursesCount}</strong>
                        <span>Courses</span>
                      </div>
                      <div className="quick-stat">
                        <strong>{stats.totalStudents}</strong>
                        <span>Students</span>
                      </div>
                      <div className="quick-stat">
                        <strong>{stats.averageRating}</strong>
                        <span>Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                {isEditing && (
                  <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Edit Profile Information</h3>
                    
                    {/* Profile Photo Upload */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Profile Photo</label>
                      <ImageUpload
                        currentImage={formData.profile_photo_url}
                        onImageUploaded={(url) => setFormData(prev => ({ ...prev, profile_photo_url: url }))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Professional Headline</label>
                      <input
                        type="text"
                        name="headline"
                        value={formData.headline}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="e.g., Senior Investment Strategist | 15+ Years Experience"
                        maxLength={150}
                      />
                      <small style={{ color: '#666', fontSize: '12px' }}>Max 150 characters - appears below your name</small>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Professional Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="e.g., Senior Finance Consultant"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Current Company</label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                          placeholder="Company name"
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Job Title</label>
                        <input
                          type="text"
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                          placeholder="Your current position"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Years of Experience</label>
                      <input
                        type="number"
                        name="years_experience"
                        value={formData.years_experience}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="e.g., 15"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Expertise/Specialization</label>
                      <input
                        type="text"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="e.g., Capital Markets, Investment Strategy"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                          placeholder="+250 XXX XXX XXX"
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Professional Biography</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={6}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                        placeholder="Share your professional background, teaching philosophy, and what makes you passionate about educating others..."
                      />
                      <small style={{ color: '#666', fontSize: '12px' }}>This will appear on your public profile and course pages</small>
                    </div>

                    <h4 style={{ marginBottom: '16px', marginTop: '24px' }}>Social Media & Links</h4>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        <Linkedin size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        <Twitter size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        Twitter/X Profile URL
                      </label>
                      <input
                        type="url"
                        name="twitter_url"
                        value={formData.twitter_url}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        <Globe size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        Personal Website
                      </label>
                      <input
                        type="url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Professional Biography */}
                {!isEditing && (
                  <div className="profile-section">
                    <div className="section-header">
                      <h3>Professional Biography</h3>
                      <button className="btn-text" onClick={() => setIsEditing(true)}>
                        <Edit size={16} />
                        Edit
                      </button>
                    </div>
                    <p className="bio-text">
                      {formData.bio || profile?.bio || `${formData.full_name || 'This trainer'} is a seasoned financial strategist and educator with expertise in ${formData.expertise || 'finance and investment'}. Passionate about making complex financial concepts accessible to empower professionals and business leaders.`}
                    </p>
                    {formData.phone && (
                      <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Phone size={16} color="#666" />
                          <span style={{ fontWeight: 500 }}>Contact:</span>
                          <span style={{ color: '#666' }}>{formData.phone}</span>
                        </div>
                        {formData.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={16} color="#666" />
                            <span style={{ fontWeight: 500 }}>Location:</span>
                            <span style={{ color: '#666' }}>{formData.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Areas of Expertise */}
                <div className="profile-section">
                  <div className="section-header">
                    <h3>Areas of Expertise</h3>
                    <button className="btn-text">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                  <div className="expertise-tags">
                    {expertise.map((item, idx) => (
                      <span key={idx} className="expertise-tag">{item}</span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="profile-section">
                  <div className="section-header">
                    <h3>Languages</h3>
                    <button className="btn-text">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                  <div className="languages-list">
                    <span className="language-badge">English (Native)</span>
                    <span className="language-badge">Kigali (Fluent)</span>
                    <span className="language-badge">Swahili (Fluent)</span>
                  </div>
                </div>

                {/* Linked Profiles & Links */}
                <div className="profile-section">
                  <div className="section-header">
                    <h3>Linked Profiles & Links</h3>
                    <button className="btn-text" onClick={() => setIsEditing(true)}>
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                  {(formData.linkedin_url || formData.twitter_url || formData.website_url) ? (
                    <div className="social-links">
                      {formData.linkedin_url && (
                        <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Linkedin size={18} />
                          {formData.linkedin_url.replace('https://', '').substring(0, 40)}
                          <span className="external-icon">↗</span>
                        </a>
                      )}
                      {formData.website_url && (
                        <a href={formData.website_url} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Globe size={18} />
                          {formData.website_url.replace('https://', '').replace('http://', '').substring(0, 40)}
                          <span className="external-icon">↗</span>
                        </a>
                      )}
                      {formData.twitter_url && (
                        <a href={formData.twitter_url} target="_blank" rel="noopener noreferrer" className="social-link">
                          <Twitter size={18} />
                          {formData.twitter_url.replace('https://', '').substring(0, 40)}
                          <span className="external-icon">↗</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: '#999', fontSize: '14px', padding: '16px 0' }}>
                      No social links added yet. Click Edit to add your professional profiles.
                    </p>
                  )}
                </div>
              </div>

              {/* Revenue Sharing & Payout Settings */}
              <RevenueSettingsSection userId={user?.id} profile={profile} />

              {/* Qualifications & Credentials */}
              <div className="card">
                <div className="section-header">
                  <h3>Qualifications & Credentials</h3>
                  <button className="btn btn-sm btn-primary">
                    <span>+</span>
                    Add New
                  </button>
                </div>
                <div className="credentials-list">
                  {credentials.map((cred, idx) => (
                    <div key={idx} className="credential-item">
                      <div className="credential-icon"><GraduationCap size={24} color="#0B4F9F" /></div>
                      <div className="credential-content">
                        <div className="credential-type">{cred.type}</div>
                        <div className="credential-issuer">{cred.issuer}</div>
                        {cred.date && <div className="credential-date">{cred.date}</div>}
                      </div>
                      <span className="badge success">{cred.status}</span>
                      <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Approvals */}
              <div className="card">
                <div className="section-header">
                  <h3>Your Courses</h3>
                  <a href="/trainer/courses" className="link-text">View all →</a>
                </div>
                {topicApprovals.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#999' }}>No courses yet. Create your first course!</p>
                  </div>
                ) : (
                  <div className="topics-list">
                    {topicApprovals.map((topic, idx) => (
                      <div key={idx} className="topic-item">
                        <div className="topic-icon">
                          {topic.status === 'Approved' ? <Check size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="topic-name">{topic.name}</div>
                        <span className={`badge ${topic.status === 'Approved' ? 'success' : 'warning'}`}>
                          {topic.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="profile-sidebar">
              {/* Public Preview */}
              <div className="card preview-card">
                <h3 className="card-title">Public Profile Preview</h3>
                <button className="btn btn-secondary btn-full">
                  <span>👁</span>
                  Preview
                </button>
                <div className="preview-content">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: '600',
                    margin: '0 auto 16px'
                  }}>
                    {profile?.full_name?.charAt(0) || 'T'}
                  </div>
                  <h4 className="preview-name">{profile?.full_name || 'Trainer'}</h4>
                  <p className="preview-title">Senior Finance & Investment Consultant</p>
                  <p className="preview-org">Capital Markets | Corporate Finance | Investment Strategy</p>
                  <span className="preview-badge">
                    <Shield size={12} />
                    SHORA Invited Trainer
                  </span>
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '18px', color: '#0B4F9F' }}>{stats.coursesCount}</strong>
                        <span style={{ fontSize: '12px', color: '#666' }}>Courses</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '18px', color: '#0B4F9F' }}>{stats.totalStudents}</strong>
                        <span style={{ fontSize: '12px', color: '#666' }}>Students</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '18px', color: '#0B4F9F' }}>{stats.averageRating}</strong>
                        <span style={{ fontSize: '12px', color: '#666' }}>Rating</span>
                      </div>
                    </div>
                  </div>
                  <a href="#" className="link-text">View full public profile →</a>
                </div>
              </div>

              {/* Recent Courses */}
              <div className="card">
                <div className="section-header">
                  <h3>Recent Activity</h3>
                  <a href="/trainer/courses" className="link-text-small">View all →</a>
                </div>
                {recentCourses.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#999', fontSize: '14px' }}>No courses yet</p>
                  </div>
                ) : (
                  <div className="session-history-list">
                    {recentCourses.map((course, idx) => (
                      <div key={idx} className="session-history-item">
                        <div className="session-date-small">
                          <Calendar size={14} />
                          {formatDate(course.created_at)}
                        </div>
                        <div className="session-title-small">{course.title}</div>
                        <div className="session-meta-small">
                          <span>{course.enrollment_count || 0} students</span>
                          <span className={`badge ${course.status === 'published' ? 'success' : 'neutral'}`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Settings */}
              <div className="card">
                <h3 className="card-title">Availability Settings</h3>
                <button className="btn btn-secondary btn-sm btn-full">Edit Availability</button>
                <div className="availability-info">
                  <div className="availability-item">
                    <Clock size={16} />
                    <div>
                      <div className="availability-label">Time Zone</div>
                      <div className="availability-value">East Africa Time (EAT)</div>
                    </div>
                  </div>
                  <div className="availability-item">
                    <Calendar size={16} />
                    <div>
                      <div className="availability-label">Weekly Availability</div>
                      <div className="availability-value">Mon - Fri, 6:00 AM - 6:00 PM</div>
                    </div>
                  </div>
                  <div className="availability-item">
                    <Clock size={16} />
                    <div>
                      <div className="availability-label">Preferred Session Length</div>
                      <div className="availability-value">60 - 120 minutes</div>
                    </div>
                  </div>
                  <div className="availability-item">
                    <Globe size={16} />
                    <div>
                      <div className="availability-label">Advance Notice</div>
                      <div className="availability-value">At least 48 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="card compliance-card">
                <h3 className="card-title">Compliance Checklist</h3>
                <div className="compliance-list">
                  <div className="compliance-item verified">
                    <Check size={16} />
                    <span>Identity Verified</span>
                    <span className="compliance-status">Verified</span>
                  </div>
                  <div className="compliance-item verified">
                    <Check size={16} />
                    <span>Credentials Verified</span>
                    <span className="compliance-status">Verified</span>
                  </div>
                  <div className="compliance-item verified">
                    <Check size={16} />
                    <span>Data Privacy Acknowledgement</span>
                    <span className="compliance-status">Accepted on Jan 15, 2023</span>
                  </div>
                  <div className="compliance-item verified">
                    <Check size={16} />
                    <span>Approved Content Guidelines</span>
                    <span className="compliance-status">Approved</span>
                  </div>
                </div>
              </div>

              {/* Expert Directory Notice */}
              <div className="card notice-card">
                <div className="notice-icon">
                  <Globe size={32} color="#0B4F9F" />
                </div>
                <h4 className="notice-title">Expert Directory Notice</h4>
                <p className="notice-text">
                  SHORA Institute may feature approved professionals in the Invited Expert Directory to help 
                  institutions and learners discover trusted subject matter experts.
                </p>
                <a href="#" className="link-text">Learn more about our directory →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
