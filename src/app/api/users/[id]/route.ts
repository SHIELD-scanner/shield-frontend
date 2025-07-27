import { NextRequest } from "next/server";
import { getBackendApiUrl } from "../../../../lib/config";

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
    const backendUrl = getBackendApiUrl(`/users/${id}`);
    const res = await fetch(backendUrl);
    if (!res.ok) {
      if (res.status === 404) {
        return new Response("User not found", { status: 404 });
      }
      return new Response("Failed to fetch user", { status: 500 });
    }
    const data = await res.json();
    
    userByIdCache.set(cacheKey, { data, timestamp: Date.now() });
    const response = Response.json(data);
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

    const backendUrl = getBackendApiUrl(`/users/${id}`);
    
    const res = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("PUT /api/users/[id] - Backend error response:", errorText);
      
      if (res.status === 404) {
        return new Response("User not found", { status: 404 });
      }
      return new Response(`Failed to update user: ${errorText}`, { status: 500 });
    }

    const updatedUser = await res.json();

    // Clear cache after updating
    userByIdCache.delete(getCacheKey(id));

    const response = Response.json(updatedUser);
    response.headers.set("Cache-Control", "no-cache");
    return response;
  } catch (error) {
    console.error("PUT /api/users/[id] - Error:", error);
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
    const backendUrl = getBackendApiUrl(`/users/${id}`);
    const res = await fetch(backendUrl, {
      method: "DELETE",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return new Response("User not found", { status: 404 });
      }
      return new Response("Failed to delete user", { status: 500 });
    }

    const deletedUser = await res.json();

    // Clear cache after deleting
    userByIdCache.delete(getCacheKey(id));

    const response = Response.json(deletedUser);
    response.headers.set("Cache-Control", "no-cache");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}
