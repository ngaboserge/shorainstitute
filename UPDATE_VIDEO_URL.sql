-- Update with a financial literacy video that allows embedding
-- Khan Academy Financial Literacy video (Khan Academy allows embedding)

UPDATE lessons
SET 
  video_url = 'https://www.youtube.com/watch?v=WEDIj9JBTC8',
  video_id = 'WEDIj9JBTC8',
  video_type = 'youtube'
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

-- Verify the update
SELECT id, title, video_url, video_id, video_type
FROM lessons
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';


