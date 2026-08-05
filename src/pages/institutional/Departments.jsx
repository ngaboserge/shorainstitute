import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Plus, Building2, Users, BookOpen, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Departments.css'

const Departments = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    academic: 0,
    administrative: 0,
    learnersAssigned: 0
  })

  useEffect(() => {
    if (institutionId) {
      fetchDepartments()
    }
  }, [institutionId])

  const fetchDepartments = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('institution_departments')
        .select(`
          *,
          lead:department_lead_id(id, user_id)
        `)
        .eq('institution_id', institutionId)
        .order('name')

      if (error) throw error

      // Fetch learner counts for each department
      const { data: learnerCounts, error: learnersError } = await supabase
        .from('institution_learners')
        .select('department_id')
        .eq('institution_id', institutionId)
        .eq('status', 'active')

      if (learnersError) {
        console.error('Error fetching learner counts:', learnersError)
      }

      // Count learners per department
      const learnerCountMap = {}
      learnerCounts?.forEach(learner => {
        const deptId = learner.department_id
        if (deptId) {
          learnerCountMap[deptId] = (learnerCountMap[deptId] || 0) + 1
        }
      })

      // Add learner counts to departments
      const departmentsWithCounts = (data || []).map(dept => ({
        ...dept,
        learner_count: learnerCountMap[dept.id] || 0,
        programme_count: 0 // TODO: Add programme count if needed
      }))

      setDepartments(departmentsWithCounts)

      // Calculate stats
      const total = departmentsWithCounts.length || 0
      const academic = departmentsWithCounts.filter(d => d.type === 'academic').length || 0
      const administrative = departmentsWithCounts.filter(d => d.type === 'administrative').length || 0
      const learnersAssigned = departmentsWithCounts.reduce((sum, d) => sum + (d.learner_count || 0), 0) || 0

      setStats({ total, academic, administrative, learnersAssigned })

    } catch (err) {
      console.error('Error fetching departments:', err)
      alert(`Failed to load departments: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (deptId, deptName) => {
    if (!confirm(`Are you sure you want to delete "${deptName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('institution_departments')
        .delete()
        .eq('id', deptId)

      if (error) throw error

      alert('Department deleted successfully')
      fetchDepartments()
    } catch (err) {
      console.error('Error deleting department:', err)
      alert(`Failed to delete department: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Departments" />
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
          title="Departments"
          subtitle="Create the academic and administrative units used to organise learners and reporting."
          actions={
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/institutional/departments/create')}
            >
              <Plus size={18} />
              Add Department
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E3F2FD' }}>
                <Building2 size={24} color="#1976D2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total departments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F5E9' }}>
                <BookOpen size={24} color="#388E3C" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.academic}</div>
                <div className="stat-label">Academic Departments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFF3E0' }}>
                <Building2 size={24} color="#F57C00" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.administrative}</div>
                <div className="stat-label">Administrative Departments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E5F5' }}>
                <Users size={24} color="#7B1FA2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.learnersAssigned}</div>
                <div className="stat-label">Learners assigned</div>
              </div>
            </div>
          </div>

          {/* Departments Table */}
          <div className="card">
            {departments.length === 0 ? (
              <div className="empty-state">
                <Building2 size={48} />
                <h3>No Departments Yet</h3>
                <p>Create departments to organize your learners and generate reports.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/institutional/departments/create')}
                >
                  <Plus size={18} />
                  Add Your First Department
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Code</th>
                      <th>Department lead</th>
                      <th>Learners</th>
                      <th>Programmes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id}>
                        <td>
                          <div>
                            <strong>{dept.name}</strong>
                            <br />
                            <span className={`badge badge-${dept.type === 'academic' ? 'info' : 'secondary'}`} style={{ fontSize: '11px', marginTop: '4px' }}>
                              {dept.type === 'academic' ? 'Academic' : 'Administrative'}
                            </span>
                          </div>
                        </td>
                        <td><strong>{dept.code || '—'}</strong></td>
                        <td>{dept.leadName || '—'}</td>
                        <td>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{dept.learner_count || 0}</span>
                          {dept.learner_count === 0 && (
                            <div style={{ fontSize: '11px', color: '#FF9800', marginTop: '2px' }}>
                              Click Edit to assign →
                            </div>
                          )}
                        </td>
                        <td>{dept.programme_count || 0}</td>
                        <td>
                          <span className={`badge badge-${dept.status === 'active' ? 'success' : 'secondary'}`}>
                            {dept.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => navigate(`/institutional/departments/${dept.id}/edit`)}
                              title="Edit department"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(dept.id, dept.name)}
                              title="Delete department"
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
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>📌 How to assign learners to departments</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#666', marginBottom: '12px' }}>
              Click the <strong>Edit</strong> button next to any department to assign learners to it. The Edit page has a full learner management interface where you can add or remove learners from the department without going to a separate page.
            </p>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>✅ Best practices</h4>
            <ul style={{ fontSize: '13px', lineHeight: '1.8', color: '#666', paddingLeft: '20px' }}>
              <li>Set up both academic and administrative departments.</li>
              <li>Assign a department lead to streamline coordination.</li>
              <li>Keep department names clear and consistent.</li>
              <li><strong>Assign learners to departments from the Edit page</strong> for better organization and reporting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Departments
