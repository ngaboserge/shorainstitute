import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Upload, Search, Edit, Trash2, Eye, Globe, Lock, FileText, Video, File, BookOpen, Plus, Grid, List, Download, ExternalLink } from 'lucide-react'
import './Resources.css'

const ManageResources = () => {
  const { user, profile } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'guide',
    file_format: 'pdf',
    file_url: '',
    thumbnail_url: '',
    category: '',
    level: 'all',
    is_public: true
  })

  useEffect(() => {
    if (user) {
      loadResources()
    }
  }, [user, filterType])

  const loadResources = async () => {
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('resource_type', filterType)
      }

      const { data, error } = await query

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const resourceData = {
        ...formData,
        author_name: profile?.full_name || user.email,
        created_by: user.id
      }

      if (editingResource) {
        // Update existing
        const { error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', editingResource.id)

        if (error) throw error
        alert('✅ Resource updated successfully!')
      } else {
        // Create new
        const { error } = await supabase
          .from('resources')
          .insert(resourceData)

        if (error) throw error
        alert('✅ Resource created successfully!')
      }

      setShowCreateModal(false)
      setEditingResource(null)
      resetForm()
      loadResources()
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Failed to save resource. Please try again.')
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.resource_type,
      file_format: resource.file_format || 'pdf',
      file_url: resource.file_url || '',
      thumbnail_url: resource.thumbnail_url || '',
      category: resource.category || '',
      level: resource.level || 'all',
      is_public: resource.is_public !== false
    })
    setShowCreateModal(true)
  }

  const handleViewDetails = (resource) => {
    setSelectedResource(resource)
    setShowDetailsModal(true)
  }

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)

      if (error) throw error
      alert('✅ Resource deleted')
      loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'guide',
      file_format: 'pdf',
      file_url: '',
      thumbnail_url: '',
      category: '',
      level: 'all',
      is_public: true
    })
  }

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={20} />
      case 'guide': return <BookOpen size={20} />
      case 'worksheet': return <FileText size={20} />
      case 'template': return <File size={20} />
      case 'article': return <FileText size={20} />
      case 'ebook': return <BookOpen size={20} />
      default: return <FileText size={20} />
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <Header title="Manage Resources" subtitle="Loading..." />
          <div className="content-wrapper">
            <div className="card">Loading resources...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Manage Resources" 
          subtitle="Create and manage learning materials that learners can access"
        />
        
        <div className="content-wrapper">
          {/* Header Actions */}
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'}}>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <select 
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="guide">Guides</option>
                <option value="worksheet">Worksheets</option>
                <option value="template">Templates</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="ebook">E-books</option>
              </select>
              
              {/* View Toggle */}
              <div style={{display: 'flex', gap: '4px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px'}}>
                <button
                  className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  style={{
                    background: viewMode === 'grid' ? '#E8F0FE' : 'transparent',
                    color: viewMode === 'grid' ? '#0B4F9F' : '#666'
                  }}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                  style={{
                    background: viewMode === 'list' ? '#E8F0FE' : 'transparent',
                    color: viewMode === 'list' ? '#0B4F9F' : '#666'
                  }}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm()
                setEditingResource(null)
                setShowCreateModal(true)
              }}
            >
              <Plus size={18} />
              Create Resource
            </button>
          </div>

          {/* Resources Display */}
          <div className="card">
            <h3>Your Resources ({resources.length})</h3>
            
            {resources.length === 0 ? (
              <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                <FileText size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                <p>No resources yet. Create your first resource!</p>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
                marginTop: '20px'
              }}>
                {resources.map((resource) => (
                  <div key={resource.id} className="resource-card" style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => handleViewDetails(resource)}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '100%',
                      height: '180px',
                      background: resource.thumbnail_url 
                        ? `url(${resource.thumbnail_url}) center/cover` 
                        : 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {!resource.thumbnail_url && (
                        <div style={{color: 'white', fontSize: '48px'}}>
                          {getResourceIcon(resource.resource_type)}
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div style={{position: 'absolute', top: '12px', left: '12px'}}>
                        <span style={{
                          background: '#FDB714',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {resource.resource_type}
                        </span>
                      </div>
                      
                      <div style={{position: 'absolute', top: '12px', right: '12px'}}>
                        {resource.is_public ? (
                          <Globe size={20} color="white" />
                        ) : (
                          <Lock size={20} color="white" />
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div style={{padding: '16px'}}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {resource.title}
                      </h4>
                      
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {resource.description || 'No description'}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '12px'
                      }}>
                        <span>{resource.category || 'Uncategorized'}</span>
                        <span style={{
                          background: '#f3f4f6',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          {resource.level}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '16px'
                      }}>
                        <Download size={14} />
                        <span>{resource.download_count || 0} downloads</span>
                      </div>
                      
                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        borderTop: '1px solid #f3f4f6',
                        paddingTop: '12px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{flex: 1}}
                          onClick={() => handleEdit(resource)}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-container" style={{marginTop: '20px'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Access</th>
                      <th>Downloads</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={resource.id}>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            {getResourceIcon(resource.resource_type)}
                            <span className="resource-type-badge">
                              {resource.resource_type?.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="resource-title-cell">{resource.title}</td>
                        <td>{resource.category || '-'}</td>
                        <td>
                          <span className="badge neutral">
                            {resource.level}
                          </span>
                        </td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            {resource.is_public ? <Globe size={14} /> : <Lock size={14} />}
                            <span>{resource.is_public ? 'Public' : 'Restricted'}</span>
                          </div>
                        </td>
                        <td>{resource.download_count || 0}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon" 
                              title="Edit"
                              onClick={() => handleEdit(resource)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="btn-icon" 
                              title="Delete"
                              onClick={() => handleDelete(resource.id)}
                            >
                              <Trash2 size={16} />
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h2>{editingResource ? 'Edit Resource' : 'Create New Resource'}</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      className="form-select"
                      value={formData.resource_type}
                      onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
                      required
                    >
                      <option value="guide">Guide</option>
                      <option value="worksheet">Worksheet</option>
                      <option value="template">Template</option>
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="ebook">E-book</option>
                      <option value="tool">Tool</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>File Format</label>
                    <select
                      className="form-select"
                      value={formData.file_format}
                      onChange={(e) => setFormData({...formData, file_format: e.target.value})}
                    >
                      <option value="pdf">PDF</option>
                      <option value="docx">DOCX</option>
                      <option value="xlsx">XLSX</option>
                      <option value="pptx">PPTX</option>
                      <option value="mp4">MP4</option>
                      <option value="zip">ZIP</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>File URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/file.pdf"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    required
                  />
                  <small style={{color: '#666', fontSize: '13px'}}>
                    Upload your file to a cloud storage and paste the public URL here
                  </small>
                </div>

                <div className="form-group">
                  <label>Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/thumbnail.jpg"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Finance & Investment"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Level</label>
                    <select
                      className="form-select"
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                    />
                    <span>Make this resource publicly available to all learners</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingResource ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Details Modal */}
      {showDetailsModal && selectedResource && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <div className="modal-header">
              <h2>Resource Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Thumbnail Image */}
              <div style={{
                width: '100%',
                height: '300px',
                background: selectedResource.thumbnail_url 
                  ? `url(${selectedResource.thumbnail_url}) center/cover` 
                  : 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!selectedResource.thumbnail_url && (
                  <div style={{color: 'white', fontSize: '64px'}}>
                    {getResourceIcon(selectedResource.resource_type)}
                  </div>
                )}
                
                {/* Status Badge */}
                <div style={{position: 'absolute', top: '16px', right: '16px'}}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {selectedResource.is_public ? (
                      <>
                        <Globe size={16} color="#10b981" />
                        <span style={{color: '#10b981'}}>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} color="#f59e0b" />
                        <span style={{color: '#f59e0b'}}>Restricted</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Resource Info */}
              <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <span style={{
                    background: '#FDB714',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {selectedResource.resource_type}
                  </span>
                  <span style={{
                    background: '#E8F0FE',
                    color: '#0B4F9F',
                    padding: '6px 14px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {selectedResource.file_format?.toUpperCase()}
                  </span>
                  <span style={{
                    background: '#f3f4f6',
                    padding: '6px 14px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#666'
                  }}>
                    {selectedResource.level}
                  </span>
                </div>
                
                <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1f2937'}}>
                  {selectedResource.title}
                </h3>
                
                <p style={{fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '20px'}}>
                  {selectedResource.description || 'No description provided.'}
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{fontSize: '13px', color: '#999', marginBottom: '4px'}}>Category</div>
                    <div style={{fontSize: '15px', fontWeight: '500', color: '#1f2937'}}>
                      {selectedResource.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '13px', color: '#999', marginBottom: '4px'}}>Downloads</div>
                    <div style={{fontSize: '15px', fontWeight: '500', color: '#1f2937'}}>
                      {selectedResource.download_count || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '13px', color: '#999', marginBottom: '4px'}}>Author</div>
                    <div style={{fontSize: '15px', fontWeight: '500', color: '#1f2937'}}>
                      {selectedResource.author_name}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize: '13px', color: '#999', marginBottom: '4px'}}>Created</div>
                    <div style={{fontSize: '15px', fontWeight: '500', color: '#1f2937'}}>
                      {new Date(selectedResource.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* File URL */}
                {selectedResource.file_url && (
                  <div style={{
                    padding: '16px',
                    background: '#E8F0FE',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{fontSize: '13px', color: '#0B4F9F', marginBottom: '8px', fontWeight: '500'}}>
                      File URL
                    </div>
                    <a 
                      href={selectedResource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: '#0B4F9F',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {selectedResource.file_url}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowDetailsModal(false)
                  handleEdit(selectedResource)
                }}
              >
                <Edit size={16} />
                Edit Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageResources
