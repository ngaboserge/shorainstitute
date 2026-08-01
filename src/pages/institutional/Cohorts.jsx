import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Plus, Users, Calendar, BookOpen, TrendingUp, Edit2, Trash2, Archive, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Cohorts.css'

const Cohorts = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [cohorts, setCohorts] = useState([])
  const [activeTab, setActiveTab] = useState('all') // all, active, draft, completed
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    completed: 0,
    totalLearners: 0
  })

  useEffect(() => {
    if (institutionId) {
      fetchCohorts()
    }
  }, [institutionId, activeTab])

  const fetchCohorts = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('institution_cohorts')
        .select(`
          *,
          department:department_id(id, name),
          manager:cohort_manager_id(id, user_id)
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })

      // Filter by tab
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query

      if (error) throw error

      // Enrich with member counts
      if (data && data.length > 0) {
        const enrichedCohorts = await Promise.all(
          data.map(async (cohort) => {
            const { count } = await supabase
              .from('institution_cohort_members')
              .select('*', { count: 'exact', head: true })
              .eq('cohort_id', cohort.id)

            return {
              ...cohort,
              memberCount: count || cohort.enrolled_count || 0
            }
          })
        )

        setCohorts(enrichedCohorts)

        // Calculate stats
        const total = enrichedCohorts.length
        const active = enrichedCohorts.filter(c => c.status === 'active').length
        const draft = enrichedCohorts.filter(c => c.status === 'draft').length
        const completed = enrichedCohorts.filter(c => c.status === 'completed').length
        const totalLearners = enrichedCohorts.reduce((sum, c) => sum + c.memberCount, 0)

        setStats({ total, active, draft, completed, totalLearners })
      } else {
        setCohorts([])
        setStats({ total: 0, active: 0, draft: 0, completed: 0, totalLearners: 0 })
      }

    } catch (err) {
      console.error('Error fetching cohorts:', err)
      alert(`Failed to load cohorts: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'badge-secondary', label: 'Draft' },
      active: { class: 'badge-success', label: 'Active' },
      completed: { class: 'badge-info', label: 'Completed' },
      archived: { class: 'badge-secondary', label: 'Archived' }
    }
    const badge = badges[status] || badges.draft
    return <span className={`badge ${badge.class}`}>{badge.label}</span>
  }

  const handleDelete = async (cohortId, cohortName) => {
    if (!confirm(`Are you sure you want to delete cohort "${cohortName}"? This will remove all learner assignments.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('institution_cohorts')
        .delete()
        .eq('id', cohortId)

      if (error) throw error

      alert('Cohort deleted successfully')
      fetchCohorts()
    } catch (err) {
      console.error('Error deleting cohort:', err)
      alert(`Failed to delete cohort: ${err.message}`)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Cohorts" />
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
          title="Cohorts"
          subtitle="Organise learners into scheduled programme groups."
          actions={
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/institutional/cohorts/create')}
            >
              <Plus size={18} />
              Create Cohort
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E3F2FD' }}>
                <Users size={24} color="#1976D2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Cohorts</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F5E9' }}>
                <TrendingUp size={24} color="#388E3C" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFF3E0' }}>
                <Edit2 size={24} color="#F57C00" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.draft}</div>
                <div className="stat-label">Draft</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E1F5FE' }}>
                <Archive size={24} color="#0288D1" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E5F5' }}>
                <UserCheck size={24} color="#7B1FA2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalLearners}</div>
                <div className="stat-label">Total Learners</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: '24px' }}>
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({stats.active})
            </button>
            <button 
              className={`tab ${activeTab === 'draft' ? 'active' : ''}`}
              onClick={() => setActiveTab('draft')}
            >
              Draft ({stats.draft})
            </button>
            <button 
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({stats.completed})
            </button>
          </div>

          {/* Cohorts Table */}
          <div className="card">
            {cohorts.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No Cohorts Yet</h3>
                <p>Create a cohort to organize learners into scheduled programme groups.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/institutional/cohorts/create')}
                >
                  <Plus size={18} />
                  Create Your First Cohort
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cohort name</th>
                      <th>Programme</th>
                      <th>Department</th>
                      <th>Learners</th>
                      <th>Delivery format</th>
                      <th>Start date</th>
                      <th>End date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((cohort) => (
                      <tr key={cohort.id}>
                        <td>
                          <div>
                            <strong>{cohort.name}</strong>
                            {cohort.code && (
                              <>
                                <br />
                                <small style={{ color: '#666' }}>{cohort.code}</small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>{cohort.programme_id ? 'Programme Assigned' : '—'}</td>
                        <td>{cohort.department?.name || '—'}</td>
                        <td>
                          <strong>{cohort.memberCount}</strong>
                          {cohort.capacity && ` / ${cohort.capacity}`}
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {cohort.delivery_format || 'Hybrid'}
                          </span>
                        </td>
                        <td>{formatDate(cohort.start_date)}</td>
                        <td>{formatDate(cohort.end_date)}</td>
                        <td>{getStatusBadge(cohort.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => navigate(`/institutional/cohorts/${cohort.id}/edit`)}
                              title="Edit cohort"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(cohort.id, cohort.name)}
                              title="Delete cohort"
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
        </div>
      </div>
    </div>
  )
}

export default Cohorts
