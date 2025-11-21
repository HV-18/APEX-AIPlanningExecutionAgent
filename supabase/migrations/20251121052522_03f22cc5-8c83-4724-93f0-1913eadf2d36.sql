-- Add UPDATE policy for wellness_reports if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wellness_reports' 
    AND policyname = 'Users can update own reports'
  ) THEN
    CREATE POLICY "Users can update own reports"
    ON wellness_reports
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;