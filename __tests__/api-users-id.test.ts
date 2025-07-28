// __tests__/api-users-id.test.ts
import { NextRequest } from "next/server";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("/api/users/[id]", () => {
  // Import GET, PUT, and DELETE functions fresh for each test to avoid cache pollution
  let GET: (req: NextRequest) => Promise<Response>;
  let PUT: (req: NextRequest) => Promise<Response>;
  let DELETE: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment
    process.env.BACKEND_API = "http://localhost:8000";

    // Track deleted users
    const deletedUsers = new Set<string>();

    // Mock backend response with state tracking
    mockFetch.mockImplementation(
      async (url: string, options: RequestInit = {}) => {
        const method = options.method || "GET";
        const userId = url.split("/").pop() || "1";

        // Handle nonexistent users
        if (userId === "nonexistent") {
          return {
            ok: false,
            status: 404,
            text: async () => "User not found",
          };
        }

        if (method === "DELETE") {
          if (deletedUsers.has(userId)) {
            return {
              ok: false,
              status: 404,
              text: async () => "User not found",
            };
          }
          deletedUsers.add(userId);
          return {
            ok: true,
            json: async () => ({
              id: userId,
              email: "admin@example.com",
              fullname: "Admin User",
              role: "ClusterAdmin",
              namespaces: ["all"],
              createdAt: "2024-01-15T10:30:00Z",
              lastLogin: "2025-07-08T14:22:00Z",
              status: "active",
            }),
          };
        }

        if (method === "GET") {
          if (deletedUsers.has(userId)) {
            return {
              ok: false,
              status: 404,
              text: async () => "User not found",
            };
          }
          return {
            ok: true,
            json: async () => ({
              id: userId,
              email: "admin@example.com",
              fullname: "Admin User",
              role: "ClusterAdmin",
              namespaces: ["all"],
              createdAt: "2024-01-15T10:30:00Z",
              lastLogin: "2025-07-08T14:22:00Z",
              status: "active",
            }),
          };
        }

        if (method === "PUT") {
          if (deletedUsers.has(userId)) {
            return {
              ok: false,
              status: 404,
              text: async () => "User not found",
            };
          }
          const body = JSON.parse(options.body as string);
          return {
            ok: true,
            json: async () => ({
              id: userId,
              email: body.email || "admin@example.com",
              fullname: body.fullname || "Admin User",
              role: body.role || "ClusterAdmin",
              namespaces: body.namespaces || ["all"],
              createdAt: "2024-01-15T10:30:00Z",
              lastLogin: "2025-07-08T14:22:00Z",
              status: body.status || "active",
            }),
          };
        }

        return { ok: true, json: async () => ({}) };
      }
    );

    // Import fresh module to reset in-memory cache
    const routeModule = await import("../src/app/api/users/[id]/route");
    GET = routeModule.GET;
    PUT = routeModule.PUT;
    DELETE = routeModule.DELETE;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("GET", () => {
    it("should return user data by ID (cache miss)", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users/1");
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("1");
      expect(data.email).toBeDefined();
      expect(data.fullname).toBeDefined();
      expect(data.role).toBeDefined();
      expect(response.headers.get("X-Cache")).toBe("MISS");
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=30");
    });

    it("should return cached data on second request (cache hit)", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users/1");

      // First request
      await GET(mockRequest);

      // Second request should use cache
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Cache")).toBe("HIT");
    });

    it("should return 404 for non-existent user", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users/nonexistent"
      );
      const response = await GET(mockRequest);

      expect(response.status).toBe(404);
    });

    it("should return 400 for missing user ID", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users/");
      const response = await GET(mockRequest);

      expect(response.status).toBe(400);
    });

    it("should create different cache keys for different user IDs", async () => {
      const mockRequest1 = new NextRequest("http://localhost:3000/api/users/1");
      const mockRequest2 = new NextRequest("http://localhost:3000/api/users/2");

      // First request
      const response1 = await GET(mockRequest1);
      expect(response1.headers.get("X-Cache")).toBe("MISS");

      // Second request with different ID should also miss cache
      const response2 = await GET(mockRequest2);
      expect(response2.headers.get("X-Cache")).toBe("MISS");

      // Third request with same ID as first should hit cache
      const response3 = await GET(mockRequest1);
      expect(response3.headers.get("X-Cache")).toBe("HIT");
    });

    it("should handle server errors gracefully", async () => {
      // Mock console.error to avoid test output pollution
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Create a request that would cause an error
      const mockRequest = new NextRequest("http://localhost:3000/api/users/1");

      // Override Response.json to throw an error
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

  describe("PUT", () => {
    it("should update an existing user", async () => {
      const updateData = {
        fullname: "Updated Name",
        role: "SysAdmin",
        namespaces: ["updated-namespace"],
      };

      const mockRequest = new NextRequest("http://localhost:3000/api/users/1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("1");
      expect(data.fullname).toBe(updateData.fullname);
      expect(data.role).toBe(updateData.role);
      expect(data.namespaces).toEqual(updateData.namespaces);
      // Note: API doesn't add updatedAt field, just updates existing data
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
    });

    it("should return 404 when updating non-existent user", async () => {
      const updateData = {
        fullname: "Updated Name",
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users/nonexistent",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await PUT(mockRequest);
      expect(response.status).toBe(404);
    });

    it("should return 400 for missing user ID", async () => {
      const updateData = {
        fullname: "Updated Name",
      };

      const mockRequest = new NextRequest("http://localhost:3000/api/users/", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(mockRequest);
      expect(response.status).toBe(400);
    });

    it("should handle invalid JSON in PUT request", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const mockRequest = new NextRequest("http://localhost:3000/api/users/1", {
        method: "PUT",
        body: "invalid json",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await PUT(mockRequest);
      expect(response.status).toBe(500);

      consoleErrorSpy.mockRestore();
    });

    it("should clear cache after updating a user", async () => {
      // First, populate cache with a GET request
      const getRequest = new NextRequest("http://localhost:3000/api/users/1");
      const getResponse1 = await GET(getRequest);
      expect(getResponse1.headers.get("X-Cache")).toBe("MISS");

      // Verify cache is populated
      const getResponse2 = await GET(getRequest);
      expect(getResponse2.headers.get("X-Cache")).toBe("HIT");

      // Update the user
      const updateData = {
        fullname: "Cache Test Update",
      };

      const putRequest = new NextRequest("http://localhost:3000/api/users/1", {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await PUT(putRequest);

      // Cache should be cleared - next GET should be a cache miss
      const getResponse3 = await GET(getRequest);
      expect(getResponse3.headers.get("X-Cache")).toBe("MISS");
    });
  });

  describe("DELETE", () => {
    it("should delete an existing user", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users/1", {
        method: "DELETE",
      });

      const response = await DELETE(mockRequest);
      expect(response.status).toBe(200); // API returns 200 with deleted user data
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
    });

    it("should return 404 when deleting non-existent user", async () => {
      const mockRequest = new NextRequest(
        "http://localhost:3000/api/users/nonexistent",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(mockRequest);
      expect(response.status).toBe(404);
    });

    it("should return 400 for missing user ID", async () => {
      const mockRequest = new NextRequest("http://localhost:3000/api/users/", {
        method: "DELETE",
      });

      const response = await DELETE(mockRequest);
      expect(response.status).toBe(400);
    });

    it("should clear cache after deleting a user", async () => {
      // First, populate cache with a GET request
      const getRequest = new NextRequest("http://localhost:3000/api/users/1");
      const getResponse1 = await GET(getRequest);
      expect(getResponse1.headers.get("X-Cache")).toBe("MISS");

      // Verify cache is populated
      const getResponse2 = await GET(getRequest);
      expect(getResponse2.headers.get("X-Cache")).toBe("HIT");

      // Delete the user
      const deleteRequest = new NextRequest(
        "http://localhost:3000/api/users/1",
        {
          method: "DELETE",
        }
      );

      await DELETE(deleteRequest);

      // Cache should be cleared - next GET should be a cache miss and return 404
      const getResponse3 = await GET(getRequest);
      expect(getResponse3.status).toBe(404);
    });
  });
});
