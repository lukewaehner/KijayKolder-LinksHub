-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tracks table
CREATE TABLE tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  year INTEGER,
  genre VARCHAR(255),
  track_number INTEGER,
  disc_number INTEGER,
  duration INTEGER, -- in seconds
  file_url TEXT NOT NULL,
  file_size BIGINT,
  cover_image_url TEXT,
  waveform_data JSONB, -- Store waveform visualization data
  metadata JSONB, -- Additional technical metadata (bitrate, format, etc.)
  is_active BOOLEAN DEFAULT true,
  is_single BOOLEAN DEFAULT false, -- Flag to indicate if this is a single release
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create background_videos table
CREATE TABLE background_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tracks_active ON tracks(is_active, sort_order);
CREATE INDEX idx_tracks_artist ON tracks(artist);
CREATE INDEX idx_background_videos_active ON background_videos(is_active, sort_order);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tracks_updated_at 
  BEFORE UPDATE ON tracks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_videos_updated_at 
  BEFORE UPDATE ON background_videos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable Row Level Security for admin operations (temporary for development)
-- Re-enable when you implement proper authentication
-- ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE background_videos ENABLE ROW LEVEL SECURITY; 