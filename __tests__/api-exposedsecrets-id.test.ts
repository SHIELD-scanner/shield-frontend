// __tests__/api-exposedsecrets-id.test.ts
import { NextRequest } from "next/server";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("/api/exposedsecrets/[uid]", () => {
  // Import GET function fresh for each test to avoid cache pollution
  let GET: (
    req: NextRequest,
    context: { params: Promise<{ uid: string }> }
  ) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment
    process.env.BACKEND_API = "http://localhost:8000";

    // Mock successful backend response by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        uid: "secret-123",
        cluster: "production",
        namespace: "web-app",
        secretType: "aws-access-key",
        severity: "high",
        confidence: 95,
        title: "AWS Access Key ID",
        description: "Detected AWS Access Key ID",
        secretValue: "AKIAIOSFODNN7EXAMPLE",
      }),
    });

    // Import fresh module to reset in-memory cache
    const routeModule = await import(
      "../src/app/api/exposedsecrets/[uid]/route"
    );
    GET = routeModule.GET;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should return exposed secret data by UID (cache miss)", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/secret-123"
    );
    const mockContext = { params: Promise.resolve({ uid: "secret-123" }) };

    const response = await GET(mockRequest, mockContext);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uid).toBe("secret-123");
    expect(data.secretType).toBe("aws-access-key");
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=120");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/secret-123"
    );
  });

  it("should return cached data on second request (cache hit)", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/secret-123"
    );
    const mockContext = { params: Promise.resolve({ uid: "secret-123" }) };

    // First request
    await GET(mockRequest, mockContext);

    // Second request should use cache
    const response = await GET(mockRequest, mockContext);

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Cache")).toBe("HIT");
    expect(mockFetch).toHaveBeenCalledTimes(1); // Should only call backend once
  });

  it("should handle backend not found errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/nonexistent"
    );
    const mockContext = { params: Promise.resolve({ uid: "nonexistent" }) };

    const response = await GET(mockRequest, mockContext);

    // All backend errors are converted to 500 by the API route
    expect(response.status).toBe(500);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/nonexistent"
    );
  });

  it("should handle backend server errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/secret-123"
    );
    const mockContext = { params: Promise.resolve({ uid: "secret-123" }) };

    const response = await GET(mockRequest, mockContext);

    expect(response.status).toBe(500);
    // Error responses don't include cache headers
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/secret-123"
    );
    const mockContext = { params: Promise.resolve({ uid: "secret-123" }) };

    const response = await GET(mockRequest, mockContext);

    expect(response.status).toBe(500);
    // Error responses don't include cache headers
  });

  it("should create different cache keys for different UIDs", async () => {
    const mockRequest1 = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/secret-123"
    );
    const mockContext1 = { params: Promise.resolve({ uid: "secret-123" }) };

    const mockRequest2 = new NextRequest(
      "http://localhost:3000/api/exposedsecrets/secret-456"
    );
    const mockContext2 = { params: Promise.resolve({ uid: "secret-456" }) };

    // First request
    await GET(mockRequest1, mockContext1);

    // Second request with different UID should hit backend again
    await GET(mockRequest2, mockContext2);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/exposedsecrets/secret-123"
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/exposedsecrets/secret-456"
    );
  });
});
