import { NextRequest } from "next/server";
import { getBackendApiUrl } from "../../../lib/config";

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
    // Build the URL for the backend API
    let url = getBackendApiUrl("/users/");
    const params = [];

    if (role && role !== "all") {
      params.push(`role=${encodeURIComponent(role)}`);
    }
    if (namespace && namespace !== "all") {
      params.push(`namespace=${encodeURIComponent(namespace)}`);
    }

    if (params.length) {
      url += `?${params.join("&")}`;
    }

    console.log(`Fetching users data from: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch users: ${res.status} ${res.statusText}`);
      return new Response("Failed to fetch users", { status: 500 });
    }

    const data = await res.json();

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

    // Forward the request to the backend API
    const url = getBackendApiUrl("/users/");

    console.log(`Creating user via backend API: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error(
        `Failed to create user: ${response.status} ${response.statusText}`
      );
      return new Response("Failed to create user", { status: response.status });
    }

    const data = await response.json();

    // Clear cache after creating a user
    usersCache.clear();

    const result = Response.json(data, { status: 201 });
    result.headers.set("Cache-Control", "no-cache");
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
