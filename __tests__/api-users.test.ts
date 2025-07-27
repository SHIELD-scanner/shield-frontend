// __tests__/api-users.test.ts
import { NextRequest } from "next/server";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("/api/users", () => {
  // Import GET and POST functions fresh for each test to avoid cache pollution
  let GET: (req: NextRequest) => Promise<Response>;
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment
    process.env.BACKEND_API = "http://localhost:8000";

    // Mock successful backend response with smart filtering
    const mockUsers = [
      {
        id: "1",
        email: "admin@example.com",
        fullname: "Admin User",
        role: "ClusterAdmin",
        namespaces: ["*"],
        createdAt: "2024-01-15T10:30:00Z",
        lastLogin: "2025-07-08T14:22:00Z",
        status: "active",
      },
      {
        id: "2",
        email: "dev@example.com",
        fullname: "Developer User",
        role: "Developer",
        namespaces: ["development"],
        createdAt: "2024-02-10T14:20:00Z",
        lastLogin: "2025-07-07T16:45:00Z",
        status: "active",
      },
      {
        id: "3",
        email: "dev2@example.com",
        fullname: "Developer User 2",
        role: "Developer",
        namespaces: ["development", "testing"],
        createdAt: "2024-03-10T14:20:00Z",
        lastLogin: "2025-07-07T16:45:00Z",
        status: "active",
      },
    ];

    mockFetch.mockImplementation(async (url: string) => {
      const urlObj = new URL(url, 'http://localhost:8000');
      const roleParam = urlObj.searchParams.get('role');
      const namespaceParam = urlObj.searchParams.get('namespace');
      
      let filteredUsers = [...mockUsers];
      
      // Filter by role
      if (roleParam && roleParam !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleParam);
      }
      
      // Filter by namespace
      if (namespaceParam && namespaceParam !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.namespaces.includes('*') || 
          user.namespaces.includes(namespaceParam)
        );
      }
      
      return {
        ok: true,
        json: async () => filteredUsers,
      };
    });

    // Import fresh module to reset in-memory cache
    const routeModule = await import("../src/app/api/users/route");
    GET = routeModule.GET;
    POST = routeModule.POST;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("GET", () => {
    it("should return users data with no parameters (cache miss)", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users");
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(response.headers.get("X-Cache")).toBe("MISS");
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=120");
    });

    it("should return cached data on second request (cache hit)", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users");

      // First request
      await GET(mockRequest);

      // Second request should use cache
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Cache")).toBe("HIT");
    });

    it("should filter users by role parameter", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users?role=Developer"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      data.forEach((user: { role: string }) => {
        expect(user.role).toBe("Developer");
      });
    });

    it("should filter users by namespace parameter", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users?namespace=development"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Users should either have '*' access or include 'development' namespace
      data.forEach((user: { namespaces: string[] }) => {
        expect(
          user.namespaces.includes("*") ||
            user.namespaces.includes("development")
        ).toBe(true);
      });
    });

    it("should filter users by both role and namespace parameters", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users?role=Developer&namespace=development"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      data.forEach((user: { role: string; namespaces: string[] }) => {
        expect(user.role).toBe("Developer");
        expect(
          user.namespaces.includes("*") ||
            user.namespaces.includes("development")
        ).toBe(true);
      });
    });

    it("should ignore 'all' values for role and namespace", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users?role=all&namespace=all"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0); // Should return all users
    });

    it("should create different cache keys for different parameters", async () => {
      // First request with role
      const request1 = new NextRequest(
        "http://localhost:3000/api/users?role=Developer"
      );
      const response1 = await GET(request1);
      expect(response1.headers.get("X-Cache")).toBe("MISS");

      // Second request with different role should miss cache
      const request2 = new NextRequest(
        "http://localhost:3000/api/users?role=SysAdmin"
      );
      const response2 = await GET(request2);
      expect(response2.headers.get("X-Cache")).toBe("MISS");

      // Third request with same role as first should hit cache
      const request3 = new NextRequest(
        "http://localhost:3000/api/users?role=Developer"
      );
      const response3 = await GET(request3);
      expect(response3.headers.get("X-Cache")).toBe("HIT");
    });

    it("should handle errors gracefully", async () => {
      // Mock console.error to avoid test output pollution
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Create a request that would cause an error in processing
      const mockRequest = new NextRequest("http://localhost:3000/api/users");

      // Override the internal filtering logic to throw an error
      const originalResponse = Response.json;
      Response.json = jest.fn().mockImplementation(() => {
        throw new Error("Mock error");
      });

      const response = await GET(mockRequest);
      expect(response.status).toBe(500);

      // Restore original Response.json
      Response.json = originalResponse;
      consoleErrorSpy.mockRestore();
    });
  });

  describe("POST", () => {
    it("should create a new user", async () => {
      const newUserData = {
        email: "newuser@example.com",
        fullname: "New User",
        role: "Developer",
        namespaces: ["test-namespace"],
      };

      // Mock the POST response for creating a user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: "new-user-id",
          ...newUserData,
          createdAt: "2024-01-15T10:30:00Z",
          lastLogin: null,
          status: "active",
        }),
      });

      const mockRequest = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUserData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.email).toBe(newUserData.email);
      expect(data.fullname).toBe(newUserData.fullname);
      expect(data.role).toBe(newUserData.role);
      expect(data.namespaces).toEqual(newUserData.namespaces);
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.status).toBe("active");
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
    });

    it("should handle invalid JSON in POST request", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const mockRequest = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: "invalid json",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(mockRequest);
      expect(response.status).toBe(500);

      consoleErrorSpy.mockRestore();
    });

    it("should clear cache after creating a user", async () => {
      // First, populate cache with a GET request
      const getRequest = new NextRequest("http://localhost:3000/api/users");
      const getResponse1 = await GET(getRequest);
      expect(getResponse1.headers.get("X-Cache")).toBe("MISS");

      // Verify cache is populated
      const getResponse2 = await GET(getRequest);
      expect(getResponse2.headers.get("X-Cache")).toBe("HIT");

      // Create a new user
      const newUserData = {
        email: "cachetest@example.com",
        fullname: "Cache Test User",
        role: "Developer",
        namespaces: ["cache-test"],
      };

      const postRequest = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUserData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(postRequest);

      // Cache should be cleared - next GET should be a cache miss
      const getResponse3 = await GET(getRequest);
      expect(getResponse3.headers.get("X-Cache")).toBe("MISS");
    });
  });
});
