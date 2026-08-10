import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Share2, Award, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ResponsiveLayout from '../../components/ResponsiveLayout'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import shoraLogo from '../../assets/shora-logo.png'
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
      // Load completed courses (certificates) - simple query first
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            instructor_name,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Enrollments query error:', error)
        throw error
      }

      console.log('Raw enrollments:', enrollments)
      
      // Log the first enrollment to see all available fields
      if (enrollments && enrollments.length > 0) {
        console.log('First enrollment fields:', Object.keys(enrollments[0]))
        console.log('First enrollment data:', enrollments[0])
      }

      // For each enrollment, try to fetch institution info (optional)
      const enrollmentsWithInstitution = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          // Check for different possible completion field names
          const completionPercentage = enrollment.completion_percentage || 
                                       enrollment.progress || 
                                       enrollment.completion || 
                                       enrollment.progress_percentage
          
          const isCompleted = enrollment.status === 'completed' || 
                             enrollment.completed === true ||
                             completionPercentage === 100
          
          console.log(`Enrollment ${enrollment.id}:`, {
            status: enrollment.status,
            completed: enrollment.completed,
            completion_percentage: enrollment.completion_percentage,
            progress: enrollment.progress,
            isCompleted
          })
          
          try {
            // Try to get institution info for this learner
            const { data: institutionData } = await supabase
              .from('institution_learners')
              .select(`
                institution_id,
                institutions (
                  id,
                  name,
                  logo_url
                )
              `)
              .eq('learner_id', user.id)
              .maybeSingle()

            return {
              ...enrollment,
              isCompleted,
              completionPercentage,
              institutionInfo: institutionData
            }
          } catch (err) {
            // If no institution found, that's fine (individual learner)
            return {
              ...enrollment,
              isCompleted,
              completionPercentage,
              institutionInfo: null
            }
          }
        })
      )

      // Completed courses = certificates - use the isCompleted flag
      const completed = enrollmentsWithInstitution?.filter(e => e.isCompleted).map(e => ({
        id: e.id,
        title: e.courses?.title || 'Course',
        course: e.courses?.title || 'Course',
        issueDate: new Date(e.completed_at || e.enrolled_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        completedAt: e.completed_at || e.enrolled_at,
        verificationId: `SHORA-${new Date().getFullYear()}-${e.id.split('-')[0].toUpperCase()}`,
        instructor: e.courses?.instructor_name || 'SHORA Institute',
        institutionName: e.institutionInfo?.institutions?.name || null,
        institutionLogo: e.institutionInfo?.institutions?.logo_url || null,
        status: 'issued'
      })) || []

      // In-progress courses eligible for certificate
      const inProgress = enrollmentsWithInstitution?.filter(e => 
        !e.isCompleted && (e.completionPercentage > 0 || e.status === 'active')
      ).map(e => ({
        id: e.courses?.id,
        title: e.courses?.title || 'Course',
        progress: e.completionPercentage || 0,
        remaining: 100 - (e.completionPercentage || 0)
      })) || []

      console.log('Completed certificates:', completed)
      console.log('In-progress courses:', inProgress)
      
      setCertificates(completed)
      setEligibleCourses(inProgress)
    } catch (error) {
      console.error('Error loading certificates:', error)
      // Still set loading to false so UI shows empty state
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async (cert) => {
    // Create a temporary certificate element for rendering
    const certElement = document.createElement('div')
    certElement.style.cssText = `
      width: 1056px;
      height: 816px;
      background: #ffffff;
      font-family: 'Georgia', 'Times New Roman', serif;
      position: absolute;
      left: -9999px;
      padding: 0;
      box-sizing: border-box;
    `

    // Prepare institution logo if available
    const institutionLogoHtml = cert.institutionLogo ? `
      <div style="text-align: right; max-width: 180px;">
        <img src="${cert.institutionLogo}" 
             style="max-height: 60px; max-width: 180px; object-fit: contain; display: block; margin: 0 0 0 auto;" 
             crossorigin="anonymous" />
        <div style="font-size: 9px; color: #7f8c8d; margin-top: 4px; font-family: 'Arial', sans-serif; text-transform: uppercase; letter-spacing: 1px;">Partner Institution</div>
      </div>
    ` : ''

    const partnershipText = cert.institutionName ? `
      <p style="font-size: 14px; color: #7f8c8d; margin: 20px 0; font-family: 'Arial', sans-serif;">
        In collaboration with <span style="color: #2c3e50; font-weight: 600;">${cert.institutionName}</span>
      </p>
    ` : ''

    const institutionSignature = cert.institutionName ? `
      <div style="text-align: center; flex: 1;">
        <div style="width: 200px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #2c3e50; padding-bottom: 8px; margin-bottom: 8px; height: 30px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #2c3e50;">Authorized</div>
          </div>
          <div style="font-size: 11px; color: #2c3e50; font-weight: 600; font-family: 'Arial', sans-serif; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Authorized Signatory</div>
          <div style="font-size: 10px; color: #95a5a6; font-family: 'Arial', sans-serif; margin-top: 3px;">${cert.institutionName}</div>
        </div>
      </div>
    ` : ''

    certElement.innerHTML = `
      <div style="width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);">
        
        <!-- Top decorative header -->
        <div style="height: 8px; background: linear-gradient(90deg, #0B4F9F 0%, #1a5fa0 50%, #0B4F9F 100%);"></div>
        
        <!-- Main border frame -->
        <div style="position: absolute; top: 25px; left: 25px; right: 25px; bottom: 25px; border: 2px solid #d5d8dc; background: white;">
          
          <!-- Inner decorative border -->
          <div style="position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 1px solid #ecf0f1;">
            
            <!-- Corner accents -->
            <div style="position: absolute; top: -1px; left: -1px; width: 60px; height: 60px; border-top: 3px solid #0B4F9F; border-left: 3px solid #0B4F9F;"></div>
            <div style="position: absolute; top: -1px; right: -1px; width: 60px; height: 60px; border-top: 3px solid #0B4F9F; border-right: 3px solid #0B4F9F;"></div>
            <div style="position: absolute; bottom: -1px; left: -1px; width: 60px; height: 60px; border-bottom: 3px solid #0B4F9F; border-left: 3px solid #0B4F9F;"></div>
            <div style="position: absolute; bottom: -1px; right: -1px; width: 60px; height: 60px; border-bottom: 3px solid #0B4F9F; border-right: 3px solid #0B4F9F;"></div>
            
            <!-- Content area -->
            <div style="padding: 50px 70px;">
              
              <!-- Header with logos -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                <!-- SHORA Logo -->
                <div style="text-align: left; max-width: 180px;">
                  <img src="${shoraLogo}" 
                       style="max-height: 60px; max-width: 180px; object-fit: contain; display: block;" 
                       crossorigin="anonymous" />
                  <div style="font-size: 9px; color: #7f8c8d; margin-top: 4px; font-family: 'Arial', sans-serif; text-transform: uppercase; letter-spacing: 1px;">Financial Education</div>
                </div>
                
                ${institutionLogoHtml}
              </div>

              <!-- Certificate Title -->
              <div style="text-align: center; margin: 35px 0 30px;">
                <div style="font-size: 16px; color: #95a5a6; letter-spacing: 4px; margin-bottom: 8px; font-family: 'Arial', sans-serif; text-transform: uppercase; font-weight: 300;">Certificate of</div>
                <div style="font-size: 48px; font-weight: bold; color: #0B4F9F; letter-spacing: 2px; margin-bottom: 8px; font-family: 'Georgia', serif; text-transform: uppercase;">Achievement</div>
                <div style="width: 180px; height: 2px; background: linear-gradient(90deg, transparent, #0B4F9F, transparent); margin: 15px auto;"></div>
              </div>

              <!-- Main Content -->
              <div style="text-align: center; margin: 35px 0;">
                <p style="font-size: 15px; color: #7f8c8d; margin-bottom: 18px; font-family: 'Arial', sans-serif; font-weight: 300;">This is to certify that</p>
                
                <h1 style="font-size: 44px; color: #2c3e50; margin: 18px 0; font-weight: 700; font-family: 'Georgia', serif; line-height: 1.2;">${profile?.full_name || 'Learner'}</h1>
                
                <p style="font-size: 15px; color: #7f8c8d; margin: 20px 0; font-family: 'Arial', sans-serif; font-weight: 300;">has successfully completed</p>
                
                <h2 style="font-size: 28px; color: #d4af37; margin: 20px 60px; line-height: 1.5; font-weight: 600; font-family: 'Georgia', serif; word-wrap: break-word; white-space: normal; word-break: normal; overflow-wrap: break-word;">${cert.course}</h2>
                
                ${partnershipText}
                
                <div style="margin-top: 25px; padding: 15px 0; background: linear-gradient(90deg, transparent, rgba(11, 79, 159, 0.05), transparent);">
                  <p style="font-size: 13px; color: #95a5a6; font-family: 'Arial', sans-serif; font-weight: 400; margin: 0;">
                    <span style="text-transform: uppercase; letter-spacing: 1px; font-size: 11px;">Date of Completion:</span><br/>
                    <strong style="color: #2c3e50; font-size: 14px; letter-spacing: 0.5px;">${cert.issueDate}</strong>
                  </p>
                </div>
              </div>

              <!-- Signature Section -->
              <div style="display: flex; justify-content: ${cert.institutionName ? 'space-around' : 'center'}; margin-top: 50px; gap: 60px;">
                <!-- Instructor Signature -->
                <div style="text-align: center; flex: 1;">
                  <div style="width: 200px; margin: 0 auto;">
                    <div style="border-bottom: 2px solid #2c3e50; padding-bottom: 8px; margin-bottom: 8px; height: 30px; display: flex; align-items: flex-end; justify-content: center;">
                      <div style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #2c3e50;">${cert.instructor}</div>
                    </div>
                    <div style="font-size: 11px; color: #2c3e50; font-weight: 600; font-family: 'Arial', sans-serif; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Course Instructor</div>
                    <div style="font-size: 10px; color: #95a5a6; font-family: 'Arial', sans-serif; margin-top: 3px;">SHORA Institute</div>
                  </div>
                </div>

                ${institutionSignature}
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 45px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                <div style="font-size: 10px; color: #bdc3c7; font-family: 'Arial', sans-serif; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">
                  Certificate ID: <strong style="color: #7f8c8d;">${cert.verificationId}</strong>
                </div>
                <div style="font-size: 9px; color: #d5d8dc; font-family: 'Arial', sans-serif; letter-spacing: 0.5px;">
                  Verify authenticity at www.shorainstitute.com/verify
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Bottom decorative footer -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #0B4F9F 0%, #1a5fa0 50%, #0B4F9F 100%);"></div>
        
      </div>
    `

    document.body.appendChild(certElement)

    try {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500))

      // Convert to canvas with high quality
      const canvas = await html2canvas(certElement, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST')

      // Save the PDF
      const fileName = `SHORA_Certificate_${cert.title.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Error generating certificate. Please try again.')
    } finally {
      // Clean up
      document.body.removeChild(certElement)
    }
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
      <ResponsiveLayout 
        title="My Certificates"
        subtitle="Loading..."
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title="My Certificates"
      subtitle="View and download your earned certificates"
      type="learner"
    >
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
        </ResponsiveLayout>
  )
}

export default Certificates
