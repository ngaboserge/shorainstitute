-- Create a function that bypasses RLS for inserts
CREATE OR REPLACE FUNCTION public.insert_seminar_bypass_rls(
  p_title TEXT,
  p_description TEXT,
  p_instructor_id UUID,
  p_instructor_name TEXT,
  p_seminar_type TEXT,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_platform TEXT,
  p_meeting_link TEXT,
  p_capacity INTEGER,
  p_category TEXT,
  p_level TEXT,
  p_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with creator's permissions, bypassing RLS
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO seminars (
    title, description, instructor_id, instructor_name,
    seminar_type, date, start_time, end_time, 
    platform, meeting_link, capacity, category, level, status
  ) VALUES (
    p_title, p_description, p_instructor_id, p_instructor_name,
    p_seminar_type, p_date, p_start_time, p_end_time,
    p_platform, p_meeting_link, p_capacity, p_category, p_level, p_status
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.insert_seminar_bypass_rls TO anon, authenticated;

SELECT '✅ RLS bypass function created! But first, check if policies exist with CHECK_POLICIES_AND_GRANTS.sql' as result;
