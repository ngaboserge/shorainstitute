import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Share2, Award, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import jsPDF from 'jspdf'
import './Certificates.css'

const Certificates = () => {
  const { user, profile } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [eligibleCourses, setEligibleCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadCertificates()
    }
  }, [user?.id])

  const loadCertificates = async () => {
    try {
      // Load completed courses (certificates)
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            instructor_name,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // Completed courses = certificates
      const completed = enrollments?.filter(e => e.completion_percentage === 100).map(e => ({
        id: e.id,
        title: e.courses.title,
        course: e.courses.title,
        issueDate: new Date(e.completed_at || e.enrolled_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        completedAt: e.completed_at || e.enrolled_at,
        verificationId: `SHORA-${new Date().getFullYear()}-${e.id.split('-')[0].toUpperCase()}`,
        instructor: e.courses.instructor_name || 'SHORA Institute',
        status: 'issued'
      })) || []

      // In-progress courses eligible for certificate
      const inProgress = enrollments?.filter(e => 
        e.completion_percentage > 0 && e.completion_percentage < 100
      ).map(e => ({
        id: e.courses.id,
        title: e.courses.title,
        progress: e.completion_percentage,
        remaining: 100 - e.completion_percentage
      })) || []

      setCertificates(completed)
      setEligibleCourses(inProgress)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = (cert) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Set colors
    const primaryBlue = [11, 79, 159]
    const accentYellow = [253, 183, 20]
    const darkGray = [51, 51, 51]

    // Add decorative border
    pdf.setDrawColor(...primaryBlue)
    pdf.setLineWidth(3)
    pdf.rect(10, 10, 277, 190)
    
    pdf.setLineWidth(1)
    pdf.rect(15, 15, 267, 180)

    // Add SHORA logo text
    pdf.setFontSize(32)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...primaryBlue)
    pdf.text('SHORA INSTITUTE', 148.5, 40, { align: 'center' })

    // Certificate title
    pdf.setFontSize(24)
    pdf.setTextColor(...darkGray)
    pdf.text('CERTIFICATE OF COMPLETION', 148.5, 55, { align: 'center' })

    // Decorative line
    pdf.setDrawColor(...accentYellow)
    pdf.setLineWidth(0.5)
    pdf.line(90, 60, 207, 60)

    // "This is to certify that"
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...darkGray)
    pdf.text('This is to certify that', 148.5, 75, { align: 'center' })

    // Learner name
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...primaryBlue)
    pdf.text(profile?.full_name || 'Learner', 148.5, 90, { align: 'center' })

    // "Has successfully completed"
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...darkGray)
    pdf.text('has successfully completed', 148.5, 100, { align: 'center' })

    // Course title
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...primaryBlue)
    
    // Handle long course titles (split into multiple lines if needed)
    const courseTitle = cert.course
    const maxWidth = 200
    const lines = pdf.splitTextToSize(courseTitle, maxWidth)
    const startY = 110
    lines.forEach((line, index) => {
      pdf.text(line, 148.5, startY + (index * 8), { align: 'center' })
    })

    // Issue date
    const dateY = startY + (lines.length * 8) + 10
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...darkGray)
    pdf.text(`Issued on ${cert.issueDate}`, 148.5, dateY, { align: 'center' })

    // Verification ID
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Verification ID: ${cert.verificationId}`, 148.5, dateY + 7, { align: 'center' })

    // Signature section
    const sigY = 165
    
    // Signature line
    pdf.setLineWidth(0.3)
    pdf.setDrawColor(...darkGray)
    pdf.line(110, sigY, 187, sigY)
    
    // Instructor name
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...darkGray)
    pdf.text(cert.instructor, 148.5, sigY + 6, { align: 'center' })
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text('Instructor', 148.5, sigY + 11, { align: 'center' })

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(120, 120, 120)
    pdf.text('SHORA Institute - Building Financial Literacy for Africa', 148.5, 195, { align: 'center' })

    // Save the PDF
    const fileName = `SHORA_Certificate_${cert.title.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`
    pdf.save(fileName)
  }

  const handleShareCertificate = (cert) => {
    const shareText = `I've completed "${cert.course}" at SHORA Institute! 🎓\n\nVerification ID: ${cert.verificationId}`
    
    if (navigator.share) {
      navigator.share({
        title: 'My SHORA Certificate',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        // Fallback to copy
        copyToClipboard(shareText)
      })
    } else {
      copyToClipboard(shareText)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Certificate details copied to clipboard!')
    }).catch(() => {
      alert('Unable to copy. Please try again.')
    })
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="learner" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading certificates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Certificates" 
          subtitle="View and download your earned certificates"
        />
        <div className="content-wrapper">
          {certificates.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Award size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#666', marginBottom: '8px' }}>No certificates yet</h3>
              <p style={{ color: '#999', marginBottom: '24px' }}>
                Complete courses to earn certificates
              </p>
              <Link to="/learner/courses" className="btn btn-primary">
                Browse My Courses
              </Link>
            </div>
          ) : (
            <div className="certificates-grid">
              {certificates.map((cert) => (
                <div key={cert.id} className="certificate-card">
                  <div className="certificate-preview">
                    <div className="cert-badge">
                      <Award size={48} color="#FDB714" />
                    </div>
                    <div className="cert-frame">
                      <div className="cert-logo">SHORA</div>
                      <h3>CERTIFICATE</h3>
                      <p>OF COMPLETION</p>
                      <div className="cert-name">{profile?.full_name || 'Learner'}</div>
                      <div className="cert-course">{cert.course}</div>
                      <div className="cert-date">{cert.issueDate}</div>
                      <div className="cert-sig">
                        <div className="sig-line"></div>
                        <div className="sig-name">{cert.instructor}</div>
                      </div>
                    </div>
                  </div>
                  <div className="certificate-info">
                    <h4>{cert.title}</h4>
                    <p>Issued on {cert.issueDate}</p>
                    <div className="verification-id">ID: {cert.verificationId}</div>
                    <div className="cert-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownloadCertificate(cert)}
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleShareCertificate(cert)}
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {eligibleCourses.length > 0 && (
            <div className="card" style={{ marginTop: '32px' }}>
              <h3>Certificate Eligibility</h3>
              <div className="eligibility-list">
                {eligibleCourses.map((course) => (
                  <div key={course.id} className="eligibility-item">
                    <CheckCircle size={20} color="#FDB714" />
                    <div>
                      <div className="eligibility-title">{course.title}</div>
                      <div className="eligibility-status">
                        {course.progress}% complete - {course.remaining}% remaining
                      </div>
                    </div>
                    <Link 
                      to={`/learner/courses`} 
                      className="btn btn-sm btn-outline"
                    >
                      Continue Learning
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Certificates
