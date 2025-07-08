import { NextRequest } from "next/server";

// Simple in-memory cache for users
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const usersCache = new Map<string, CacheEntry>();
const USERS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

function getCacheKey(role?: string, namespace?: string): string {
  const roleKey = role && role !== "all" ? role : "all";
  const namespaceKey = namespace && namespace !== "all" ? namespace : "all";
  return `users:${roleKey}:${namespaceKey}`;
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < USERS_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupUsersCache(): void {
  const now = Date.now();
  for (const [key, entry] of usersCache.entries()) {
    if (now - entry.timestamp >= USERS_CACHE_DURATION) {
      usersCache.delete(key);
    }
  }
}

// Clean up every 5 minutes (but not in test environment)
if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupUsersCache, 5 * 60 * 1000);
}

// Mock data for users
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    fullname: "System Administrator",
    role: "SysAdmin",
    namespaces: ["*"], // Access to all namespaces
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2025-07-08T08:15:00Z",
    status: "active",
  },
  {
    id: "2",
    email: "cluster.admin@example.com",
    fullname: "Cluster Administrator",
    role: "ClusterAdmin",
    namespaces: ["cluster:prod-cluster", "cluster:staging-cluster"], // Full cluster access
    createdAt: "2024-02-10T14:20:00Z",
    lastLogin: "2025-07-07T16:45:00Z",
    status: "active",
  },
  {
    id: "3",
    email: "dev1@example.com",
    fullname: "John Developer",
    role: "Developer",
    namespaces: ["development", "testing", "feature-branch-1"], // Specific namespaces
    createdAt: "2024-03-05T09:15:00Z",
    lastLogin: "2025-07-08T07:30:00Z",
    status: "active",
  },
  {
    id: "4",
    email: "dev2@example.com",
    fullname: "Jane Smith",
    role: "Developer",
    namespaces: ["cluster:dev-cluster"], // Full dev cluster access
    createdAt: "2024-04-12T11:45:00Z",
    lastLogin: "2025-07-06T15:20:00Z",
    status: "inactive",
  },
  {
    id: "5",
    email: "cluster.admin2@example.com",
    fullname: "Security Admin",
    role: "ClusterAdmin",
    namespaces: ["production", "security", "monitoring"], // Mixed access
    createdAt: "2024-01-20T13:30:00Z",
    lastLogin: "2025-07-08T06:10:00Z",
    status: "active",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") ?? "";
  const namespace = searchParams.get("namespace") ?? "";

  // Generate cache key based on parameters
  const cacheKey = getCacheKey(role, namespace);

  // Check if we have a valid cached response
  const cachedEntry = usersCache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    console.log(`Cache hit for users data: ${cacheKey}`);

    // Add cache headers
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=120"); // 2 minutes
    return response;
  }

  try {
    // Mock implementation - filter users based on parameters
    let filteredUsers = [...mockUsers];

    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    if (namespace && namespace !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.namespaces.includes("*") || user.namespaces.includes(namespace)
      );
    }

    const data = filteredUsers;

    // Store in cache
    usersCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    console.log(`Cache miss - stored new users data for: ${cacheKey}`);

    // Return response with cache headers
    const response = Response.json(data);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=120"); // 2 minutes

    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    // Mock implementation - create new user
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      status: "active",
    };

    mockUsers.push(newUser);

    // Clear cache after creating a user
    usersCache.clear();

    const response = Response.json(newUser, { status: 201 });
    response.headers.set("Cache-Control", "no-cache");
    return response;
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
