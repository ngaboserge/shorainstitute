import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Edit, Check, Star, Clock, Globe, Shield, Calendar, MapPin, Phone, Mail, Linkedin, GraduationCap, MoreVertical } from 'lucide-react'
import './Profile.css'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)

  const credentials = [
    { type: 'Chartered Financial Analyst (CFA)', issuer: 'CFA Institute', date: 'Issued Dec 2019', status: 'Verified' },
    { type: 'Master of Business Administration (MBA)', issuer: 'University of Cape Town', date: 'Issued Dec 2015', status: 'Verified' },
    { type: 'Bachelor of Commerce (BCom)', issuer: 'Makerere University', date: 'Issued Dec 2012', status: 'Verified' },
    { type: 'Ethical Certificate or Credential', issuer: 'ICPAK (CPD) (New York)', date: '', status: 'Verified' }
  ]

  const expertise = ['Capital Markets', 'Investment Strategy', 'Corporate Finance', 'Financial Modeling', 'Valuation', 'Risk Management', 'Entrepreneurial Finance']
  
  const topicApprovals = [
    { name: 'Capital Markets Outlook & Investment Strategies', status: 'Approved' },
    { name: 'Tax Planning for Investors & SMEs', status: 'Approved' },
    { name: 'Entrepreneurial Finance: Funding & Valuation', status: 'Approved' },
    { name: 'Financial Modeling for Professionals', status: 'Pending Review' }
  ]

  const sessionHistory = [
    { date: 'May 14, 2025', title: 'Capital Markets Outlook & Investment Strategies', attendees: 128, rating: 4.8 },
    { date: 'Apr 21, 2025', title: 'Tax Planning for Investors & SMEs', attendees: 96, rating: 4.7 },
    { date: 'Mar 15, 2025', title: 'Entrepreneurial Finance: Funding & Valuation', attendees: 110, rating: 4.9 },
    { date: 'Feb 18, 2025', title: 'Financial Modeling for Professionals', attendees: 87, rating: 4.8 }
  ]

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
              <span className="member-since">Invited on Jan 15, 2023</span>
            </div>
          }
        />
        
        <div className="content-wrapper">
          <div className="profile-grid">
            {/* Left Column - Main Profile */}
            <div className="profile-main">
              {/* Profile Header Card */}
              <div className="card profile-header-card">
                <div className="profile-header-content">
                  <div className="profile-avatar-section">
                    <img 
                      src="/alex-ntale.jpg" 
                      alt="Alex Ntale" 
                      className="profile-avatar-large"
                    />
                    <button className="btn btn-sm btn-secondary edit-photo-btn">
                      <Edit size={16} />
                      Edit Photo
                    </button>
                  </div>
                  <div className="profile-info-section">
                    <div className="profile-name-row">
                      <h2 className="profile-name">Alex Ntale</h2>
                      <button className="btn-icon" onClick={() => setIsEditing(!isEditing)}>
                        <Edit size={18} />
                      </button>
                    </div>
                    <p className="profile-title">Senior Finance & Investment Consultant</p>
                    <p className="profile-subtitle">Empowering Financial Literacy | Investment Strategy | Corporate Finance</p>
                    <div className="profile-badge-row">
                      <span className="profile-badge verified">
                        <Check size={14} />
                        Ntale Advisory Group
                      </span>
                      <span className="profile-badge invited">
                        <Shield size={14} />
                        SHORA INVITED TRAINER
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Biography */}
                <div className="profile-section">
                  <div className="section-header">
                    <h3>Professional Biography</h3>
                    <button className="btn-text">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                  <p className="bio-text">
                    Alex is a seasoned financial strategist and educator with over 15 years of deep expertise in capital markets, investment 
                    management, finance, and investment strategy. He has helped thousands of professionals and institutions make informed, 
                    impactful, portfolio management, and financial modeling.
                  </p>
                  <p className="bio-text">
                    Alex is passionate about making complex financial concepts accessible to empower professionals and business leaders to 
                    make better financial decisions.
                  </p>
                </div>

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
                    <button className="btn-text">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                  <div className="social-links">
                    <a href="#" className="social-link">
                      <Linkedin size={18} />
                      linkedin.com/in/alexntale
                      <span className="external-icon">↗</span>
                    </a>
                    <a href="#" className="social-link">
                      <Globe size={18} />
                      www.ntalecfo.com
                      <span className="external-icon">↗</span>
                    </a>
                    <a href="#" className="social-link">
                      <span>@</span>
                      @alex_ntale
                      <span className="external-icon">↗</span>
                    </a>
                  </div>
                </div>
              </div>

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
                  <h3>Topic Approvals</h3>
                  <a href="#" className="link-text">View all →</a>
                </div>
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
                  <div className="preview-avatar">
                    <img src="/alex-ntale.jpg" alt="Alex Ntale" />
                  </div>
                  <h4 className="preview-name">Alex Ntale</h4>
                  <p className="preview-title">Senior Finance & Investment Consultant</p>
                  <p className="preview-org">Capital Markets | Corporate Finance | Investment Strategy</p>
                  <span className="preview-badge">
                    <Shield size={12} />
                    SHORA Invited Trainer
                  </span>
                  <a href="#" className="link-text">View full public profile →</a>
                </div>
              </div>

              {/* Session History */}
              <div className="card">
                <div className="section-header">
                  <h3>Session History</h3>
                  <a href="#" className="link-text-small">View all →</a>
                </div>
                <div className="session-history-list">
                  {sessionHistory.map((session, idx) => (
                    <div key={idx} className="session-history-item">
                      <div className="session-date-small">
                        <Calendar size={14} />
                        {session.date}
                      </div>
                      <div className="session-title-small">{session.title}</div>
                      <div className="session-meta-small">
                        <span>{session.attendees} attendees</span>
                        <span className="session-rating">
                          <Star size={12} fill="#FDB714" stroke="#FDB714" />
                          {session.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
