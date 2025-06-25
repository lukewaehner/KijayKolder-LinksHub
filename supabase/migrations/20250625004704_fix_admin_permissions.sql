-- Temporarily disable RLS for admin operations (if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tracks') THEN
    ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'background_videos') THEN
    ALTER TABLE background_videos DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create storage bucket policies for admin access
-- Allow public read access to all storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow all users to upload to storage buckets (for admin panel)
CREATE POLICY "Allow all uploads to audio bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow all uploads to images bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow all uploads to videos bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow all reads from storage buckets" ON storage.objects
  FOR SELECT USING (true);
