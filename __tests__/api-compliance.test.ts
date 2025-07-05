// Mock cookies before any imports
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Helper function to create mock cookies
function createMockCookies(getValue: string | undefined) {
  return {
    get: jest.fn().mockReturnValue(getValue ? { value: getValue } : undefined),
    getAll: jest.fn().mockReturnValue([]),
    has: jest.fn().mockReturnValue(false),
    size: 0,
    [Symbol.iterator]: jest.fn()
  } as any
}

describe('/api/compliance', () => {
  let GET: () => Promise<Response>
  let mockCookies: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env.BACKEND_API = 'http://localhost:8000'
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 'comp1', status: 'pass', name: 'Test compliance check' },
        { id: 'comp2', status: 'fail', name: 'Another compliance check' }
      ])
    })
    // Get the mock function for cookies
    mockCookies = (await import('next/headers')).cookies as jest.Mock
    mockCookies.mockResolvedValue(createMockCookies('test-namespace'))
    // Import fresh module to reset in-memory cache
    const routeModule = await import('../src/app/api/compliance/route')
    GET = routeModule.GET
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should return compliance data with namespace from cookie (cache miss)', async () => {
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(response.headers.get('X-Cache')).toBe('MISS')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/compliance/?namespace=test-namespace')
  })

  it('should use default namespace when no cookie is present', async () => {
    mockCookies.mockResolvedValue(createMockCookies(undefined))
    await GET()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/compliance/?namespace=acc%2Fdefault')
  })

  it('should not include namespace parameter when set to "all"', async () => {
    mockCookies.mockResolvedValue(createMockCookies('all'))
    await GET()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/compliance/')
  })

  it('should return cached data on subsequent requests with same namespace (cache hit)', async () => {
    mockCookies.mockResolvedValue(createMockCookies('test-namespace'))
    const firstResponse = await GET()
    expect(firstResponse.headers.get('X-Cache')).toBe('MISS')
    const secondResponse = await GET()
    expect(secondResponse.headers.get('X-Cache')).toBe('HIT')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should use different cache keys for different namespaces', async () => {
    mockCookies.mockResolvedValue(createMockCookies('namespace1'))
    const response1 = await GET()
    expect(response1.headers.get('X-Cache')).toBe('MISS')
    mockCookies.mockResolvedValue(createMockCookies('namespace2'))
    const response2 = await GET()
    expect(response2.headers.get('X-Cache')).toBe('MISS')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should use configured backend URL', async () => {
    process.env.BACKEND_API = 'http://custom-backend:9000'
    mockCookies.mockResolvedValue(createMockCookies('test-namespace'))
    await GET()
    expect(mockFetch).toHaveBeenCalledWith('http://custom-backend:9000/compliance/?namespace=test-namespace')
  })

  it('should handle backend errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    mockCookies.mockResolvedValue(createMockCookies('test-namespace'))
    const response = await GET()
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Failed to fetch compliance data')
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    mockCookies.mockResolvedValue(createMockCookies('test-namespace'))
    const response = await GET()
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Internal server error')
  })

  it('should cache for 1 minute (60 seconds)', async () => {
    mockCookies.mockResolvedValue(createMockCookies('test-namespace'))
    const response = await GET()
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60')
  })

  it('should properly encode namespace parameter', async () => {
    mockCookies.mockResolvedValue(createMockCookies('test/namespace'))
    await GET()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/compliance/?namespace=test%2Fnamespace')
  })
})
