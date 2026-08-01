import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { BookOpen, Search, Filter, Star, Clock, Users, CheckCircle, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './ProgrammeCatalogue.css'

const ProgrammeCatalogue = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [programmes, setProgrammes] = useState([])
  const [selectedProgrammes, setSelectedProgrammes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  useEffect(() => {
    fetchProgrammes()
    fetchSelectedProgrammes()
  }, [institutionId])

  const fetchProgrammes = async () => {
    try {
      setLoading(true)

      // Fetch published courses from the platform
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('title')

      if (error) throw error

      setProgrammes(data || [])

    } catch (err) {
      console.error('Error fetching programmes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSelectedProgrammes = async () => {
    if (!institutionId) return

    try {
      // Get programmes already assigned to this institution
      const { data, error } = await supabase
        .from('institution_programmes')
        .select('course_id')
        .eq('institution_id', institutionId)

      if (error && error.code !== 'PGRST116') throw error

      setSelectedProgrammes(data?.map(p => p.course_id) || [])

    } catch (err) {
      console.error('Error fetching selected programmes:', err)
    }
  }

  const handleSelectProgramme = async (programmeId) => {
    try {
      const isSelected = selectedProgrammes.includes(programmeId)

      if (isSelected) {
        // Remove from institution
        const { error } = await supabase
          .from('institution_programmes')
          .delete()
          .eq('institution_id', institutionId)
          .eq('course_id', programmeId)

        if (error) throw error

        setSelectedProgrammes(selectedProgrammes.filter(id => id !== programmeId))
        alert('Programme removed from your institution')

      } else {
        // Add to institution
        const { error } = await supabase
          .from('institution_programmes')
          .insert({
            institution_id: institutionId,
            course_id: programmeId
          })

        if (error) throw error

        setSelectedProgrammes([...selectedProgrammes, programmeId])
        alert('Programme added to your institution')
      }

    } catch (err) {
      console.error('Error updating programme selection:', err)
      alert(`Failed to update selection: ${err.message}`)
    }
  }

  const filteredProgrammes = programmes.filter(prog => {
    const matchesSearch = prog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prog.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || prog.category === categoryFilter
    const matchesLevel = levelFilter === 'all' || prog.level === levelFilter

    return matchesSearch && matchesCategory && matchesLevel
  })

  const getCategories = () => {
    const cats = new Set(programmes.map(p => p.category).filter(Boolean))
    return ['all', ...Array.from(cats)]
  }

  const getLevels = () => {
    const levels = new Set(programmes.map(p => p.level).filter(Boolean))
    return ['all', ...Array.from(levels)]
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Programme Catalogue" />
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
          title="Programme Catalogue"
          subtitle="Browse and select learning programmes for your institution."
          actions={
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/institutional/programmes')}
            >
              <CheckCircle size={18} />
              View Selected ({selectedProgrammes.length})
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Search and Filters */}
          <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div className="search-box">
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                  placeholder="Search programmes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px', width: '100%' }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: '100%' }}
              >
                {getCategories().map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                style={{ width: '100%' }}
              >
                {getLevels().map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ marginBottom: '20px', color: '#666' }}>
            Showing {filteredProgrammes.length} of {programmes.length} programmes
            {selectedProgrammes.length > 0 && (
              <span style={{ marginLeft: '16px', color: '#2196F3', fontWeight: 500 }}>
                • {selectedProgrammes.length} selected for your institution
              </span>
            )}
          </div>

          {/* Programme Grid */}
          {filteredProgrammes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>No Programmes Found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            </div>
          ) : (
            <div className="programme-grid">
              {filteredProgrammes.map(programme => {
                const isSelected = selectedProgrammes.includes(programme.id)
                
                return (
                  <div key={programme.id} className={`programme-card ${isSelected ? 'selected' : ''}`}>
                    {isSelected && (
                      <div className="selected-badge">
                        <CheckCircle size={16} />
                        Selected
                      </div>
                    )}

                    <div className="programme-header">
                      <h3>{programme.title}</h3>
                      {programme.category && (
                        <span className="category-badge">{programme.category}</span>
                      )}
                    </div>

                    <p className="programme-description">
                      {programme.description || 'No description available'}
                    </p>

                    <div className="programme-meta">
                      {programme.level && (
                        <div className="meta-item">
                          <Star size={16} />
                          {programme.level}
                        </div>
                      )}
                      {programme.duration && (
                        <div className="meta-item">
                          <Clock size={16} />
                          {programme.duration}
                        </div>
                      )}
                      <div className="meta-item">
                        <BookOpen size={16} />
                        {programme.lesson_count || 0} lessons
                      </div>
                    </div>

                    <button 
                      className={`btn ${isSelected ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width: '100%', marginTop: '16px' }}
                      onClick={() => handleSelectProgramme(programme.id)}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle size={18} />
                          Selected
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Add to Institution
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info Panel */}
          <div className="card" style={{ marginTop: '24px', background: '#F5F5F5', border: '1px solid #E0E0E0' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>📚 About Programme Selection</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#666', marginBottom: '12px' }}>
              Select programmes that align with your institution's learning objectives. Selected programmes will be available for assignment to your learners and cohorts.
            </p>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#666', margin: 0 }}>
              Need a custom programme? Contact the SHORA team to discuss tailored content for your institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgrammeCatalogue
