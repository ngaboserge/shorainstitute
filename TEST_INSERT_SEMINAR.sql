-- Test direct insert to verify RLS is disabled
INSERT INTO seminars (
  title,
  description,
  instructor_id,
  instructor_name,
  date,
  start_time,
  end_time,
  capacity,
  status
) VALUES (
  'Test Seminar',
  'Testing if RLS is really disabled',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  CURRENT_DATE + 7,
  '10:00:00',
  '11:00:00',
  50,
  'upcoming'
);

-- Verify it was inserted
SELECT * FROM seminars ORDER BY created_at DESC LIMIT 1;
