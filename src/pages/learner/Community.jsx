import React, { useState, useEffect } from 'react'
import { MessageSquare, Users, TrendingUp, Plus, ThumbsUp, Send, Search } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './Community.css'

const Community = () => {
  const { user, profile } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  })

  useEffect(() => {
    if (user) {
      loadDiscussions()
    }
  }, [user])

  const loadDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDiscussions(data || [])
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (discussionId) => {
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (error) {
      console.error('Error loading replies:', error)
    }
  }

  const handleCreateDiscussion = async (e) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          author_id: user.id,
          author_name: profile?.full_name || user.email,
          author_role: profile?.role || 'learner'
        })

      if (error) throw error
      
      alert('✅ Discussion created successfully!')
      setShowCreateModal(false)
      setFormData({ title: '', content: '', category: 'general' })
      loadDiscussions()
    } catch (error) {
      console.error('Error creating discussion:', error)
      alert('Failed to create discussion')
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    
    if (!replyText.trim() || !selectedDiscussion) return

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: selectedDiscussion.id,
          author_id: user.id,
          author_name: profile?.full_name || user.email,
          author_role: profile?.role || 'learner',
          content: replyText
        })

      if (error) throw error

      // Update reply count
      await supabase
        .from('discussions')
        .update({ 
          reply_count: (selectedDiscussion.reply_count || 0) + 1,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', selectedDiscussion.id)

      setReplyText('')
      loadReplies(selectedDiscussion.id)
      loadDiscussions()
      alert('✅ Reply posted!')
    } catch (error) {
      console.error('Error posting reply:', error)
      alert('Failed to post reply')
    }
  }

  const handleLikeDiscussion = async (discussionId, currentLikes) => {
    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('discussion_likes')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Unlike
        await supabase
          .from('discussion_likes')
          .delete()
          .eq('id', existing.id)

        await supabase
          .from('discussions')
          .update({ like_count: Math.max(0, (currentLikes || 0) - 1) })
          .eq('id', discussionId)
      } else {
        // Like
        await supabase
          .from('discussion_likes')
          .insert({
            discussion_id: discussionId,
            user_id: user.id
          })

        await supabase
          .from('discussions')
          .update({ like_count: (currentLikes || 0) + 1 })
          .eq('id', discussionId)
      }

      loadDiscussions()
    } catch (error) {
      console.error('Error liking discussion:', error)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="learner" />
        <div className="main-content">
          <Header title="Community" subtitle="Loading..." />
          <div className="content-wrapper">
            <div className="card">Loading discussions...</div>
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
          title="Community" 
          subtitle="Connect with fellow learners, share insights, and build a stronger learning community"
        />
        <div className="content-wrapper">
          {/* Search and Create */}
          <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
            <div className="search-box" style={{flex: 1}}>
              <Search size={18} />
              <input type="text" placeholder="Search discussions..." />
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              Start Discussion
            </button>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px'}}>
            {/* Main Content */}
            <div>
              <div className="card">
                <h3>Recent Discussions</h3>
                {discussions.length === 0 ? (
                  <p style={{color: '#666', padding: '20px 0'}}>No discussions yet. Be the first to start one!</p>
                ) : (
                  discussions.map((disc) => (
                    <div 
                      key={disc.id} 
                      style={{
                        padding: '16px', 
                        background: '#f5f7fa', 
                        borderRadius: '10px', 
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedDiscussion(disc)
                        loadReplies(disc.id)
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                        <div style={{flex: 1}}>
                          <div style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>{disc.title}</div>
                          <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>{disc.content?.substring(0, 100)}...</div>
                          <div style={{fontSize: '13px', color: '#666'}}>
                            by {disc.author_name} • {disc.category} • {formatTime(disc.created_at)}
                          </div>
                        </div>
                        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                          <div 
                            style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#666'}}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLikeDiscussion(disc.id, disc.like_count)
                            }}
                          >
                            <ThumbsUp size={16} />
                            <span>{disc.like_count || 0}</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#666'}}>
                            <MessageSquare size={16} />
                            <span>{disc.reply_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discussion Detail Modal */}
              {selectedDiscussion && (
                <div className="modal-overlay" onClick={() => setSelectedDiscussion(null)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px'}}>
                    <div className="modal-header">
                      <h2>{selectedDiscussion.title}</h2>
                      <button className="close-btn" onClick={() => setSelectedDiscussion(null)}>×</button>
                    </div>
                    <div className="modal-body">
                      <div style={{marginBottom: '16px'}}>
                        <p style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                          by {selectedDiscussion.author_name} • {formatTime(selectedDiscussion.created_at)}
                        </p>
                        <p>{selectedDiscussion.content}</p>
                      </div>

                      <h4 style={{marginTop: '24px', marginBottom: '16px'}}>Replies ({replies.length})</h4>
                      
                      {replies.map((reply) => (
                        <div key={reply.id} style={{
                          padding: '12px',
                          background: '#f5f7fa',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '4px'}}>
                            {reply.author_name}
                          </div>
                          <div style={{fontSize: '14px'}}>{reply.content}</div>
                          <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                            {formatTime(reply.created_at)}
                          </div>
                        </div>
                      ))}

                      <form onSubmit={handleReply} style={{marginTop: '16px'}}>
                        <textarea
                          className="form-textarea"
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          style={{marginBottom: '12px'}}
                        />
                        <button type="submit" className="btn btn-primary">
                          <Send size={16} />
                          Post Reply
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div>
              <div className="card">
                <h3>Community Stats</h3>
                <div style={{marginTop: '20px'}}>
                  <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <MessageSquare size={32} color="#0B4F9F" style={{marginBottom: '12px'}} />
                    <div style={{fontSize: '24px', fontWeight: 700}}>{discussions.length}</div>
                    <div style={{fontSize: '13px', color: '#666'}}>Discussions</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <TrendingUp size={32} color="#4caf50" style={{marginBottom: '12px'}} />
                    <div style={{fontSize: '24px', fontWeight: 700}}>
                      {discussions.reduce((sum, d) => sum + (d.reply_count || 0), 0)}
                    </div>
                    <div style={{fontSize: '13px', color: '#666'}}>Total Replies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start a Discussion</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateDiscussion}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="general">General</option>
                    <option value="questions">Questions</option>
                    <option value="showcase">Showcase</option>
                    <option value="announcements">Announcements</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community
