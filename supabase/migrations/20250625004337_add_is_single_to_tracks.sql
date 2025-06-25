-- Add is_single column to tracks table (if table exists and column doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tracks') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'is_single') THEN
      ALTER TABLE tracks ADD COLUMN is_single BOOLEAN DEFAULT false NOT NULL;
      
      -- Update existing tracks to mark as singles if they have no album
      UPDATE tracks SET is_single = true WHERE album IS NULL OR album = '';
      
      -- Add comment to document the column
      COMMENT ON COLUMN tracks.is_single IS 'Flag to indicate if this track is a single release (true) or part of an album (false)';
    END IF;
  END IF;
END $$;
