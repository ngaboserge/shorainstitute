-- Create table for tracking which programmes/courses an institution has selected
-- Note: institutions table should exist from previous migrations (20260725000000 or 20260127000000)
-- If it doesn't exist, this will fail - make sure to run earlier migrations first

CREATE TABLE IF NOT EXISTS institution_programmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL,
  course_id UUID NOT NULL,
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(institution_id, course_id)
);

-- Add foreign key constraints only if the referenced tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institutions') THEN
    ALTER TABLE institution_programmes 
    ADD CONSTRAINT fk_institution_programmes_institution 
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE institution_programmes 
    ADD CONSTRAINT fk_institution_programmes_course 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add RLS policies
ALTER TABLE institution_programmes ENABLE ROW LEVEL SECURITY;

-- Policy: Institutions can view their own programme selections
CREATE POLICY "Institutions can view their own programmes"
  ON institution_programmes
  FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM institution_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Institutions can add programmes to their selection
CREATE POLICY "Institutions can add programmes"
  ON institution_programmes
  FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT institution_id 
      FROM institution_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Institutions can remove programmes from their selection
CREATE POLICY "Institutions can remove programmes"
  ON institution_programmes
  FOR DELETE
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM institution_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_institution_programmes_institution ON institution_programmes(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_programmes_course ON institution_programmes(course_id);

COMMENT ON TABLE institution_programmes IS 'Tracks which courses/programmes an institution has selected from the catalogue';
