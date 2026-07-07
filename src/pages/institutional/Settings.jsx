import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, Plus } from 'lucide-react'
import './Settings.css'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Organization Profile')

  const tabs = [
    'Organization Profile',
    'Team Admins',
    'Departments',
    'Notifications',
    'Security',
    'Integrations'
  ]

  const teamAdmins = [
    {
      name: 'Jane Mukimana',
      email: 'jane@email.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'Super Admin',
      permissions: 'All Access',
      lastActive: 'Today, 9:12 AM',
      status: 'Active'
    },
    {
      name: 'Eric Mukaire',
      email: 'eric.mukaire@rw',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Admin',
      permissions: 'All Access',
      lastActive: 'Yesterday, 4:32 PM',
      status: 'Active'
    },
    {
      name: 'Noemi Kavanera',
      email: 'n.kavanera@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'Programme Manager',
      permissions: 'Programs, Learners, Reports',
      lastActive: 'May 1, 2026',
      status: 'Active'
    },
    {
      name: 'David Twagiramhe',
      email: 'd.twagiram@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=13',
      role: 'Reports Analyst',
      permissions: 'Reports & Analytics',
      lastActive: 'Apr 30, 2026',
      status: 'Active'
    },
    {
      name: 'Aline Kagaju',
      email: 'a.kagaju@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=9',
      role: 'Content Coordinator',
      permissions: 'Programs, Learners',
      lastActive: 'Apr 29, 2026',
      status: 'Active'
    }
  ]

  const departments = [
    {
      name: 'Credit & Risk',
      icon: '🛡️',
      learners: 298,
      admins: 12
    },
    {
      name: 'Finance',
      icon: '💼',
      learners: 333,
      admins: 14
    },
    {
      name: 'HR & Admin',
      icon: '👥',
      learners: 286,
      admins: 9
    },
    {
      name: 'Operations',
      icon: '⚙️',
      learners: 276,
      admins: 11
    },
    {
      name: 'IT',
      icon: '💻',
      learners: 217,
      admins: 10
    }
  ]

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
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label-settings">Organization Name</label>
                          <span className="form-value">Rwanda Development Bank</span>
                        </div>
                        <div className="form-group">
                          <label className="form-label-settings">Partner Status</label>
                          <span className="form-badge premium">Premium Partner</span>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label-settings">Sector</label>
                          <span className="form-value">Financial Services</span>
                        </div>
                        <div className="form-group">
                          <label className="form-label-settings">Account Manager</label>
                          <span className="form-value">Eric Mugisha</span>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label-settings">Website</label>
                          <span className="form-value">www.rdb.rw</span>
                        </div>
                        <div className="form-group">
                          <label className="form-label-settings">Phone</label>
                          <span className="form-value">+250 788 123 456</span>
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label-settings">Email</label>
                        <span className="form-value">info@rdb.rw</span>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label-settings">Physical Office</label>
                        <span className="form-value">KN 3 Ave, Kigali, Rwanda</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-sidebar">
                  <div className="card settings-card">
                    <h3 className="settings-card-title">Integrations</h3>
                    <p className="settings-subtitle">Connect and automate your systems.</p>
                    
                    <div className="integrations-list">
                      <div className="integration-item">
                        <div className="integration-icon connected">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 11l3 3L22 4"/>
                          </svg>
                        </div>
                        <div className="integration-info">
                          <div className="integration-name">Single Sign-On (SSO)</div>
                          <div className="integration-status">SAML 2.0 Connected</div>
                        </div>
                        <button className="btn-manage">→</button>
                      </div>

                      <div className="integration-item">
                        <div className="integration-icon connected">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 11l3 3L22 4"/>
                          </svg>
                        </div>
                        <div className="integration-info">
                          <div className="integration-name">HR System Import</div>
                          <div className="integration-status">Workday Connected</div>
                        </div>
                        <button className="btn-manage">→</button>
                      </div>

                      <div className="integration-item">
                        <div className="integration-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        </div>
                        <div className="integration-info">
                          <div className="integration-name">Slack Integration</div>
                          <div className="integration-status">Auto-provisioning</div>
                        </div>
                        <button className="btn-manage">→</button>
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
                    <h3 className="card-title">Team Admins (8)</h3>
                    <p className="card-subtitle">Manage team access and permissions.</p>
                  </div>
                  <a href="#" className="view-all-admins">View all admins →</a>
                </div>

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
              </div>
            </div>
          )}

          {activeTab === 'Departments' && (
            <div className="settings-content">
              <div className="card">
                <div className="departments-header">
                  <div>
                    <h3 className="card-title">Departments (5)</h3>
                    <p className="card-subtitle">Organize learners and data by department.</p>
                  </div>
                  <button className="btn btn-secondary">
                    <Plus size={16} />
                    Manage Departments
                  </button>
                </div>

                <div className="departments-grid">
                  {departments.map((dept, index) => (
                    <div key={index} className="department-card">
                      <div className="dept-icon">{dept.icon}</div>
                      <div className="dept-info">
                        <h4 className="dept-name">{dept.name}</h4>
                        <div className="dept-stats">
                          <span>{dept.learners} learners</span>
                          <span>{dept.admins} admins</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
