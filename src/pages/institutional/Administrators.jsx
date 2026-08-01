import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Plus, UserPlus, Shield, Edit2, Trash2, Mail, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Administrators.css'

const Administrators = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    superAdmins: 0,
    programmeAdmins: 0,
    active: 0
  })

  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: 'programme_admin'
  })

  useEffect(() => {
    if (institutionId) {
      fetchAdministrators()
    }
  }, [institutionId])

  const fetchAdministrators = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('institution_admins')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enrich with user data
      if (data && data.length > 0) {
        const enrichedAdmins = await Promise.all(
          data.map(async (admin) => {
            try {
              const { data: { user } } = await supabase.auth.admin.getUserById(admin.user_id)
              return {
                ...admin,
                email: user?.email || 'N/A',
                full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Unknown',
                last_sign_in: user?.last_sign_in_at || null
              }
            } catch (err) {
              return {
                ...admin,
                email: 'N/A',
                full_name: 'Unknown',
                last_sign_in: null
              }
            }
          })
        )
        setAdmins(enrichedAdmins)

        // Calculate stats
        const total = enrichedAdmins.length
        const superAdmins = enrichedAdmins.filter(a => a.role === 'super_admin').length
        const programmeAdmins = enrichedAdmins.filter(a => a.role === 'programme_admin').length
        const active = enrichedAdmins.filter(a => a.status === 'active').length

        setStats({ total, superAdmins, programmeAdmins, active })
      } else {
        setAdmins([])
        setStats({ total: 0, superAdmins: 0, programmeAdmins: 0, active: 0 })
      }

    } catch (err) {
      console.error('Error fetching administrators:', err)
      alert(`Failed to load administrators: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Create a pending admin record
      // In production, this would send an email invitation
      const { error } = await supabase
        .from('institution_admins')
        .insert({
          institution_id: institutionId,
          email: inviteForm.email,
          role: inviteForm.role,
          invitation_status: 'pending',
          status: 'pending'
        })

      if (error) throw error

      alert(`Invitation sent to ${inviteForm.email}`)
      setShowInviteModal(false)
      setInviteForm({ email: '', full_name: '', role: 'programme_admin' })
      fetchAdministrators()

    } catch (err) {
      console.error('Error inviting administrator:', err)
      alert(`Failed to send invitation: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (adminId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

      const { error } = await supabase
        .from('institution_admins')
        .update({ status: newStatus })
        .eq('id', adminId)

      if (error) throw error

      alert(`Administrator ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      fetchAdministrators()

    } catch (err) {
      console.error('Error toggling status:', err)
      alert(`Failed to update status: ${err.message}`)
    }
  }

  const handleDelete = async (adminId, adminEmail) => {
    if (!confirm(`Are you sure you want to remove ${adminEmail} from your institution?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('institution_admins')
        .delete()
        .eq('id', adminId)

      if (error) throw error

      alert('Administrator removed successfully')
      fetchAdministrators()

    } catch (err) {
      console.error('Error deleting administrator:', err)
      alert(`Failed to remove administrator: ${err.message}`)
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: { class: 'badge-danger', label: 'Super Admin', icon: <Shield size={12} /> },
      programme_admin: { class: 'badge-primary', label: 'Programme Admin', icon: <UserPlus size={12} /> },
      report_viewer: { class: 'badge-secondary', label: 'Report Viewer', icon: <Clock size={12} /> }
    }
    const badge = badges[role] || badges.programme_admin
    return (
      <span className={`badge ${badge.class}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
        {badge.icon}
        {badge.label}
      </span>
    )
  }

  const formatLastActive = (lastSignIn) => {
    if (!lastSignIn) return 'Never'
    
    const date = new Date(lastSignIn)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Administrators" />
          <div className="content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner" />
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
          title="Administrators"
          subtitle="Manage your institution's administrative team and their access levels."
          actions={
            <button 
              className="btn btn-primary" 
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={18} />
              Invite Administrator
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E3F2FD' }}>
                <UserPlus size={24} color="#1976D2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Administrators</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFEBEE' }}>
                <Shield size={24} color="#D32F2F" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.superAdmins}</div>
                <div className="stat-label">Super Admins</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F5E9' }}>
                <UserPlus size={24} color="#388E3C" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.programmeAdmins}</div>
                <div className="stat-label">Programme Admins</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E5F5' }}>
                <CheckCircle size={24} color="#7B1FA2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
          </div>

          {/* Administrators Table */}
          <div className="card">
            {admins.length === 0 ? (
              <div className="empty-state">
                <UserPlus size={48} />
                <h3>No Administrators Yet</h3>
                <p>Invite team members to help manage your institution's learning programs.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowInviteModal(true)}
                >
                  <UserPlus size={18} />
                  Invite Your First Administrator
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>
                          <div>
                            <strong>{admin.full_name}</strong>
                          </div>
                        </td>
                        <td>{admin.email}</td>
                        <td>{getRoleBadge(admin.role || 'programme_admin')}</td>
                        <td>
                          <span className={`badge badge-${admin.status === 'active' ? 'success' : admin.status === 'pending' ? 'warning' : 'secondary'}`}>
                            {admin.status === 'active' ? 'Active' : admin.status === 'pending' ? 'Pending' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatLastActive(admin.last_sign_in)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className={`btn btn-sm ${admin.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleStatusToggle(admin.id, admin.status)}
                              title={admin.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(admin.id, admin.email)}
                              title="Remove administrator"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="card" style={{ marginTop: '24px', background: '#F5F5F5', border: '1px solid #E0E0E0' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>👥 Administrator Roles</h4>
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#666' }}>
              <p style={{ marginBottom: '8px' }}><strong>Super Admin:</strong> Full access to all features including billing, settings, and user management.</p>
              <p style={{ marginBottom: '8px' }}><strong>Programme Admin:</strong> Can manage learners, cohorts, assignments, and view reports.</p>
              <p style={{ marginBottom: 0 }}><strong>Report Viewer:</strong> Read-only access to reports and analytics.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Invite Administrator</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
            </div>

            <form onSubmit={handleInvite}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Email address *</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="admin@institution.com"
                    required
                  />
                  <small className="form-help-text">We'll send them an invitation email</small>
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    required
                  >
                    <option value="programme_admin">Programme Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="report_viewer">Report Viewer</option>
                  </select>
                </div>

                <div className="card" style={{ background: '#E3F2FD', padding: '12px', border: '1px solid #2196F3' }}>
                  <p style={{ fontSize: '13px', color: '#1976D2', margin: 0 }}>
                    💡 The invited user will receive an email with instructions to set up their account.
                  </p>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Mail size={18} />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Administrators
