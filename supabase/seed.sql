-- Seed data for fallback when database is empty
-- Insert a demo track (only if no tracks exist)
INSERT INTO tracks (
  id,
  title,
  artist,
  album,
  year,
  genre,
  duration,
  file_url,
  file_size,
  cover_image_url,
  is_active,
  is_single,
  sort_order
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  'WAY TOO LONG',
  'KijayKolder',
  '',
  2024,
  'Hip Hop',
  180,
  '/audio/WAYTOOLONG.m4a',
  3600000,
  '/images/demo-cover.jpg',
  true,
  true,
  0
WHERE NOT EXISTS (SELECT 1 FROM tracks WHERE title != 'Demo Track');

-- Insert a demo background video (only if no videos exist)  
INSERT INTO background_videos (
  id,
  title,
  description,
  file_url,
  file_size,
  thumbnail_url,
  duration,
  is_active,
  sort_order
)
SELECT
  '550e8400-e29b-41d4-a716-446655440001',
  'Hibachi Background',
  'Default background video',
  '/videos/hibachi.mp4',
  25000000,
  '/images/video-placeholder.png',
  60,
  true,
  0
WHERE NOT EXISTS (SELECT 1 FROM background_videos WHERE title != 'Demo Background Video'); 