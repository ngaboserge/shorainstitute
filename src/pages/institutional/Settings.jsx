import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import { useAuth } from '../../contexts/AuthContext'
import './Settings.css'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Organization Profile')
  const { institutionId } = useShoraInstitute()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [institutionData, setInstitutionData] = useState(null)
  const [teamAdmins, setTeamAdmins] = useState([])
  const [departments, setDepartments] = useState([])

  const tabs = [
    'Organization Profile',
    'Team Admins',
    'Departments',
    'Notifications',
    'Security',
    'Integrations'
  ]

  useEffect(() => {
    fetchSettingsData()
  }, [institutionId])

  const fetchSettingsData = async () => {
    try {
      setLoading(true)

      // Fetch institution data
      const { data: institution, error: institutionError } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', institutionId)
        .single()

      if (institutionError) throw institutionError
      setInstitutionData(institution)

      // Fetch team admins - currently just the current user
      setTeamAdmins([])

      // Fetch departments
      const { data: depts, error: deptsError } = await supabase
        .from('departments')
        .select('*')
        .eq('institution_id', institutionId)

      if (deptsError && deptsError.code !== 'PGRST116') throw deptsError
      setDepartments(depts || [])

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
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Organization Profile' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
                {tab === 'Team Admins' && (
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
                  <h3 className="settings-card-title">Organization Profile</h3>
                  
                  <div className="org-profile-section">
                    <div className="org-logo-section">
                      <div className="org-logo-display">
                        🛡️
                      </div>
                      <button className="btn-upload-logo">Change Logo</button>
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
                              <span className="form-value" style={{ color: '#999' }}>Not configured</span>
                            </div>
                            <div className="form-group">
                              <label className="form-label-settings">Account Manager</label>
                              <span className="form-value" style={{ color: '#999' }}>Not assigned</span>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label-settings">Website</label>
                              <span className="form-value" style={{ color: '#999' }}>Not configured</span>
                            </div>
                            <div className="form-group">
                              <label className="form-label-settings">Phone</label>
                              <span className="form-value" style={{ color: '#999' }}>Not configured</span>
                            </div>
                          </div>

                          <div className="form-group full-width">
                            <label className="form-label-settings">Email</label>
                            <span className="form-value">{institutionData.admin_email || 'Not configured'}</span>
                          </div>

                          <div className="form-group full-width">
                            <label className="form-label-settings">Physical Office</label>
                            <span className="form-value" style={{ color: '#999' }}>Not configured</span>
                          </div>

                          <button className="btn btn-primary" style={{ marginTop: '20px' }}>
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

          {activeTab === 'Team Admins' && (
            <div className="settings-content">
              <div className="card">
                <div className="team-admins-header">
                  <div>
                    <h3 className="card-title">Team Admins ({teamAdmins.length})</h3>
                    <p className="card-subtitle">Manage team access and permissions.</p>
                  </div>
                  {teamAdmins.length > 0 && <a href="#" className="view-all-admins">View all admins →</a>}
                </div>

                {loading ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                    Loading team admins...
                  </div>
                ) : teamAdmins.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <h3 style={{ marginBottom: '8px', color: '#1a1a1a' }}>No Team Admins Yet</h3>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                      Invite team members to help manage your institution's portal.
                    </p>
                    <button className="btn btn-primary">
                      <Plus size={18} />
                      Invite First Admin
                    </button>
                  </div>
                ) : (
                  <table className="settings-table">
                    <thead>
                      <tr>
                        <th>Admin User</th>
                        <th>Role</th>
                        <th>Permissions</th>
                        <th>Last Active</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamAdmins.map((admin, index) => (
                        <tr key={index}>
                          <td>
                            <div className="admin-user-cell">
                              <img src={admin.avatar} alt={admin.name} className="admin-avatar" />
                              <div className="admin-info">
                                <div className="admin-name">{admin.name}</div>
                                <div className="admin-email">{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="role-badge">{admin.role}</span>
                          </td>
                          <td className="permissions-cell">{admin.permissions}</td>
                          <td>{admin.lastActive}</td>
                          <td>
                            <span className="status-badge-active">{admin.status}</span>
                          </td>
                          <td>
                            <button className="btn-table-action">⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Departments' && (
            <div className="settings-content">
              <div className="card">
                <div className="departments-header">
                  <div>
                    <h3 className="card-title">Departments ({departments.length})</h3>
                    <p className="card-subtitle">Organize learners and data by department.</p>
                  </div>
                  <button className="btn btn-secondary">
                    <Plus size={16} />
                    Add Department
                  </button>
                </div>

                {loading ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                    Loading departments...
                  </div>
                ) : departments.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                    <h3 style={{ marginBottom: '8px', color: '#1a1a1a' }}>No Departments Yet</h3>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                      Create departments to organize your learners and track progress by team.
                    </p>
                    <button className="btn btn-primary">
                      <Plus size={18} />
                      Create First Department
                    </button>
                  </div>
                ) : (
                  <div className="departments-grid">
                    {departments.map((dept, index) => (
                      <div key={index} className="department-card">
                        <div className="dept-icon">{dept.icon || '📁'}</div>
                        <div className="dept-info">
                          <h4 className="dept-name">{dept.name}</h4>
                          <div className="dept-stats">
                            <span>{dept.learner_count || 0} learners</span>
                            <span>{dept.admin_count || 0} admins</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
