// src/app/api/namespaces/route.ts

// Simple in-memory cache for namespaces
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const namespacesCache = new Map<string, CacheEntry>();
const NAMESPACES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < NAMESPACES_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupNamespacesCache(): void {
  const now = Date.now();
  for (const [key, entry] of namespacesCache.entries()) {
    if (now - entry.timestamp >= NAMESPACES_CACHE_DURATION) {
      namespacesCache.delete(key);
    }
  }
}

// Clean up every 10 minutes (but not in test environment)
if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupNamespacesCache, 10 * 60 * 1000);
}

export async function GET() {
  const cacheKey = "namespaces:all";

  // Check if we have a valid cached response
  const cachedEntry = namespacesCache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    console.log("Cache hit for namespaces data");

    // Add cache headers
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=300"); // 5 minutes
    return response;
  }

  try {
    console.log("Fetching namespaces data from backend");

    const backendUrl = process.env.BACKEND_API ?? "http://localhost:8000";
    const res = await fetch(`${backendUrl}/namespaces/`);
    if (!res.ok) {
      console.error(
        `Failed to fetch namespaces: ${res.status} ${res.statusText}`,
      );
      return new Response("Failed to fetch namespaces", { status: 500 });
    }

    const data = await res.json();

    // Store in cache
    namespacesCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    console.log("Cache miss - stored new namespaces data");

    // Return response with cache headers
    const response = Response.json(data);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=300"); // 5 minutes

    return response;
  } catch (error) {
    console.error("Error fetching namespaces:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
