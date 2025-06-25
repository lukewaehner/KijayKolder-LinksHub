import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { trackApi, Track } from '@/lib/supabase'
import { testSupabase, createTestTrack, cleanupTestData } from '../db-setup'

describe('Track API', () => {
  let testTrackId: string

  beforeEach(async () => {
    await cleanupTestData()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('create', () => {
    it('should create a new track', async () => {
      const trackData = createTestTrack()
      
      const result = await trackApi.create(trackData)
      
      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.title).toBe(trackData.title)
      expect(result.artist).toBe(trackData.artist)
      expect(result.album).toBe(trackData.album)
      expect(result.duration).toBe(trackData.duration)
      expect(result.file_url).toBe(trackData.file_url)
      expect(result.is_active).toBe(true)
      
      testTrackId = result.id
    })

    it('should create track with minimal required fields', async () => {
      const minimalTrack = {
        title: 'Minimal Track',
        artist: 'Minimal Artist',
        file_url: 'https://example.com/minimal.mp3',
        is_active: true,
        sort_order: 0,
      }
      
      const result = await trackApi.create(minimalTrack)
      
      expect(result).toBeDefined()
      expect(result.title).toBe(minimalTrack.title)
      expect(result.artist).toBe(minimalTrack.artist)
      expect(result.file_url).toBe(minimalTrack.file_url)
    })

    it('should handle metadata correctly', async () => {
      const trackData = createTestTrack({
        metadata: {
          filename: 'test.mp3',
          size: 1024000,
          type: 'audio/mpeg',
          bitrate: 320,
          duration: 180,
        },
      })
      
      const result = await trackApi.create(trackData)
      
      expect(result.metadata).toEqual(trackData.metadata)
    })
  })

  describe('getAll', () => {
    beforeEach(async () => {
      // Create multiple test tracks
      await trackApi.create(createTestTrack({ title: 'Test Track 1', sort_order: 0 }))
      await trackApi.create(createTestTrack({ title: 'Test Track 2', sort_order: 1 }))
      await trackApi.create(createTestTrack({ title: 'Test Track 3', sort_order: 2 }))
    })

    it('should return all active tracks', async () => {
      const tracks = await trackApi.getAll()
      
      expect(tracks).toBeInstanceOf(Array)
      expect(tracks.length).toBeGreaterThanOrEqual(3)
      expect(tracks.every(track => track.is_active)).toBe(true)
    })

    it('should return tracks in correct sort order', async () => {
      const tracks = await trackApi.getAll()
      
      const testTracks = tracks.filter(track => track.title.startsWith('Test Track'))
      expect(testTracks).toHaveLength(3)
      
      // Check sort order
      for (let i = 0; i < testTracks.length - 1; i++) {
        expect(testTracks[i].sort_order).toBeLessThanOrEqual(testTracks[i + 1].sort_order)
      }
    })

    it('should not return inactive tracks', async () => {
      // Create an inactive track
      await trackApi.create(createTestTrack({ 
        title: 'Inactive Track', 
        is_active: false 
      }))
      
      const tracks = await trackApi.getAll()
      
      expect(tracks.find(track => track.title === 'Inactive Track')).toBeUndefined()
    })
  })

  describe('getById', () => {
    beforeEach(async () => {
      const track = await trackApi.create(createTestTrack())
      testTrackId = track.id
    })

    it('should return track by ID', async () => {
      const track = await trackApi.getById(testTrackId)
      
      expect(track).toBeDefined()
      expect(track?.id).toBe(testTrackId)
      expect(track?.title).toBe('Test Track')
    })

    it('should return null for non-existent track', async () => {
      const track = await trackApi.getById('non-existent-id')
      
      expect(track).toBeNull()
    })
  })

  describe('update', () => {
    beforeEach(async () => {
      const track = await trackApi.create(createTestTrack())
      testTrackId = track.id
    })

    it('should update track fields', async () => {
      const updates = {
        title: 'Updated Track',
        artist: 'Updated Artist',
        album: 'Updated Album',
        duration: 240,
      }
      
      const result = await trackApi.update(testTrackId, updates)
      
      expect(result.title).toBe(updates.title)
      expect(result.artist).toBe(updates.artist)
      expect(result.album).toBe(updates.album)
      expect(result.duration).toBe(updates.duration)
    })

    it('should update metadata', async () => {
      const newMetadata = {
        filename: 'updated.mp3',
        size: 2048000,
        type: 'audio/mpeg',
        bitrate: 320,
      }
      
      const result = await trackApi.update(testTrackId, { metadata: newMetadata })
      
      expect(result.metadata).toEqual(newMetadata)
    })

    it('should update waveform data', async () => {
      const newWaveform = [0.1, 0.2, 0.3, 0.4, 0.5]
      
      const result = await trackApi.update(testTrackId, { waveform_data: newWaveform })
      
      expect(result.waveform_data).toEqual(newWaveform)
    })

    it('should throw error for non-existent track', async () => {
      const updates = { title: 'Updated Track' }
      
      await expect(trackApi.update('non-existent-id', updates)).rejects.toThrow()
    })
  })

  describe('delete', () => {
    beforeEach(async () => {
      const track = await trackApi.create(createTestTrack())
      testTrackId = track.id
    })

    it('should delete track', async () => {
      await trackApi.delete(testTrackId)
      
      const track = await trackApi.getById(testTrackId)
      expect(track).toBeNull()
    })

    it('should throw error for non-existent track', async () => {
      await expect(trackApi.delete('non-existent-id')).rejects.toThrow()
    })
  })

  describe('toggleActive', () => {
    beforeEach(async () => {
      const track = await trackApi.create(createTestTrack())
      testTrackId = track.id
    })

    it('should toggle active status', async () => {
      // Get initial status
      const initialTrack = await trackApi.getById(testTrackId)
      const initialStatus = initialTrack?.is_active
      
      // Toggle
      const result = await trackApi.toggleActive(testTrackId)
      
      expect(result.is_active).toBe(!initialStatus)
      
      // Toggle again
      const result2 = await trackApi.toggleActive(testTrackId)
      
      expect(result2.is_active).toBe(initialStatus)
    })

    it('should throw error for non-existent track', async () => {
      await expect(trackApi.toggleActive('non-existent-id')).rejects.toThrow()
    })
  })

  describe('file operations', () => {
    it('should handle file URLs correctly', async () => {
      const trackData = createTestTrack({
        file_url: 'https://supabase.co/storage/v1/object/public/audio/test.mp3',
        cover_image_url: 'https://supabase.co/storage/v1/object/public/images/cover.jpg',
      })
      
      const result = await trackApi.create(trackData)
      
      expect(result.file_url).toBe(trackData.file_url)
      expect(result.cover_image_url).toBe(trackData.cover_image_url)
    })

    it('should handle file size correctly', async () => {
      const trackData = createTestTrack({
        file_size: 5242880, // 5MB
      })
      
      const result = await trackApi.create(trackData)
      
      expect(result.file_size).toBe(5242880)
    })
  })

  describe('data validation', () => {
    it('should handle special characters in text fields', async () => {
      const trackData = createTestTrack({
        title: 'Track with "quotes" & symbols!',
        artist: 'Artist with émojis 🎵',
        album: 'Album with unicode: 中文',
      })
      
      const result = await trackApi.create(trackData)
      
      expect(result.title).toBe(trackData.title)
      expect(result.artist).toBe(trackData.artist)
      expect(result.album).toBe(trackData.album)
    })

    it('should handle very long text fields', async () => {
      const longText = 'A'.repeat(255) // Max length for VARCHAR(255)
      const trackData = createTestTrack({
        title: longText,
        artist: longText,
        album: longText,
      })
      
      const result = await trackApi.create(trackData)
      
      expect(result.title).toBe(longText)
      expect(result.artist).toBe(longText)
      expect(result.album).toBe(longText)
    })
  })
}) 