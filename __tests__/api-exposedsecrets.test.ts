// __tests__/api-exposedsecrets.test.ts
import { NextRequest } from "next/server";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("/api/exposedsecrets", () => {
  // Import GET function fresh for each test to avoid cache pollution
  let GET: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment
    process.env.BACKEND_API = "http://localhost:8000";

    // Mock successful backend response by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          uid: "secret1",
          severity: "high",
          secretType: "aws-access-key",
          cluster: "production",
          namespace: "web-app",
        },
        {
          uid: "secret2",
          severity: "critical",
          secretType: "github-token",
          cluster: "staging",
          namespace: "api",
        },
      ],
    });

    // Import fresh module to reset in-memory cache
    const routeModule = await import("../src/app/api/exposedsecrets/route");
    GET = routeModule.GET;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should return exposed secrets data with no parameters (cache miss)", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets"
    );
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=120");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/"
    );
  });

  it("should return cached data on second request (cache hit)", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets"
    );

    // First request
    await GET(mockRequest);

    // Second request should use cache
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Cache")).toBe("HIT");
    expect(mockFetch).toHaveBeenCalledTimes(1); // Should only call backend once
  });

  it("should handle cluster parameter", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets?cluster=production"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/?cluster=production"
    );
  });

  it("should handle namespace parameter", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets?namespace=web-app"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/?namespace=web-app"
    );
  });

  it("should handle both cluster and namespace parameters", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets?cluster=production&namespace=web-app"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/?cluster=production&namespace=web-app"
    );
  });

  it("should handle backend errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(500);
    // Error responses don't include cache headers
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(500);
    // Error responses don't include cache headers
  });

  it("should ignore empty or all values for cluster and namespace", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/exposedsecrets?cluster=all&namespace="
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/exposedsecrets/"
    );
  });

  it("should create different cache keys for different parameters", async () => {
    // First request with cluster
    const request1 = new NextRequest(
      "http://localhost:3000/api/exposedsecrets?cluster=production"
    );
    await GET(request1);

    // Second request with different cluster should hit backend again
    const request2 = new NextRequest(
      "http://localhost:3000/api/exposedsecrets?cluster=staging"
    );
    await GET(request2);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/exposedsecrets/?cluster=production"
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/exposedsecrets/?cluster=staging"
    );
  });
});
