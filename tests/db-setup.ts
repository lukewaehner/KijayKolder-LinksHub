// Database test setup for Supabase
import { createClient } from '@supabase/supabase-js'

// Test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Create test Supabase client
export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test data helpers
export const createTestTrack = (overrides = {}) => ({
  title: 'Test Track',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 180,
  file_url: 'https://example.com/test.mp3',
  file_size: 1024000,
  cover_image_url: 'https://example.com/cover.jpg',
  waveform_data: [0.5, 0.7, 0.3, 0.8, 0.6],
  metadata: {
    filename: 'test.mp3',
    size: 1024000,
    type: 'audio/mpeg',
  },
  is_active: true,
  sort_order: 0,
  ...overrides,
})

export const createTestVideo = (overrides = {}) => ({
  title: 'Test Video',
  description: 'Test video description',
  file_url: 'https://example.com/test.mp4',
  file_size: 2048000,
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  duration: 60,
  is_active: true,
  sort_order: 0,
  ...overrides,
})

// Cleanup helpers
export const cleanupTestData = async () => {
  try {
    // Clean up test tracks
    await testSupabase
      .from('tracks')
      .delete()
      .like('title', 'Test Track%')

    // Clean up test videos
    await testSupabase
      .from('background_videos')
      .delete()
      .like('title', 'Test Video%')
  } catch (error) {
    console.warn('Cleanup error:', error)
  }
} 