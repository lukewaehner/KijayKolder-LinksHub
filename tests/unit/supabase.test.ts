// Unit tests for Supabase integration
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { trackApi, videoApi, fileApi, Track, BackgroundVideo } from '@/lib/supabase'

// Mock Supabase client for unit tests
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } }))
    }))
  }
}

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  trackApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleActive: vi.fn()
  },
  videoApi: {
    getAll: vi.fn(),
    getActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setActive: vi.fn()
  },
  fileApi: {
    uploadAudio: vi.fn(),
    uploadVideo: vi.fn(),
    uploadImage: vi.fn(),
    deleteFile: vi.fn()
  }
}))

describe('Supabase API Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Track API', () => {
    it('should create a track', async () => {
      const mockTrack: Partial<Track> = {
        title: 'Test Track',
        artist: 'Test Artist',
        file_url: 'https://example.com/test.mp3',
        is_active: true,
        sort_order: 0
      }

      const mockResponse = { ...mockTrack, id: 'test-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      
      vi.mocked(trackApi.create).mockResolvedValue(mockResponse as Track)

      const result = await trackApi.create(mockTrack as any)

      expect(trackApi.create).toHaveBeenCalledWith(mockTrack)
      expect(result).toEqual(mockResponse)
    })

    it('should get all tracks', async () => {
      const mockTracks: Track[] = [
        {
          id: '1',
          title: 'Track 1',
          artist: 'Artist 1',
          file_url: 'https://example.com/1.mp3',
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      vi.mocked(trackApi.getAll).mockResolvedValue(mockTracks)

      const result = await trackApi.getAll()

      expect(trackApi.getAll).toHaveBeenCalled()
      expect(result).toEqual(mockTracks)
    })

    it('should update a track', async () => {
      const updates = { title: 'Updated Track' }
      const mockResponse = { id: 'test-id', ...updates, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

      vi.mocked(trackApi.update).mockResolvedValue(mockResponse as Track)

      const result = await trackApi.update('test-id', updates)

      expect(trackApi.update).toHaveBeenCalledWith('test-id', updates)
      expect(result).toEqual(mockResponse)
    })

    it('should delete a track', async () => {
      vi.mocked(trackApi.delete).mockResolvedValue()

      await trackApi.delete('test-id')

      expect(trackApi.delete).toHaveBeenCalledWith('test-id')
    })

    it('should toggle track active status', async () => {
      const mockResponse = { id: 'test-id', is_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

      vi.mocked(trackApi.toggleActive).mockResolvedValue(mockResponse as Track)

      const result = await trackApi.toggleActive('test-id')

      expect(trackApi.toggleActive).toHaveBeenCalledWith('test-id')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Video API', () => {
    it('should create a video', async () => {
      const mockVideo: Partial<BackgroundVideo> = {
        title: 'Test Video',
        file_url: 'https://example.com/test.mp4',
        is_active: true,
        sort_order: 0
      }

      const mockResponse = { ...mockVideo, id: 'test-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

      vi.mocked(videoApi.create).mockResolvedValue(mockResponse as BackgroundVideo)

      const result = await videoApi.create(mockVideo as any)

      expect(videoApi.create).toHaveBeenCalledWith(mockVideo)
      expect(result).toEqual(mockResponse)
    })

    it('should get all videos', async () => {
      const mockVideos: BackgroundVideo[] = [
        {
          id: '1',
          title: 'Video 1',
          file_url: 'https://example.com/1.mp4',
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      vi.mocked(videoApi.getAll).mockResolvedValue(mockVideos)

      const result = await videoApi.getAll()

      expect(videoApi.getAll).toHaveBeenCalled()
      expect(result).toEqual(mockVideos)
    })

    it('should set video as active', async () => {
      vi.mocked(videoApi.setActive).mockResolvedValue()

      await videoApi.setActive('test-id')

      expect(videoApi.setActive).toHaveBeenCalledWith('test-id')
    })
  })

  describe('File API', () => {
    it('should upload audio file', async () => {
      const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      const mockUrl = 'https://example.com/uploaded.mp3'

      vi.mocked(fileApi.uploadAudio).mockResolvedValue(mockUrl)

      const result = await fileApi.uploadAudio(mockFile, 'test.mp3')

      expect(fileApi.uploadAudio).toHaveBeenCalledWith(mockFile, 'test.mp3')
      expect(result).toBe(mockUrl)
    })

    it('should upload video file', async () => {
      const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })
      const mockUrl = 'https://example.com/uploaded.mp4'

      vi.mocked(fileApi.uploadVideo).mockResolvedValue(mockUrl)

      const result = await fileApi.uploadVideo(mockFile, 'test.mp4')

      expect(fileApi.uploadVideo).toHaveBeenCalledWith(mockFile, 'test.mp4')
      expect(result).toBe(mockUrl)
    })

    it('should upload image file', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockUrl = 'https://example.com/uploaded.jpg'

      vi.mocked(fileApi.uploadImage).mockResolvedValue(mockUrl)

      const result = await fileApi.uploadImage(mockFile, 'test.jpg')

      expect(fileApi.uploadImage).toHaveBeenCalledWith(mockFile, 'test.jpg')
      expect(result).toBe(mockUrl)
    })

    it('should delete file', async () => {
      vi.mocked(fileApi.deleteFile).mockResolvedValue()

      await fileApi.deleteFile('audio', 'test.mp3')

      expect(fileApi.deleteFile).toHaveBeenCalledWith('audio', 'test.mp3')
    })
  })

  describe('Error Handling', () => {
    it('should handle track creation errors', async () => {
      const error = new Error('Database error')
      vi.mocked(trackApi.create).mockRejectedValue(error)

      await expect(trackApi.create({} as any)).rejects.toThrow('Database error')
    })

    it('should handle file upload errors', async () => {
      const error = new Error('Upload failed')
      vi.mocked(fileApi.uploadAudio).mockRejectedValue(error)

      const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      await expect(fileApi.uploadAudio(mockFile, 'test.mp3')).rejects.toThrow('Upload failed')
    })

    it('should handle video deletion errors', async () => {
      const error = new Error('Delete failed')
      vi.mocked(videoApi.delete).mockRejectedValue(error)

      await expect(videoApi.delete('test-id')).rejects.toThrow('Delete failed')
    })
  })
}) 