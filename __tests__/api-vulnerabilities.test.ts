// __tests__/api-vulnerabilities.test.ts
import { NextRequest } from 'next/server'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('/api/vulnerabilities', () => {
  // Import GET function fresh for each test to avoid cache pollution
  let GET: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
    
    // Reset environment
    process.env.BACKEND_API = 'http://localhost:8000'
    
    // Mock successful backend response by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 'vuln1', severity: 'high', name: 'Test vulnerability' },
        { id: 'vuln2', severity: 'medium', name: 'Another vulnerability' }
      ])
    })

    // Import fresh module to reset in-memory cache
    const routeModule = await import('../src/app/api/vulnerabilities/route')
    GET = routeModule.GET
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should return vulnerabilities data with no parameters (cache miss)', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities')
    const response = await GET(mockRequest)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(response.headers.get('X-Cache')).toBe('MISS')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=120')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/vulnerabilities/')
  })

  it('should handle cluster and namespace parameters', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities?cluster=test-cluster&namespace=test-namespace')
    await GET(mockRequest)
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/vulnerabilities/?cluster=test-cluster&namespace=test-namespace'
    )
  })

  it('should return cached data on subsequent requests with same parameters (cache hit)', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities?cluster=test-cluster')
    
    // First request - should be cache miss
    const firstResponse = await GET(mockRequest)
    expect(firstResponse.headers.get('X-Cache')).toBe('MISS')
    
    // Second request with same parameters - should be cache hit
    const secondResponse = await GET(mockRequest)
    expect(secondResponse.headers.get('X-Cache')).toBe('HIT')
    
    // Should only call fetch once
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should use different cache keys for different parameters', async () => {
    const request1 = new NextRequest('http://localhost:3000/api/vulnerabilities?cluster=cluster1')
    const request2 = new NextRequest('http://localhost:3000/api/vulnerabilities?cluster=cluster2')
    
    // First request
    const response1 = await GET(request1)
    expect(response1.headers.get('X-Cache')).toBe('MISS')
    
    // Second request with different parameters - should be cache miss
    const response2 = await GET(request2)
    expect(response2.headers.get('X-Cache')).toBe('MISS')
    
    // Should call fetch twice (once for each parameter combination)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should handle "all" values for cluster and namespace', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities?cluster=all&namespace=all')
    await GET(mockRequest)
    
    // "all" values should not be included in the URL
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/vulnerabilities/')
  })

  it('should use configured backend URL', async () => {
    // Set custom backend URL before importing fresh module
    process.env.BACKEND_API = 'http://custom-backend:9000'
    
    // Import fresh module with new environment
    jest.resetModules()
    const { GET: CustomGET } = await import('../src/app/api/vulnerabilities/route')
    
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities')
    await CustomGET(mockRequest)
    
    expect(mockFetch).toHaveBeenCalledWith('http://custom-backend:9000/vulnerabilities/')
  })

  it('should handle backend errors gracefully', async () => {
    // Override the default mock for this test
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities')
    const response = await GET(mockRequest)
    
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Failed to fetch vulnerabilities')
  })

  it('should handle network errors gracefully', async () => {
    // Override the default mock for this test
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities')
    const response = await GET(mockRequest)
    
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal server error')
  })

  it('should cache for 2 minutes (120 seconds)', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities')
    const response = await GET(mockRequest)
    
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=120')
  })

  it('should properly encode URL parameters', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/vulnerabilities?namespace=test/namespace&cluster=test-cluster')
    await GET(mockRequest)
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/vulnerabilities/?cluster=test-cluster&namespace=test%2Fnamespace'
    )
  })
})
