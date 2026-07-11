-- ============================================
-- ADD TEST VIDEO TO LESSON
-- ============================================
-- This adds a YouTube video to the lesson
-- so you can test the video player functionality
-- ============================================

-- Option 1: Add a short educational video about investing (3 minutes)
UPDATE lessons
SET 
  video_url = 'https://www.youtube.com/watch?v=p7HKvqRI_Bo',
  video_type = 'youtube',
  duration_seconds = 180,
  updated_at = NOW()
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

-- Verify the update
SELECT 
  id,
  title,
  video_url,
  video_type,
  duration_seconds,
  order_number
FROM lessons
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

-- ============================================
-- NEXT STEPS AFTER RUNNING THIS:
-- ============================================
-- 1. Refresh your browser page (Ctrl+R or Cmd+R)
-- 2. Clear browser cache if needed (Ctrl+Shift+R)
-- 3. The video should now load and play
-- 4. Progress tracking should work automatically
-- ============================================

-- ============================================
-- TO ADD YOUR OWN VIDEO LATER:
-- ============================================
-- For YouTube videos:
--   video_type = 'youtube'
--   video_url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'
--
-- For uploaded videos:
--   video_type = 'supabase' (or 'cloudflare', 'mux', etc.)
--   video_url = 'https://your-bucket.supabase.co/storage/v1/object/public/videos/your-video.mp4'
-- ============================================
