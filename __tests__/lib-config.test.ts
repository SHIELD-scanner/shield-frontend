// __tests__/lib-config.test.ts
import { getBackendUrl, getBackendApiUrl } from '../src/lib/config'

describe('Config utility', () => {
  const originalEnv = process.env.BACKEND_API

  beforeEach(() => {
    // Clear environment variable
    delete process.env.BACKEND_API
  })

  afterAll(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.BACKEND_API = originalEnv
    }
  })

  describe('getBackendUrl', () => {
    it('should return environment variable when set', () => {
      process.env.BACKEND_API = 'http://custom-backend:8080'
      
      expect(getBackendUrl()).toBe('http://custom-backend:8080')
    })

    it('should return default localhost when environment variable is not set', () => {
      expect(getBackendUrl()).toBe('http://localhost:8000')
    })

    it('should handle empty environment variable', () => {
      process.env.BACKEND_API = ''
      
      expect(getBackendUrl()).toBe('http://localhost:8000')
    })
  })

  describe('getBackendApiUrl', () => {
    beforeEach(() => {
      process.env.BACKEND_API = 'http://test-backend:9000'
    })

    it('should combine backend URL with endpoint starting with slash', () => {
      expect(getBackendApiUrl('/api/test')).toBe('http://test-backend:9000/api/test')
    })

    it('should add leading slash to endpoint if missing', () => {
      expect(getBackendApiUrl('api/test')).toBe('http://test-backend:9000/api/test')
    })

    it('should handle root endpoint', () => {
      expect(getBackendApiUrl('/')).toBe('http://test-backend:9000/')
    })

    it('should handle empty endpoint', () => {
      expect(getBackendApiUrl('')).toBe('http://test-backend:9000/')
    })

    it('should work with complex endpoints', () => {
      expect(getBackendApiUrl('/vulnerabilities?cluster=test&namespace=default'))
        .toBe('http://test-backend:9000/vulnerabilities?cluster=test&namespace=default')
    })

    it('should use default backend URL when environment variable is not set', () => {
      delete process.env.BACKEND_API
      
      expect(getBackendApiUrl('/test')).toBe('http://localhost:8000/test')
    })
  })
})
