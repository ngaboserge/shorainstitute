import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, Plus, Edit } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import { useAuth } from '../../contexts/AuthContext'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Organization Profile')
  const { institutionId } = useShoraInstitute()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [institutionData, setInstitutionData] = useState(null)
  const [teamAdmins, setTeamAdmins] = useState([])
  const [departments, setDepartments] = useState([])

  const tabs = [
    'Organization Profile',
    'Administrators',
    'Departments',
    'Notifications',
    'Security',
    'Integrations'
  ]

  // Handle tab clicks with redirects for pages that exist
  const handleTabClick = (tab) => {
    if (tab === 'Administrators') {
      navigate('/institutional/settings/administrators')
    } else if (tab === 'Departments') {
      navigate('/institutional/departments')
    } else {
      setActiveTab(tab)
    }
  }

  useEffect(() => {
    if (institutionId) {
      fetchSettingsData()
    }
  }, [institutionId])

  // Refetch when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      if (institutionId && !loading) {
        fetchSettingsData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [institutionId, loading])

  const fetchSettingsData = async () => {
    if (!institutionId) {
      console.log('No institution ID available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch institution data
      const { data: institution, error: institutionError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single()

      if (institutionError) {
        console.error('Institution error:', institutionError)
        throw institutionError
      }
      
      // Convert Google Drive URL if needed
      if (institution?.logo_url && institution.logo_url.includes('drive.google.com/file')) {
        const match = institution.logo_url.match(/\/file\/d\/([^\/]+)/)
        if (match) {
          institution.logo_url = `https://drive.google.com/uc?export=view&id=${match[1]}`
        }
      }
      
      console.log('Loaded institution data:', institution)
      setInstitutionData(institution)

      // Fetch team admins - currently just the current user
      setTeamAdmins([])

      // Fetch departments - don't throw error if table doesn't exist or no results
      try {
        const { data: depts, error: deptsError } = await supabase
          .from('institution_departments')
          .select('*')
          .eq('institution_id', institutionId)

        if (deptsError && deptsError.code !== 'PGRST116' && deptsError.code !== 'PGRST204') {
          console.warn('Departments error (non-fatal):', deptsError)
        }
        setDepartments(depts || [])
      } catch (deptErr) {
        console.warn('Could not fetch departments:', deptErr)
        setDepartments([])
      }

    } catch (error) {
      console.error('Error fetching settings data:', error)
      setInstitutionData(null)
      setTeamAdmins([])
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Settings & Team Access"
          subtitle="Manage your organization profile, team access, departments, notifications, security and integrations."
          actions={
            <>
              <button 
                className="btn btn-secondary"
                onClick={fetchSettingsData}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button className="btn btn-secondary">
                <Plus size={18} />
                Invite Admin
              </button>
              <button className="btn btn-warning">
                Save Changes
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Tabs */}
          <div className="settings-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab === 'Organization Profile' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
                {tab === 'Administrators' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )}
                {tab === 'Departments' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                )}
                {tab === 'Notifications' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                )}
                {tab === 'Security' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                )}
                {tab === 'Integrations' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16"/>
                    <path d="M5 11h14"/>
                    <path d="M6 15h12"/>
                    <path d="M10 19h4"/>
                  </svg>
                )}
                <span>{tab}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          {activeTab === 'Organization Profile' && (
            <div className="settings-content">
              <div className="settings-grid">
                <div className="card settings-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="settings-card-title">Organization Profile</h3>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/institutional/settings/profile')}
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="org-profile-section">
                    <div className="org-logo-section">
                      <div className="org-logo-display">
                        {institutionData?.logo_url ? (
                          <img 
                            src={institutionData.logo_url} 
                            alt={`${institutionData.name} logo`}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                            onError={(e) => {
                              console.error('Failed to load logo from:', institutionData.logo_url)
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : null}
                        {(!institutionData?.logo_url || !institutionData) && (
                          <div style={{ fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            🛡️
                          </div>
                        )}
                      </div>
                      <button 
                        className="btn-upload-logo"
                        onClick={() => navigate('/institutional/settings/profile')}
                      >
                        Change Logo
                      </button>
                      {institutionData?.logo_url && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', wordBreak: 'break-all' }}>
                          {institutionData.logo_url}
                        </div>
                      )}
                    </div>
                    
                    <div className="org-info-form">
                      {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                          Loading organization data...
                        </div>
                      ) : !institutionData ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                          <p style={{ color: '#666' }}>No organization data found</p>
                        </div>
                      ) : (
                        <>
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label-settings">Organization Name</label>
                              <span className="form-value">{institutionData.name || 'Not set'}</span>
                            </div>
                            <div className="form-group">
                              <label className="form-label-settings">Partner Status</label>
                              <span className="form-badge premium">{institutionData.status === 'active' ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label-settings">Sector</label>
                              <span className="form-value">{institutionData.type || 'Not configured'}</span>
                            </div>
                            <div className="form-group">
                              <label className="form-label-settings">Account Manager</label>
                              <span className="form-value">{institutionData.primary_contact_name || 'Not assigned'}</span>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label-settings">Website</label>
                              <span className="form-value">{institutionData.website || 'Not configured'}</span>
                            </div>
                            <div className="form-group">
                              <label className="form-label-settings">Phone</label>
                              <span className="form-value">{institutionData.contact_phone || 'Not configured'}</span>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label-settings">Email</label>
                              <span className="form-value">{institutionData.contact_email || 'Not configured'}</span>
                            </div>
                            <div className="form-group">
                              <label className="form-label-settings">Physical Office</label>
                              <span className="form-value">{institutionData.city ? `${institutionData.city}${institutionData.country ? `, ${institutionData.country}` : ''}` : 'Not configured'}</span>
                            </div>
                          </div>

                          <button 
                            className="btn btn-primary" 
                            style={{ marginTop: '20px' }}
                            onClick={() => navigate('/institutional/settings/profile')}
                          >
                            Edit Organization Profile
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="settings-sidebar">
                  <div className="card settings-card">
                    <h3 className="settings-card-title">Integrations</h3>
                    <p className="settings-subtitle">Connect and automate your systems.</p>
                    
                    <div className="integrations-list">
                      <div className="integration-item" style={{ opacity: 0.5 }}>
                        <div className="integration-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        </div>
                        <div className="integration-info">
                          <div className="integration-name">Single Sign-On (SSO)</div>
                          <div className="integration-status">Not configured</div>
                        </div>
                        <button className="btn-manage" disabled style={{ opacity: 0.5 }}>→</button>
                      </div>

                      <div className="integration-item" style={{ opacity: 0.5 }}>
                        <div className="integration-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        </div>
                        <div className="integration-info">
                          <div className="integration-name">HR System Import</div>
                          <div className="integration-status">Not configured</div>
                        </div>
                        <button className="btn-manage" disabled style={{ opacity: 0.5 }}>→</button>
                      </div>

                      <div className="integration-item" style={{ opacity: 0.5 }}>
                        <div className="integration-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        </div>
                        <div className="integration-info">
                          <div className="integration-name">Slack Integration</div>
                          <div className="integration-status">Not configured</div>
                        </div>
                        <button className="btn-manage" disabled style={{ opacity: 0.5 }}>→</button>
                      </div>
                    </div>

                    <button className="btn-connect-integration">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7h16"/>
                        <path d="M5 11h14"/>
                      </svg>
                      Connect Integration
                    </button>
                  </div>

                  <div className="card settings-card">
                    <h3 className="settings-card-title">Notifications</h3>
                    
                    <div className="notification-toggles">
                      <div className="notification-item">
                        <div className="notification-info">
                          <div className="notification-label">📧 Email Notifications</div>
                          <div className="notification-desc">Get learner updates and changes</div>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="notification-item">
                        <div className="notification-info">
                          <div className="notification-label">📚 Programme Updates</div>
                          <div className="notification-desc">New courses and changes</div>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="notification-item">
                        <div className="notification-info">
                          <div className="notification-label">🎓 Completion Alerts</div>
                          <div className="notification-desc">Completion and progress alerts</div>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <button className="btn-manage-preferences">
                      Manage Notification Preferences →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="settings-content">
              <div className="card">
                <h3 className="card-title">Notification Preferences</h3>
                <p className="card-subtitle">Manage how and when you receive notifications.</p>
                
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                  <p style={{ color: '#666' }}>Notification settings coming soon</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="settings-content">
              <div className="card">
                <h3 className="card-title">Security Settings</h3>
                <p className="card-subtitle">Manage your security and authentication settings.</p>
                
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                  <p style={{ color: '#666' }}>Security settings coming soon</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Integrations' && (
            <div className="settings-content">
              <div className="card">
                <h3 className="card-title">System Integrations</h3>
                <p className="card-subtitle">Connect external systems and services.</p>
                
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
                  <p style={{ color: '#666' }}>Integrations coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
