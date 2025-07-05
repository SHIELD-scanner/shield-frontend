import { cookies } from "next/headers";
import { getBackendApiUrl } from "../../../lib/config";

// Simple in-memory cache
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

function getCacheKey(namespace?: string): string {
  return `compliance:${namespace ?? 'all'}`;
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp >= CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

// Clean up every 5 minutes (but not in test environment)
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupCache, 5 * 60 * 1000);
}

export async function GET() {
  const cookieStore = await cookies();
  
  // Get namespace from cookie instead of URL parameter
  const namespace = cookieStore.get('selected-namespace')?.value ?? 'acc/default';
  
  // Generate cache key
  const cacheKey = getCacheKey(namespace);
  
  // Check if we have a valid cached response
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    console.log(`Cache hit for compliance data: ${cacheKey}`);
    
    // Add cache headers
    const response = Response.json(cachedEntry.data);
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('Cache-Control', 'public, max-age=60');
    return response;
  }
  
  try {
    // Build the URL for the backend API with namespace from cookie
    let url = getBackendApiUrl('/compliance/');
    const params = [];
    
    if (namespace && namespace !== "all") {
      params.push(`namespace=${encodeURIComponent(namespace)}`);
    }
    
    if (params.length) {
      url += `?${params.join("&")}`;
    }
    
    console.log(`Fetching compliance data from: ${url}`);
    
    // Fetch from backend
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`Failed to fetch compliance data: ${res.status} ${res.statusText}`);
      return new Response("Failed to fetch compliance data", { status: 500 });
    }
    
    const data = await res.json();
    
    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`Cache miss - stored new data for: ${cacheKey}`);
    
    // Return response with cache headers
    const response = Response.json(data);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=60');
    
    return response;
    
  } catch (error) {
    console.error("Error fetching compliance data:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
