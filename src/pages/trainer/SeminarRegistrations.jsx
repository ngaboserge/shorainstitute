import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Mail, Calendar, Clock, Download, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './SeminarRegistrations.css'

const SeminarRegistrations = () => {
  const { seminarId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [seminar, setSeminar] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (user && seminarId) {
      loadData()
    }
  }, [user, seminarId])

  const loadData = async () => {
    try {
      // Load seminar
      const { data: seminarData, error: seminarError } = await supabase
        .from('seminars')
        .select('*')
        .eq('id', seminarId)
        .single()

      if (seminarError) throw seminarError

      // Check ownership
      if (seminarData.instructor_id !== user.id) {
        alert('You do not have permission to view these registrations')
        navigate('/trainer/manage-seminars')
        return
      }

      setSeminar(seminarData)

      // Load registrations
      const { data: registrationsData, error: regError } = await supabase
        .from('seminar_registrations')
        .select('*')
        .eq('seminar_id', seminarId)
        .order('created_at', { ascending: false })

      if (regError) throw regError

      setRegistrations(registrationsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reg.registration_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export')
      return
    }

    const headers = ['Name', 'Email', 'Status', 'Registered At']
    
    // Add question headers if any
    const questions = seminar?.registration_questions || []
    questions.forEach(q => headers.push(q.question))

    const rows = filteredRegistrations.map(reg => {
      const row = [
        reg.user_name || '',
        reg.user_email || '',
        reg.registration_status || 'registered',
        new Date(reg.created_at).toLocaleString()
      ]

      // Add answers
      const answers = reg.registration_answers || {}
      questions.forEach(q => {
        row.push(answers[q.id] || '')
      })

      return row
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${seminar?.title || 'seminar'}-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      registered: { bg: '#e3f2fd', color: '#0B4F9F', icon: CheckCircle },
      attended: { bg: '#e8f5e9', color: '#4caf50', icon: CheckCircle },
      cancelled: { bg: '#ffebee', color: '#f44336', icon: XCircle },
      no_show: { bg: '#fff3e0', color: '#ff9800', icon: XCircle }
    }

    const style = styles[status] || styles.registered
    const Icon = style.icon

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        background: style.bg,
        color: style.color
      }}>
        <Icon size={14} />
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading registrations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!seminar) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Seminar not found</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    total: registrations.length,
    registered: registrations.filter(r => r.registration_status === 'registered').length,
    attended: registrations.filter(r => r.registration_status === 'attended').length,
    cancelled: registrations.filter(r => r.registration_status === 'cancelled').length
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-icon"
                onClick={() => navigate('/trainer/manage-seminars')}
                style={{ background: '#f5f7fa' }}
              >
                <ArrowLeft size={20} />
              </button>
              Seminar Registrations
            </div>
          }
          subtitle={seminar.title}
          actions={
            <button 
              className="btn btn-primary"
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
            >
              <Download size={18} />
              Export CSV
            </button>
          }
        />

        <div className="content-wrapper" style={{ maxWidth: '100%', padding: '24px' }}>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd', color: '#0B4F9F' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Registrations</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd', color: '#0B4F9F' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.registered}</div>
                <div className="stat-label">Registered</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.attended}</div>
                <div className="stat-label">Attended</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {seminar.capacity - registrations.length}
                </div>
                <div className="stat-label">Spots Available</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <Filter size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="registered">Registered</option>
                <option value="attended">Attended</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container-full">
              {filteredRegistrations.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Users size={48} color="#ccc" />
                  <h3 style={{ color: '#666', marginTop: '16px', marginBottom: '8px' }}>
                    No registrations yet
                  </h3>
                  <p style={{ color: '#999' }}>
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No registrations match your filters'
                      : 'Registrations will appear here once learners sign up'
                    }
                  </p>
                </div>
              ) : (
                <table className="registrations-table-full">
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Registered At</th>
                      {seminar.registration_questions?.map(q => (
                        <th key={q.id}>{q.question}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600',
                              flexShrink: 0
                            }}>
                              {reg.user_name?.charAt(0) || 'L'}
                            </div>
                            <span style={{ fontWeight: '500' }}>
                              {reg.user_name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={14} color="#666" />
                            {reg.user_email}
                          </div>
                        </td>
                        <td>{getStatusBadge(reg.registration_status)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} color="#666" />
                            {formatDate(reg.created_at)}
                          </div>
                        </td>
                        {seminar.registration_questions?.map(q => (
                          <td key={q.id} style={{ maxWidth: '300px' }}>
                            <div style={{ 
                              whiteSpace: 'pre-wrap', 
                              wordBreak: 'break-word',
                              fontSize: '13px',
                              lineHeight: '1.5'
                            }}>
                              {reg.registration_answers?.[q.id] || '-'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ marginTop: '24px' }}>
            <h3>Seminar Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', marginTop: '16px' }}>
              <div style={{ color: '#666' }}>Date:</div>
              <div style={{ fontWeight: '500' }}>
                {new Date(seminar.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>

              <div style={{ color: '#666' }}>Time:</div>
              <div style={{ fontWeight: '500' }}>
                {seminar.start_time.slice(0, 5)} - {seminar.end_time.slice(0, 5)}
              </div>

              <div style={{ color: '#666' }}>Platform:</div>
              <div style={{ fontWeight: '500' }}>{seminar.platform || 'Zoom'}</div>

              <div style={{ color: '#666' }}>Capacity:</div>
              <div style={{ fontWeight: '500' }}>{seminar.capacity} participants</div>

              <div style={{ color: '#666' }}>Registration Rate:</div>
              <div style={{ fontWeight: '500' }}>
                {((stats.total / seminar.capacity) * 100).toFixed(1)}% filled
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeminarRegistrations
