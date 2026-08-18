import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Mail, Calendar, Clock, Download, Search, Filter, CheckCircle, XCircle, FileText } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import shoraLogo from '../../assets/shora-logo.png'
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
        const answer = answers[q.id]
        row.push(Array.isArray(answer) ? answer.join(', ') : answer || '')
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

  const exportToPDF = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export')
      return
    }

    // Use landscape for better width with many questions
    const questions = seminar?.registration_questions || []
    const orientation = questions.length > 2 ? 'landscape' : 'portrait'
    const doc = new jsPDF({ orientation })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor = [11, 79, 159] // #0B4F9F
    const lightBlue = [227, 242, 253] // #E3F2FD
    const gray = [102, 102, 102] // #666666
    
    // Header Section
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    // Add Logo
    const logoImg = new Image()
    logoImg.src = shoraLogo
    
    // Wait for logo to load and add it
    const addLogoAndContent = () => {
      try {
        // Add logo - positioned on the left side of the header
        const logoWidth = 30
        const logoHeight = 30
        const logoX = 15
        const logoY = 5
        
        doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight)
        
        // Title next to logo
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('SHORA INSTITUTE', logoX + logoWidth + 8, 17)
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text('Seminar Registration Report', logoX + logoWidth + 8, 27)
      } catch (error) {
        // Fallback if logo fails to load
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('SHORA INSTITUTE', pageWidth / 2, 17, { align: 'center' })
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Seminar Registration Report', pageWidth / 2, 27, { align: 'center' })
      }
      
      // Seminar Information Box
      let yPos = 48
      doc.setFillColor(...lightBlue)
      doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F')
      
      doc.setTextColor(...primaryColor)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      yPos += 8
      doc.text(seminar.title, 20, yPos)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)
      yPos += 7
      const infoLine = `${new Date(seminar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | ${seminar.start_time.slice(0, 5)}-${seminar.end_time.slice(0, 5)} | ${seminar.platform || 'Zoom'} | ${seminar.instructor_name} | ${stats.total}/${seminar.capacity} registrations`
      doc.text(infoLine, 20, yPos)
      
      // Registration Table
      yPos += 12
      
      // Create compact table with all data
      const tableColumns = [
        { header: '#', dataKey: 'num' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Date', dataKey: 'date' }
      ]
      
      // Calculate column widths
      const baseWidth = 115 // Sum of fixed columns
      const availableWidth = pageWidth - 30 - baseWidth
      const questionWidth = questions.length > 0 ? Math.max(30, availableWidth / questions.length) : 0
      
      // Add question columns with truncated headers
      questions.forEach((q, i) => {
        const maxLen = questionWidth > 40 ? 30 : 20
        tableColumns.push({
          header: q.question.length > maxLen ? q.question.substring(0, maxLen - 3) + '...' : q.question,
          dataKey: `q${i}`
        })
      })
      
      const tableRows = filteredRegistrations.map((reg, index) => {
        const row = {
          num: index + 1,
          name: reg.user_name || 'Unknown',
          email: reg.user_email || '',
          status: (reg.registration_status || 'registered').toUpperCase().substring(0, 8),
          date: new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
        
        // Add answers with smart truncation
        const answers = reg.registration_answers || {}
        questions.forEach((q, i) => {
          const answer = answers[q.id]
          let answerText = Array.isArray(answer) ? answer.join(', ') : answer || '-'
          
          // Smart truncation based on column width
          const maxLen = questionWidth > 40 ? 60 : 40
          if (answerText.length > maxLen) {
            answerText = answerText.substring(0, maxLen - 3) + '...'
          }
          row[`q${i}`] = answerText
        })
        
        return row
      })
      
      const columnStyles = {
        num: { cellWidth: 8, halign: 'center' },
        name: { cellWidth: 28 },
        email: { cellWidth: 38 },
        status: { cellWidth: 18, halign: 'center' },
        date: { cellWidth: 23 }
      }
      
      // Add dynamic widths for question columns
      questions.forEach((q, i) => {
        columnStyles[`q${i}`] = { 
          cellWidth: questionWidth,
          overflow: 'linebreak',
          cellPadding: 2,
          valign: 'top'
        }
      })
      
      autoTable(doc, {
        startY: yPos,
        columns: tableColumns,
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
          overflow: 'linebreak',
          cellPadding: 2
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [51, 51, 51],
          overflow: 'linebreak',
          cellPadding: 2,
          minCellHeight: 8
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: columnStyles,
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          // Add logo to each page
          if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
            try {
              doc.addImage(logoImg, 'PNG', 15, 5, 20, 20)
            } catch (error) {
              // Skip logo on additional pages if it fails
            }
          }
          
          // Footer
          doc.setFontSize(7)
          doc.setTextColor(...gray)
          const pageNum = doc.internal.getCurrentPageInfo().pageNumber
          const totalPages = doc.internal.getNumberOfPages()
          doc.text(
            `Page ${pageNum} of ${totalPages} | Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          )
        }
      })
      
      // Save PDF
      const fileName = `${seminar.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    }
    
    // Load logo and generate PDF
    if (logoImg.complete) {
      addLogoAndContent()
    } else {
      logoImg.onload = addLogoAndContent
      logoImg.onerror = addLogoAndContent // Fallback if logo fails
    }
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={exportToCSV}
                disabled={filteredRegistrations.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={18} />
                Export CSV
              </button>
              <button 
                className="btn btn-primary"
                onClick={exportToPDF}
                disabled={filteredRegistrations.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={18} />
                Export PDF
              </button>
            </div>
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
