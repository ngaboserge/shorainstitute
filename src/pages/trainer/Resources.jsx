import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Upload, Search, Filter, Download, Eye, Edit, Trash2, Users, FileText, Video, File, X, Play, BookOpen, Cloud, Lock, Globe, Info, MoreVertical } from 'lucide-react'
import './Resources.css'

const Resources = () => {
  const [activeTab, setActiveTab] = useState('All Courses')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const resources = [
    {
      id: 1,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200',
      title: 'Capital Markets Outlook & Investment Strategies',
      course: 'Capital Markets Outlook',
      date: 'May 14, 2025, 10:55 AM',
      linkedTo: 'Capital Markets Outlook',
      seminar: 'Live Seminar - May 14, 2025',
      access: 'Published - All Learners',
      status: 'Published'
    },
    {
      id: 2,
      type: 'pptx',
      title: 'Equity Valuation Concepts Slide Deck',
      course: 'Valuation Fundamentals',
      date: 'May 12, 2025, 9:48 AM',
      linkedTo: 'Valuation Fundamentals',
      seminar: 'Valuation Fundamentals Course',
      access: 'Restricted - Enrolled Only',
      status: 'Under Review'
    },
    {
      id: 3,
      type: 'pdf',
      title: 'DCF Model Worksheet',
      course: 'Financial Modeling',
      date: 'May 10, 2025, 3:42 PM',
      linkedTo: 'Financial Modeling',
      seminar: 'Live Seminar - May 10, 2025',
      access: 'Published - All Learners',
      status: 'Published'
    },
    {
      id: 4,
      type: 'pdf',
      title: 'Reading List: Behavioral Finance Essentials',
      course: 'Behavioral Finance',
      date: 'May 8, 2025, 11:23 AM',
      linkedTo: 'Behavioral Finance',
      seminar: 'Behavioral Finance Course',
      access: 'Restricted - Enrolled Only',
      status: 'Draft'
    },
    {
      id: 5,
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200',
      title: 'Tax Planning for Investors Q&A Session',
      course: 'Tax Planning for Investors & SMEs',
      date: 'May 7, 2025, 3:45 PM',
      linkedTo: 'Live Seminar - May 7, 2025',
      seminar: 'Tax Planning for Investors & SMEs',
      access: 'Published - All Learners',
      status: 'Published'
    }
  ]

  const getFileIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={20} />
      case 'pptx': return <FileText size={20} />
      case 'pdf': return <File size={20} />
      default: return <FileText size={20} />
    }
  }

  const getFileColor = (type) => {
    switch(type) {
      case 'video': return '#f44336'
      case 'pptx': return '#ff9800'
      case 'pdf': return '#f44336'
      default: return '#666'
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Content & Resource Manager"
          subtitle="Upload and manage learning materials and seminar resources for the sessions you lead."
        />
        
        <div className="content-wrapper">
          {/* Stats Overview */}
          <div className="resources-stats">
            <div className="resource-stat-card">
              <div className="stat-icon-wrapper blue">
                <Video size={20} />
              </div>
              <div>
                <div className="stat-label">Latest Uploaded Recording</div>
                <div className="stat-value-small">Capital Markets Outlook & Investment Strategies</div>
                <div className="stat-meta">May 14, 2025 • 1h 03:12</div>
              </div>
              <button className="btn btn-sm btn-warning">View Details</button>
            </div>

            <div className="resource-stat-card storage-card">
              <div>
                <div className="stat-label">Storage Usage</div>
                <div className="storage-value">12.4 GB <span className="storage-total">of 20 GB used</span></div>
                <div className="storage-bar">
                  <div className="storage-fill" style={{width: '62%'}}></div>
                </div>
                <div className="storage-percent">62% available</div>
              </div>
              <button className="btn btn-sm btn-secondary">Manage Storage →</button>
            </div>
          </div>

          <div className="resources-content-grid">
            {/* Main Content */}
            <div className="resources-main">
              {/* Tabs */}
              <div className="resources-tabs">
                <button className={`tab ${activeTab === 'All Courses' ? 'active' : ''}`} onClick={() => setActiveTab('All Courses')}>
                  All Courses
                </button>
                <button className={`tab ${activeTab === 'Slides' ? 'active' : ''}`} onClick={() => setActiveTab('Slides')}>
                  Slides
                </button>
                <button className={`tab ${activeTab === 'Worksheets' ? 'active' : ''}`} onClick={() => setActiveTab('Worksheets')}>
                  Worksheets
                </button>
                <button className={`tab ${activeTab === 'Recordings' ? 'active' : ''}`} onClick={() => setActiveTab('Recordings')}>
                  Recordings
                </button>
                <button className={`tab ${activeTab === 'Reading Lists' ? 'active' : ''}`} onClick={() => setActiveTab('Reading Lists')}>
                  Reading Lists
                </button>
                <button className={`tab ${activeTab === 'Templates' ? 'active' : ''}`} onClick={() => setActiveTab('Templates')}>
                  Templates
                </button>
                <button className={`tab ${activeTab === 'Downloads' ? 'active' : ''}`} onClick={() => setActiveTab('Downloads')}>
                  Downloads
                </button>
              </div>

              {/* Filters Bar */}
              <div className="filters-bar">
                <div className="search-box">
                  <Search size={18} />
                  <input type="text" placeholder="Search assets by title or keyword..." />
                </div>
                
                <select className="filter-select">
                  <option>All Courses</option>
                  <option>Capital Markets</option>
                  <option>Investment Strategies</option>
                </select>

                <select className="filter-select">
                  <option>All Permissions</option>
                  <option>Public</option>
                  <option>Restricted</option>
                </select>

                <select className="filter-select">
                  <option>All Statuses</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Under Review</option>
                </select>

                <button className="btn btn-icon">
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {/* Resources Table */}
              <div className="card">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Title ↑</th>
                        <th>Type</th>
                        <th>Linked Course / Seminar</th>
                        <th>Access</th>
                        <th>Status</th>
                        <th>Last Updated ↓</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={resource.id}>
                          <td>
                            {resource.type === 'video' ? (
                              <div className="resource-thumbnail">
                                <img src={resource.thumbnail} alt="" />
                                <div className="play-overlay">
                                  <Play size={12} fill="white" color="white" />
                                </div>
                              </div>
                            ) : (
                              <div className="resource-icon" style={{background: getFileColor(resource.type) + '20', color: getFileColor(resource.type)}}>
                                {getFileIcon(resource.type)}
                              </div>
                            )}
                          </td>
                          <td className="resource-title-cell">{resource.title}</td>
                          <td>
                            <span className="resource-type-badge" style={{background: getFileColor(resource.type) + '20', color: getFileColor(resource.type)}}>
                              {resource.type.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="linked-course">
                              <div className="course-icon">
                                <BookOpen size={16} color="#0B4F9F" />
                              </div>
                              <div>
                                <div className="course-name">{resource.linkedTo}</div>
                                <div className="seminar-name">{resource.seminar}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="access-cell">
                              {resource.access.includes('Published') ? (
                                <Users size={14} />
                              ) : (
                                <Lock size={14} />
                              )}
                              <span>{resource.access}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              resource.status === 'Published' ? 'success' : 
                              resource.status === 'Under Review' ? 'warning' : 
                              'neutral'
                            }`}>
                              {resource.status}
                            </span>
                          </td>
                          <td className="date-cell">{resource.date}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="View">
                                <Eye size={16} />
                              </button>
                              <button className="btn-icon" title="Edit">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon" title="More">
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="card upload-card">
                <div className="upload-large-zone" onClick={() => setShowUploadModal(true)}>
                  <div className="upload-icon-large">
                    <Cloud size={48} color="#0B4F9F" strokeWidth={1.5} />
                  </div>
                  <h3 className="upload-title">Drag & drop files here to upload</h3>
                  <p className="upload-subtitle">Supported formats: PPTX, PDF, DOCX, XLSX, MP4 (Max 2GB)</p>
                  <button className="btn btn-warning">Browse Files</button>
                  <a href="#" className="upload-link">Upload Guidelines →</a>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="resources-sidebar">
              {/* Resource Details */}
              <div className="card resource-detail-card">
                <button className="close-detail-btn">
                  <X size={18} />
                </button>
                <h3 className="card-title">Resource Details</h3>
                
                <div className="resource-preview">
                  <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" alt="" />
                </div>

                <div className="resource-info-section">
                  <h4 className="resource-detail-title">Capital Markets Outlook & Investment Strategies</h4>
                  
                  <div className="resource-meta-grid">
                    <div className="meta-row">
                      <span className="meta-label">Type</span>
                      <span className="meta-value">Session recording</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Linked To</span>
                      <span className="meta-value">Capital Markets Outlook<br/>Live Seminar - May 14, 2025</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Description</span>
                      <span className="meta-value">
                        Session recording covering market outlook, investment opportunities, and risk management 
                        strategies for 2025 and beyond.
                      </span>
                    </div>
                  </div>

                  <div className="resource-actions-grid">
                    <button className="btn btn-sm btn-secondary">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Access Permissions */}
              <div className="card">
                <h3 className="card-title">Access Permissions</h3>
                <p className="card-subtitle-small">Who can access this resource?</p>
                
                <div className="permission-options">
                  <label className="permission-radio">
                    <input type="radio" name="permission" />
                    <div className="permission-content">
                      <div className="permission-icon">
                        <Globe size={20} color="#0B4F9F" />
                      </div>
                      <div>
                        <div className="permission-title">All Learners (Published)</div>
                        <div className="permission-desc">Visible to learners on the platform</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="permission-radio">
                    <input type="radio" name="permission" defaultChecked />
                    <div className="permission-content">
                      <div className="permission-icon">
                        <Lock size={20} color="#0B4F9F" />
                      </div>
                      <div>
                        <div className="permission-title">Enrolled Learners Only</div>
                        <div className="permission-desc">Only learners enrolled in this course/seminar</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="permission-radio">
                    <input type="radio" name="permission" />
                    <div className="permission-content">
                      <div className="permission-icon">
                        <Users size={20} color="#0B4F9F" />
                      </div>
                      <div>
                        <div className="permission-title">Specific Groups</div>
                        <div className="permission-desc">Select groups or cohorts</div>
                      </div>
                    </div>
                  </label>
                </div>

                <button className="btn btn-secondary btn-full">Manage Permissions</button>
              </div>

              {/* Publishing Status */}
              <div className="card status-card">
                <h3 className="card-title">Publishing Status</h3>
                
                <div className="status-info">
                  <div className="status-badge published">● Published</div>
                  <p className="status-text">This resource is live and available</p>
                </div>

                <button className="btn btn-primary btn-full">Change Status ↓</button>
              </div>

              {/* Content Guidelines */}
              <div className="card guidelines-card">
                <div className="guidelines-icon">
                  <Info size={24} color="#0B4F9F" />
                </div>
                <h4 className="guidelines-title">Content is subject to review</h4>
                <p className="guidelines-text">
                  All content must be accurate, relevant, and aligned with SHORA Institute's educational standards.
                </p>
                <a href="#" className="link-text">Review Content Guidelines →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources
