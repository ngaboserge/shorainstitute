import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, Play, FileText, Video, BookOpen, File, Bookmark, Clock } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './Resources.css'

const Resources = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [resources, setResources] = useState([])
  const [savedResources, setSavedResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    if (user) {
      loadResources()
      loadSavedResources()
    }
  }, [user, activeTab, filterType, filterLevel])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (user) loadResources()
    }, 300)
    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const loadResources = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      // Apply type filter
      if (activeTab !== 'all') {
        query = query.eq('resource_type', activeTab)
      }
      if (filterType !== 'all') {
        query = query.eq('resource_type', filterType)
      }

      // Apply level filter
      if (filterLevel !== 'all') {
        query = query.eq('level', filterLevel)
      }

      // Apply search
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
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

  const loadSavedResources = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_resources')
        .select(`
          resource_id,
          resources (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setSavedResources(data?.map(item => item.resources) || [])
    } catch (error) {
      console.error('Error loading saved resources:', error)
    }
  }

  const handleSaveResource = async (resourceId) => {
    try {
      const { error} = await supabase
        .from('saved_resources')
        .insert({
          resource_id: resourceId,
          user_id: user.id
        })

      if (error) throw error
      loadSavedResources()
      alert('✅ Resource saved!')
    } catch (error) {
      console.error('Error saving resource:', error)
      if (error.code === '23505') {
        alert('Resource already saved')
      } else {
        alert('Failed to save resource')
      }
    }
  }

  const handleDownload = async (resource) => {
    try {
      // Track download
      await supabase
        .from('resource_downloads')
        .insert({
          resource_id: resource.id,
          user_id: user.id
        })

      // Update download count
      await supabase
        .from('resources')
        .update({ download_count: (resource.download_count || 0) + 1 })
        .eq('id', resource.id)

      // Open file URL
      if (resource.file_url) {
        window.open(resource.file_url, '_blank')
      } else {
        alert('No file URL available')
      }
    } catch (error) {
      console.error('Error downloading resource:', error)
    }
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
        <Sidebar type="learner" />
        <div className="main-content">
          <Header title="Resources & Replay Library" subtitle="Loading..." />
          <div className="content-wrapper">
            <div className="card">
              <p>Loading resources...</p>
            </div>
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
          title="Resources & Replay Library" 
          subtitle="Practical tools, expert insights, and on-demand learning to help you build financial knowledge and create lifelong wealth."
        />
        <div className="content-wrapper">
          {/* Search Bar */}
          <div className="resources-search-bar">
            <div className="search-box-large">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search resources, topics, experts and more..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filters-group">
              <select 
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Type: All</option>
                <option value="guide">Guides</option>
                <option value="worksheet">Worksheets</option>
                <option value="template">Templates</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="ebook">E-books</option>
              </select>
              <select 
                className="filter-select"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">Level: All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button className="btn btn-icon">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-nav-simple">
            <button 
              className={`tab-btn-simple ${activeTab === 'all' ? 'active' : ''}`} 
              onClick={() => setActiveTab('all')}
            >
              All Resources
            </button>
            <button 
              className={`tab-btn-simple ${activeTab === 'guide' ? 'active' : ''}`} 
              onClick={() => setActiveTab('guide')}
            >
              Guides
            </button>
            <button 
              className={`tab-btn-simple ${activeTab === 'worksheet' ? 'active' : ''}`} 
              onClick={() => setActiveTab('worksheet')}
            >
              Worksheets
            </button>
            <button 
              className={`tab-btn-simple ${activeTab === 'video' ? 'active' : ''}`} 
              onClick={() => setActiveTab('video')}
            >
              Webinar Replays
            </button>
          </div>

          {/* Resources Grid */}
          <div className="resources-grid-layout">
            <div className="resources-main">
              <div className="section-header-flex">
                <div>
                  <h3>All Resources</h3>
                  <p className="section-count">Showing {resources.length} resources</p>
                </div>
              </div>

              {resources.length === 0 ? (
                <div className="card">
                  <p>No resources found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="resources-grid">
                  {resources.map((resource) => (
                    <div key={resource.id} className="resource-card">
                      <div className="resource-image">
                        <img 
                          src={resource.thumbnail_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200'} 
                          alt={resource.title} 
                        />
                        <div className="resource-type-badge">{resource.resource_type?.toUpperCase()}</div>
                      </div>
                      <div className="resource-card-content">
                        <h4 className="resource-title">{resource.title}</h4>
                        <p className="resource-description">{resource.description}</p>
                        <div className="resource-meta-row">
                          <span className="resource-level">{resource.level}</span>
                          <span>•</span>
                          <span className="resource-info">{resource.file_format?.toUpperCase()}</span>
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleDownload(resource)}
                            style={{flex: 1}}
                          >
                            <Download size={16} />
                            Download
                          </button>
                          <button 
                            className="btn btn-icon"
                            onClick={() => handleSaveResource(resource.id)}
                            title="Save resource"
                          >
                            <Bookmark size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="resources-sidebar">
              {/* Saved Resources */}
              <div className="card">
                <div className="card-header-flex">
                  <h4>Saved Resources</h4>
                </div>
                <div className="saved-list">
                  {savedResources.length === 0 ? (
                    <p style={{fontSize: '14px', color: '#666'}}>No saved resources yet</p>
                  ) : (
                    savedResources.map((item) => (
                      <div key={item.id} className="saved-item">
                        <Bookmark size={16} className="bookmark-icon" />
                        <div className="saved-info">
                          <div className="saved-type">{item.resource_type?.toUpperCase()}</div>
                          <div className="saved-title">{item.title}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pathway Recommend */}
              <div className="card pathway-recommend">
                <div className="pathway-icon">📚</div>
                <h4>Need More Resources?</h4>
                <p>Check out our learning paths for curated content collections.</p>
                <Link to="/learner/paths" className="btn btn-outline btn-full">
                  Explore Learning Paths →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources
