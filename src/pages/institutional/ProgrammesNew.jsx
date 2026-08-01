import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { BookOpen, Users, TrendingUp, Search, Grid, List, Calendar, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Programmes.css'

const ProgrammesNew = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [activeTab, setActiveTab] = useState('selected')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProgrammes, setSelectedProgrammes] = useState([])
  const [stats, setStats] = useState({
    totalSelected: 0,
    totalLearners: 0,
    avgProgress: 0,
    completed: 0
  })

  useEffect(() => {
    if (institutionId) {
      fetchSelectedProgrammes()
    }
  }, [institutionId])

  const fetchSelectedProgrammes = async () => {
    try {
      setLoading(true)

      // Fetch institution's selected programmes
      const { data: institutionProgs, error: progError } = await supabase
        .from('institution_programmes')
        .select('course_id')
        .eq('institution_id', institutionId)

      if (progError) throw progError

      const courseIds = institutionProgs?.map(p => p.course_id) || []

      if (courseIds.length === 0) {
        setSelectedProgrammes([])
        setLoading(false)
        return
      }

      // Fetch course details
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)

      if (coursesError) throw coursesError

      // Fetch enrollment data for these courses
      const { data: enrollmentData } = await supabase
        .from('learner_institutional_enrollments')
        .select('course_id, progress_percentage, status, learner_id')
        .eq('institution_id', institutionId)
        .in('course_id', courseIds)

      // Calculate stats for each programme
      const programmesWithStats = coursesData?.map(course => {
        const enrollments = enrollmentData?.filter(e => e.course_id === course.id) || []
        const uniqueLearners = new Set(enrollments.map(e => e.learner_id)).size
        const avgProgress = enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
          : 0
        const completed = enrollments.filter(e => e.progress_percentage >= 100).length

        return {
          ...course,
          enrolled: uniqueLearners,
          avgProgress,
          completed
        }
      }) || []

      setSelectedProgrammes(programmesWithStats)

      // Calculate overall stats
      const totalLearners = new Set(enrollmentData?.map(e => e.learner_id) || []).size
      const allProgress = enrollmentData?.map(e => e.progress_percentage || 0) || []
      const avgProgress = allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p, 0) / allProgress.length)
        : 0
      const completed = enrollmentData?.filter(e => e.progress_percentage >= 100).length || 0

      setStats({
        totalSelected: courseIds.length,
        totalLearners,
        avgProgress,
        completed
      })

    } catch (err) {
      console.error('Error fetching programmes:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProgrammes = selectedProgrammes.filter(prog =>
    prog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prog.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="My Programmes"
          subtitle="Manage your institution's selected learning programmes."
          actions={
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/institutional/programmes/browse')}
              >
                <Search size={18} />
                Browse Catalogue
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/institutional/assign-course')}
              >
                <Users size={18} />
                Assign to Learners
              </button>
            </div>
          }
        />

        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Selected Programmes</div>
                <div className="stat-value">{loading ? '...' : stats.totalSelected}</div>
                <div className="stat-meta">from catalogue</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learners Enrolled</div>
                <div className="stat-value">{loading ? '...' : stats.totalLearners}</div>
                <div className="stat-meta">across all programmes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Average Progress</div>
                <div className="stat-value">{loading ? '...' : `${stats.avgProgress}%`}</div>
                <div className="stat-meta">overall completion</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Award size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Completions</div>
                <div className="stat-value">{loading ? '...' : stats.completed}</div>
                <div className="stat-meta">courses finished</div>
              </div>
            </div>
          </div>

          {/* Tabs & Controls */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="programmes-tabs">
                <button 
                  className={`tab ${activeTab === 'selected' ? 'active' : ''}`}
                  onClick={() => setActiveTab('selected')}
                >
                  My Programmes ({filteredProgrammes.length})
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Search */}
                <div className="search-box" style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input
                    type="text"
                    placeholder="Search programmes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px', width: '250px' }}
                  />
                </div>

                {/* View Toggle */}
                <div className="view-toggle">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Programmes Display */}
          {loading ? (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#666' }}>Loading programmes...</p>
              </div>
            </div>
          ) : selectedProgrammes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <BookOpen size={64} />
                <h3>No Programmes Selected</h3>
                <p>Browse the catalogue and select programmes for your institution.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/institutional/programmes/browse')}
                  style={{ marginTop: '16px' }}
                >
                  <Search size={18} />
                  Browse Catalogue
                </button>
              </div>
            </div>
          ) : filteredProgrammes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Search size={48} />
                <h3>No Programmes Found</h3>
                <p>Try adjusting your search term.</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="programmes-grid">
                  {filteredProgrammes.map(prog => (
                    <div key={prog.id} className="programme-card" onClick={() => navigate(`/institutional/programmes/${prog.id}`)}>
                      <div className="programme-card-header">
                        {prog.category && (
                          <span className="category-badge">{prog.category}</span>
                        )}
                      </div>
                      <h3 className="programme-title">{prog.title}</h3>
                      <p className="programme-description">
                        {prog.description || 'No description available'}
                      </p>
                      <div className="programme-meta">
                        {prog.level && (
                          <div className="meta-item">
                            <Award size={14} />
                            {prog.level}
                          </div>
                        )}
                        <div className="meta-item">
                          <Users size={14} />
                          {prog.enrolled} enrolled
                        </div>
                        <div className="meta-item">
                          <TrendingUp size={14} />
                          {prog.avgProgress}% avg
                        </div>
                      </div>
                      <div className="programme-progress">
                        <div className="progress-bar-small">
                          <div 
                            className="progress-fill"
                            style={{ width: `${prog.avgProgress}%` }}
                          />
                        </div>
                        <span className="progress-text-small">{prog.completed} completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Programme</th>
                          <th>Category</th>
                          <th>Level</th>
                          <th>Enrolled</th>
                          <th>Progress</th>
                          <th>Completed</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProgrammes.map(prog => (
                          <tr key={prog.id} onClick={() => navigate(`/institutional/programmes/${prog.id}`)} style={{ cursor: 'pointer' }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={16} color="#2196F3" />
                                <strong>{prog.title}</strong>
                              </div>
                            </td>
                            <td>{prog.category || '—'}</td>
                            <td>{prog.level || '—'}</td>
                            <td>{prog.enrolled}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="progress-bar-small" style={{ width: '60px' }}>
                                  <div 
                                    className="progress-fill"
                                    style={{ width: `${prog.avgProgress}%` }}
                                  />
                                </div>
                                <span>{prog.avgProgress}%</span>
                              </div>
                            </td>
                            <td>{prog.completed}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => navigate('/institutional/assign-course', { state: { courseId: prog.id } })}
                              >
                                Assign
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Info Card */}
          {selectedProgrammes.length > 0 && (
            <div className="card" style={{ marginTop: '24px', background: '#F5F9FF', border: '1px solid #2196F3' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#2196F3' }}>
                💡 Programme Management
              </h4>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                • Click on any programme card to view details<br />
                • Use "Assign to Learners" to assign programmes to your employees<br />
                • Visit "Browse Catalogue" to add more programmes<br />
                • Track progress from the Reports & Analytics page
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgrammesNew
