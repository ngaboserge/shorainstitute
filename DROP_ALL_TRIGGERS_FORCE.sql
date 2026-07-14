-- Force drop ALL triggers by name from database
-- ============================================

-- Get list of all triggers and drop them
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Drop all triggers on course_payments
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'course_payments'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON course_payments CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
    END LOOP;
    
    -- Drop all triggers on enrollments
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'enrollments'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON enrollments CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Drop ALL related functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname 
        FROM pg_proc 
        WHERE proname LIKE '%payment%' 
        OR proname LIKE '%enroll%'
        AND proname NOT LIKE 'pg_%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.proname;
    END LOOP;
END $$;

-- Verify no triggers remain
SELECT 'Remaining triggers on course_payments:' as info, COUNT(*) as count
FROM information_schema.triggers
WHERE event_object_table = 'course_payments';

SELECT 'Remaining triggers on enrollments:' as info, COUNT(*) as count
FROM information_schema.triggers
WHERE event_object_table = 'enrollments';

-- NOW create the correct triggers
CREATE OR REPLACE FUNCTION auto_enroll_on_payment_approval() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE enrollments 
    SET payment_status = 'approved'  -- CORRECT: payment_status, not status
    WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_approved 
  AFTER UPDATE ON course_payments
  FOR EACH ROW 
  EXECUTE FUNCTION auto_enroll_on_payment_approval();

SELECT '✅ All old triggers dropped, new trigger created!' as result;
SELECT 'Hard refresh browser and test!' as next_step;
