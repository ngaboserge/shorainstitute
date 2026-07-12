import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Upload, Search, Edit, Trash2, Eye, Globe, Lock, FileText, Video, File, BookOpen, Plus } from 'lucide-react'
import './Resources.css'

const ManageResources = () => {
  const { user, profile } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [filterType, setFilterType] = useState('all')

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
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '24px'}}>
            <div style={{display: 'flex', gap: '12px'}}>
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

          {/* Resources Grid */}
          <div className="card">
            <h3>Your Resources ({resources.length})</h3>
            
            {resources.length === 0 ? (
              <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                <FileText size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                <p>No resources yet. Create your first resource!</p>
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
    </div>
  )
}

export default ManageResources
