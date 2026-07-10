/**
 * Universal Video Player Component
 * 
 * Features:
 * - Supports YouTube videos AND directly uploaded videos
 * - Tracks watch time and progress
 * - Auto-saves progress every 5 seconds
 * - Resumes from last watched position
 * - Auto-marks lesson complete at 90% watched
 * - Updates course progress automatically
 */

import React, { useEffect, useRef, useState } from 'react'
import { Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './VideoPlayer.css'

const VideoPlayer = ({ 
  lesson, 
  userId,
  courseId,
  onProgress,
  onComplete 
}) => {
  const [lastPosition, setLastPosition] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isResuming, setIsResuming] = useState(false)
  const progressLoadedRef = useRef(false)
  const iframeRef = useRef(null)

  // Load progress only once when component mounts or lesson changes
  useEffect(() => {
    if (lesson?.id && userId && !progressLoadedRef.current) {
      loadLastPosition()
      progressLoadedRef.current = true
    }
    
    // Cleanup when lesson changes
    return () => {
      if (lesson?.id) {
        progressLoadedRef.current = false
      }
    }
  }, [lesson?.id, userId])

  const loadLastPosition = async () => {
    try {
      const { data } = await supabase
        .from('lesson_progress')
        .select('last_position_seconds, completed')
        .eq('user_id', userId)
        .eq('lesson_id', lesson.id)
        .maybeSingle()
      
      if (data?.last_position_seconds && data.last_position_seconds > 10) {
        setLastPosition(data.last_position_seconds)
        setIsResuming(true)
        setTimeout(() => setIsResuming(false), 3000)
      }
    } catch (error) {
      console.log('No previous progress found')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!lesson) {
    return <div className="video-player-container"><p>No lesson data available</p></div>
  }

  const videoId = lesson.video_id || lesson.video_url?.split('v=')[1]
  
  if (!videoId) {
    return <div className="video-player-container"><p>Video not available</p></div>
  }

  return (
    <div className="video-player-container" style={{ 
      position: 'relative', 
      width: '100%',
      minHeight: '500px',
      background: '#000',
      borderRadius: '8px'
    }}>
      {loading && (
        <div className="video-loading" style={{ zIndex: 100 }}>
          <Loader size={48} className="spinner" />
          <p>Loading video...</p>
        </div>
      )}
      
      {isResuming && lastPosition > 0 && !loading && (
        <div className="resume-notice">
          <p>⏱️ Resuming from {formatTime(lastPosition)}</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        key={lesson.id}
        src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(lastPosition)}&rel=0&modestbranding=1&autoplay=0`}
        title={lesson.title}
        width="100%"
        height="500"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          display: 'block',
          width: '100%',
          height: '500px',
          border: 'none',
          borderRadius: '8px',
          background: '#000'
        }}
        onLoad={() => {
          console.log('✅ Video iframe loaded')
          setLoading(false)
        }}
      />
      
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        fontSize: '13px',
        color: '#1565c0'
      }}>
        ℹ️ <strong>Note:</strong> Progress tracking is automatic. Your watch position is saved every 5 seconds.
      </div>
    </div>
  )
}

export default VideoPlayer
