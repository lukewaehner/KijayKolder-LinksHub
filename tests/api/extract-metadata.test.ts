import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { extractMetadataHandler } from '@/app/api/extract-metadata/route'

// Mock the metadata extraction handler
const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return extractMetadataHandler(req, res)
  }
  res.status(405).json({ error: 'Method not allowed' })
}

// Create test server
const createTestServer = () => {
  return createServer(async (req, res) => {
    const mockReq = req as any
    const mockRes = res as any
    
    // Add Next.js specific properties
    mockReq.method = req.method
    mockReq.headers = req.headers
    mockReq.body = null
    
    // Parse body for POST requests
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        try {
          mockReq.body = JSON.parse(body)
          await mockHandler(mockReq, mockRes)
        } catch (error) {
          res.status(400).json({ error: 'Invalid JSON' })
        }
      })
    } else {
      await mockHandler(mockReq, mockRes)
    }
  })
}

describe('Extract Metadata API', () => {
  let server: any

  beforeEach(() => {
    server = createTestServer()
  })

  afterEach(() => {
    server.close()
  })

  describe('POST /api/extract-metadata', () => {
    it('should extract metadata from valid request', async () => {
      const testData = {
        fileUrl: 'https://example.com/test.mp3',
        trackId: 'test-track-id',
        fileName: 'test.mp3'
      }

      const response = await request(server)
        .post('/api/extract-metadata')
        .send(testData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('extracted_metadata')
    })

    it('should handle missing required parameters', async () => {
      const testData = {
        fileUrl: 'https://example.com/test.mp3'
        // Missing trackId and fileName
      }

      const response = await request(server)
        .post('/api/extract-metadata')
        .send(testData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Missing required parameters')
    })

    it('should handle invalid file URLs', async () => {
      const testData = {
        fileUrl: 'invalid-url',
        trackId: 'test-track-id',
        fileName: 'test.mp3'
      }

      const response = await request(server)
        .post('/api/extract-metadata')
        .send(testData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should handle different file types', async () => {
      const fileTypes = [
        { fileName: 'test.mp3', expectedFormat: 'audio/mp3' },
        { fileName: 'test.flac', expectedFormat: 'audio/flac' },
        { fileName: 'test.wav', expectedFormat: 'audio/wav' }
      ]

      for (const fileType of fileTypes) {
        const testData = {
          fileUrl: `https://example.com/${fileType.fileName}`,
          trackId: `test-track-${fileType.fileName}`,
          fileName: fileType.fileName
        }

        const response = await request(server)
          .post('/api/extract-metadata')
          .send(testData)
          .expect(200)

        expect(response.body.data.extracted_metadata.format).toBe(fileType.expectedFormat)
      }
    })

    it('should generate waveform data', async () => {
      const testData = {
        fileUrl: 'https://example.com/test.mp3',
        trackId: 'test-track-id',
        fileName: 'test.mp3'
      }

      const response = await request(server)
        .post('/api/extract-metadata')
        .send(testData)
        .expect(200)

      expect(response.body.data.extracted_metadata).toHaveProperty('waveform_data')
      expect(Array.isArray(response.body.data.extracted_metadata.waveform_data)).toBe(true)
      expect(response.body.data.extracted_metadata.waveform_data.length).toBeGreaterThan(0)
    })

    it('should estimate duration based on file size', async () => {
      const testData = {
        fileUrl: 'https://example.com/test.mp3',
        trackId: 'test-track-id',
        fileName: 'test.mp3'
      }

      const response = await request(server)
        .post('/api/extract-metadata')
        .send(testData)
        .expect(200)

      expect(response.body.data.extracted_metadata).toHaveProperty('duration')
      expect(typeof response.body.data.extracted_metadata.duration).toBe('number')
      expect(response.body.data.extracted_metadata.duration).toBeGreaterThan(0)
    })

    it('should handle CORS preflight requests', async () => {
      await request(server)
        .options('/api/extract-metadata')
        .expect(200)
    })

    it('should reject non-POST methods', async () => {
      await request(server)
        .get('/api/extract-metadata')
        .expect(405)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      const testData = {
        fileUrl: 'https://nonexistent-domain-12345.com/test.mp3',
        trackId: 'test-track-id',
        fileName: 'test.mp3'
      }

      const response = await request(server)
        .post('/api/extract-metadata')
        .send(testData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/extract-metadata')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })
}) 