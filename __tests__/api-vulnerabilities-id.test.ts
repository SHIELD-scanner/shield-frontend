// __tests__/api-vulnerabilities-id.test.ts
import { NextRequest } from "next/server";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("/api/vulnerabilities/[id]", () => {
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
      json: async () => ({
        id: "vuln-123",
        name: "Test Vulnerability",
        severity: "high",
        description: "A test vulnerability",
        cve: "CVE-2024-12345",
        cvss: 8.5,
        cluster: "production",
        namespace: "web-app",
        resource: "deployment/web-server",
        container: "web-container",
        image: "nginx:1.20",
        packageName: "openssl",
        packageVersion: "1.1.1",
        fixedVersion: "1.1.1k",
        publishedDate: "2024-01-15T10:00:00Z",
        lastModifiedDate: "2024-01-20T15:30:00Z",
      }),
    });

    // Import fresh module to reset in-memory cache
    const routeModule = await import(
      "../src/app/api/vulnerabilities/[id]/route"
    );
    GET = routeModule.GET;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should return vulnerability data by ID (cache miss)", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("vuln-123");
    expect(data.name).toBe("Test Vulnerability");
    expect(data.severity).toBe("high");
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=120");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/vulnerabilities/vuln-123"
    );
  });

  it("should return cached data on second request (cache hit)", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );

    // First request
    await GET(mockRequest);

    // Second request should use cache
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Cache")).toBe("HIT");
    expect(mockFetch).toHaveBeenCalledTimes(1); // Should only call backend once
  });

  it("should return 400 for missing vulnerability ID", async () => {
    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(400);
  });

  it("should handle backend not found errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/nonexistent"
    );
    const response = await GET(mockRequest);

    // Backend errors are converted to 500 by the API route
    expect(response.status).toBe(500);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/vulnerabilities/nonexistent"
    );
  });

  it("should handle backend server errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(500);
    // Error responses don't include cache headers
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(500);
    // Error responses don't include cache headers
  });

  it("should create different cache keys for different vulnerability IDs", async () => {
    const mockRequest1 = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );
    const mockRequest2 = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-456"
    );

    // First request
    await GET(mockRequest1);

    // Second request with different ID should hit backend again
    await GET(mockRequest2);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/vulnerabilities/vuln-123"
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/vulnerabilities/vuln-456"
    );
  });

  it("should use configured backend URL", async () => {
    process.env.BACKEND_API = "http://custom-backend:9000";

    // Re-import to pick up new environment variable
    jest.resetModules();
    const routeModule = await import(
      "../src/app/api/vulnerabilities/[id]/route"
    );
    const GET_CUSTOM = routeModule.GET;

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );
    await GET_CUSTOM(mockRequest);

    expect(mockFetch).toHaveBeenCalledWith(
      "http://custom-backend:9000/vulnerabilities/vuln-123"
    );
  });

  it("should handle JSON parsing errors gracefully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("JSON parsing error");
      },
    });

    const mockRequest = new NextRequest(
      "http://localhost:3000/api/vulnerabilities/vuln-123"
    );
    const response = await GET(mockRequest);

    expect(response.status).toBe(500);
  });
});
