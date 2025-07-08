import { NextRequest } from "next/server";

// Simple in-memory cache for users by ID
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const userByIdCache = new Map<string, CacheEntry>();
const USER_BY_ID_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

function getCacheKey(id: string): string {
  return `user:${id}`;
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < USER_BY_ID_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupUserByIdCache(): void {
  const now = Date.now();
  for (const [key, entry] of userByIdCache.entries()) {
    if (now - entry.timestamp >= USER_BY_ID_CACHE_DURATION) {
      userByIdCache.delete(key);
    }
  }
}

if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupUserByIdCache, 5 * 60 * 1000);
}

// Mock users data (same as in route.ts)
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    fullname: "System Administrator",
    role: "SysAdmin",
    namespaces: ["*"],
    mfaEnabled: true,
    oktaIntegration: true,
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2025-07-08T08:15:00Z",
    status: "active",
  },
  {
    id: "2",
    email: "cluster.admin@example.com",
    fullname: "Cluster Administrator",
    role: "ClusterAdmin",
    namespaces: ["cluster:prod-cluster", "cluster:staging-cluster"],
    mfaEnabled: true,
    oktaIntegration: true,
    createdAt: "2024-02-10T14:20:00Z",
    lastLogin: "2025-07-07T16:45:00Z",
    status: "active",
  },
  {
    id: "3",
    email: "dev1@example.com",
    fullname: "John Developer",
    role: "Developer",
    namespaces: ["development", "testing", "feature-branch-1"],
    mfaEnabled: false,
    oktaIntegration: true,
    createdAt: "2024-03-05T09:15:00Z",
    lastLogin: "2025-07-08T07:30:00Z",
    status: "active",
  },
  {
    id: "4",
    email: "dev2@example.com",
    fullname: "Jane Smith",
    role: "Developer",
    namespaces: ["cluster:dev-cluster"],
    mfaEnabled: true,
    oktaIntegration: false,
    createdAt: "2024-04-12T11:45:00Z",
    lastLogin: "2025-07-06T15:20:00Z",
    status: "inactive",
  },
  {
    id: "5",
    email: "cluster.admin2@example.com",
    fullname: "Security Admin",
    role: "ClusterAdmin",
    namespaces: ["production", "security", "monitoring"],
    mfaEnabled: true,
    oktaIntegration: true,
    createdAt: "2024-01-20T13:30:00Z",
    lastLogin: "2025-07-08T06:10:00Z",
    status: "active",
  },
];

export async function GET(req: NextRequest) {
  const urlObj = new URL(req.url);
  const id = urlObj.pathname.split("/").pop();
  if (!id) {
    return new Response("Missing user ID", { status: 400 });
  }

  const cacheKey = getCacheKey(id);
  const cachedEntry = userByIdCache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  }

  try {
    // Mock implementation - find user by ID
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    userByIdCache.set(cacheKey, { data: user, timestamp: Date.now() });
    const response = Response.json(user);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const urlObj = new URL(req.url);
  const id = urlObj.pathname.split("/").pop();
  if (!id) {
    return new Response("Missing user ID", { status: 400 });
  }

  try {
    const userData = await req.json();

    // Mock implementation - update user
    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return new Response("User not found", { status: 404 });
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };

    // Clear cache after updating
    userByIdCache.delete(getCacheKey(id));

    const response = Response.json(mockUsers[userIndex]);
    response.headers.set("Cache-Control", "no-cache");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const urlObj = new URL(req.url);
  const id = urlObj.pathname.split("/").pop();
  if (!id) {
    return new Response("Missing user ID", { status: 400 });
  }

  try {
    // Mock implementation - delete user
    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return new Response("User not found", { status: 404 });
    }

    const deletedUser = mockUsers.splice(userIndex, 1)[0];

    // Clear cache after deleting
    userByIdCache.delete(getCacheKey(id));

    const response = Response.json(deletedUser);
    response.headers.set("Cache-Control", "no-cache");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}
