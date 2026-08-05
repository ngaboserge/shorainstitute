import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  ArrowLeft, Save, Building2, Users, FileText, 
  UserCheck, Trash2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Departments.css'

const EditDepartment = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [admins, setAdmins] = useState([])
  const [learners, setLearners] = useState([])
  const [departmentLearners, setDepartmentLearners] = useState([])

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'academic',
    description: '',
    department_lead_id: '',
    status: 'active'
  })

  useEffect(() => {
    if (institutionId && id) {
      fetchDepartment()
      fetchAdmins()
      fetchLearners()
    }
  }, [institutionId, id])

  const fetchDepartment = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('institution_departments')
        .select('*')
        .eq('id', id)
        .eq('institution_id', institutionId)
        .single()

      if (error) throw error
      
      if (data) {
        setFormData({
          name: data.name || '',
          code: data.code || '',
          type: data.type || 'academic',
          description: data.description || '',
          department_lead_id: data.department_lead_id || '',
          status: data.status || 'active'
        })
      }
    } catch (err) {
      console.error('Error fetching department:', err)
      alert(`Failed to load department: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_admins')
        .select('id, user_id, email, full_name')
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (error) throw error

      if (data && data.length > 0) {
        const adminsWithNames = await Promise.all(
          data.map(async (admin) => {
            if (admin.email && admin.full_name) {
              return {
                id: admin.id,
                name: admin.full_name,
                email: admin.email
              }
            } else if (admin.user_id) {
              const { data: userData } = await supabase
                .from('users')
                .select('email, full_name')
                .eq('id', admin.user_id)
                .maybeSingle()
              
              return {
                id: admin.id,
                name: userData?.full_name || userData?.email?.split('@')[0] || 'Admin',
                email: userData?.email || 'No email'
              }
            } else {
              return {
                id: admin.id,
                name: admin.email?.split('@')[0] || 'Admin',
                email: admin.email || 'No email'
              }
            }
          })
        )
        setAdmins(adminsWithNames)
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
    }
  }

  const fetchLearners = async () => {
    try {
      // Fetch all learners for this institution
      const { data: allLearners, error: learnersError } = await supabase
        .rpc('get_institution_learners_full', {
          p_institution_id: institutionId
        })

      if (learnersError) throw learnersError

      // Separate learners by department
      const inDept = (allLearners || []).filter(l => l.department_id === id)
      const notInDept = (allLearners || []).filter(l => l.department_id !== id)

      setDepartmentLearners(inDept)
      setLearners(notInDept)
    } catch (err) {
      console.error('Error fetching learners:', err)
    }
  }

  const handleAddLearner = async (learnerId) => {
    try {
      console.log(`➕ Adding learner ${learnerId} to department ${id}`)
      
      const { data, error } = await supabase
        .from('institution_learners')
        .update({ department_id: id })
        .eq('id', learnerId)
        .select()

      if (error) throw error

      console.log('✅ Learner added successfully:', data)
      
      // Refresh learners
      await fetchLearners()
      
      // Show success message
      alert('Learner added to department successfully!')
    } catch (err) {
      console.error('❌ Error adding learner:', err)
      alert(`Failed to add learner: ${err.message}`)
    }
  }

  const handleRemoveLearner = async (learnerId) => {
    try {
      console.log(`➖ Removing learner ${learnerId} from department`)
      
      const { data, error } = await supabase
        .from('institution_learners')
        .update({ department_id: null })
        .eq('id', learnerId)
        .select()

      if (error) throw error

      console.log('✅ Learner removed successfully:', data)
      
      // Refresh learners
      await fetchLearners()
      
      // Show success message
      alert('Learner removed from department successfully!')
    } catch (err) {
      console.error('❌ Error removing learner:', err)
      alert(`Failed to remove learner: ${err.message}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      const { error } = await supabase
        .from('institution_departments')
        .update({
          name: formData.name,
          code: formData.code,
          type: formData.type,
          description: formData.description,
          department_lead_id: formData.department_lead_id || null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('institution_id', institutionId)

      if (error) throw error

      alert('Department updated successfully!')
      navigate('/institutional/departments')

    } catch (err) {
      console.error('Error updating department:', err)
      alert(`Failed to update department: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Edit Department" />
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
          title="Edit Department"
          subtitle="Update department details and manage learner assignments in one place."
          actions={
            <button className="btn btn-secondary" onClick={() => navigate('/institutional/departments')}>
              <ArrowLeft size={18} />
              Back to Departments
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Quick Guide Banner */}
          <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #1976D2 0%, #0B4F9F 100%)', color: 'white', border: 'none', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={24} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>💡 Assign Learners Directly Here</h4>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.95 }}>
                  Use the right panel to add or remove learners from this department without switching pages.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Column - Department Details */}
            <div>
              <div className="card">
                <h3 style={{ marginBottom: '24px' }}>Department Details</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Department name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Finance & Risk Management"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Department code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., FIN"
                        maxLength={10}
                      />
                    </div>

                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                      >
                        <option value="academic">Academic</option>
                        <option value="administrative">Administrative</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this department's purpose and responsibilities"
                      rows={4}
                    />
                  </div>

                  <div className="form-group">
                    <label>Department lead</label>
                    <select
                      value={formData.department_lead_id}
                      onChange={(e) => setFormData({ ...formData, department_lead_id: e.target.value })}
                    >
                      <option value="">Select a department lead (optional)</option>
                      {admins.map(admin => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button 
                      type="submit"
                      className="btn btn-primary" 
                      disabled={saving || !formData.name}
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/institutional/departments')}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Manage Learners */}
            <div>
              <div className="card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} />
                  Manage Learners
                </h3>
                
                <h4 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
                  Current Department Learners
                </h4>

                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
                  {departmentLearners.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                      <Users size={48} color="#999" />
                      <p style={{ marginTop: '12px' }}>No learners in this department</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {departmentLearners.map(learner => (
                        <div 
                          key={learner.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: '#F5F5F5',
                            borderRadius: '6px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{learner.user_name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{learner.user_email}</div>
                          </div>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleRemoveLearner(learner.id)}
                            title="Remove from department"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  Add Learners from Institution
                </h4>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {learners.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                      All learners are already assigned to departments
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {learners.map(learner => (
                        <div 
                          key={learner.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: '#FAFAFA',
                            borderRadius: '6px',
                            border: '1px solid #E0E0E0'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{learner.user_name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{learner.user_email}</div>
                            {learner.department_name && (
                              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                Currently in: {learner.department_name}
                              </div>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAddLearner(learner.id)}
                            title="Add to this department"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
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

export default EditDepartment
