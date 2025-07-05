// __tests__/api-namespaces.test.ts

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('/api/namespaces', () => {
  // Import GET function fresh for each test to avoid cache pollution
  let GET: () => Promise<Response>

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
    
    // Reset environment
    process.env.BACKEND_API = 'http://localhost:8000'
    
    // Mock successful backend response by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        { name: 'namespace1', status: 'active' },
        { name: 'namespace2', status: 'active' }
      ])
    })

    // Import fresh module to reset in-memory cache
    const routeModule = await import('../src/app/api/namespaces/route')
    GET = routeModule.GET
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should return namespaces data on first request (cache miss)', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(response.headers.get('X-Cache')).toBe('MISS')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/namespaces/')
  })

  it('should return cached data on subsequent requests (cache hit)', async () => {
    // First request - should be cache miss
    const firstResponse = await GET()
    expect(firstResponse.headers.get('X-Cache')).toBe('MISS')
    
    // Second request - should be cache hit
    const secondResponse = await GET()
    expect(secondResponse.headers.get('X-Cache')).toBe('HIT')
    
    // Should only call fetch once
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should use configured backend URL', async () => {
    // Set custom backend URL before importing fresh module
    process.env.BACKEND_API = 'http://custom-backend:9000'
    
    // Import fresh module with new environment
    jest.resetModules()
    const { GET: CustomGET } = await import('../src/app/api/namespaces/route')
    
    await CustomGET()
    
    expect(mockFetch).toHaveBeenCalledWith('http://custom-backend:9000/namespaces/')
  })

  it('should handle backend errors gracefully', async () => {
    // Override the default mock for this test
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    
    const response = await GET()
    
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Failed to fetch namespaces')
  })

  it('should handle network errors gracefully', async () => {
    // Override the default mock for this test
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    const response = await GET()
    
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal server error')
  })

  it('should cache for 5 minutes (300 seconds)', async () => {
    const response = await GET()
    
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
  })
})
