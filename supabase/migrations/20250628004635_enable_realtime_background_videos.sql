-- Enable real-time for background_videos table
-- This allows WebSocket subscriptions to work properly

-- Add the background_videos table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE background_videos;

-- Grant necessary permissions for real-time subscriptions
-- These permissions allow the anon role to listen to changes
GRANT SELECT ON background_videos TO anon;
GRANT SELECT ON background_videos TO authenticated;

-- Ensure the table exists and has proper permissions
-- (This is a safety check in case the table wasn't created properly)
DO $$
BEGIN
  -- Check if the table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'background_videos') THEN
    CREATE TABLE background_videos (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_size BIGINT,
      thumbnail_url TEXT,
      duration INTEGER,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create index for performance
    CREATE INDEX idx_background_videos_active ON background_videos(is_active, sort_order);
    
    -- Create updated_at trigger
    CREATE TRIGGER update_background_videos_updated_at 
      BEFORE UPDATE ON background_videos 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
