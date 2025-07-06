import { NextRequest } from "next/server";
import { getBackendApiUrl } from "../../../../lib/config";

// Simple in-memory cache for vulnerabilities by ID
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const vulnerabilityByIdCache = new Map<string, CacheEntry>();
const VULNERABILITY_BY_ID_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

function getCacheKey(id: string): string {
  return `vulnerability:${id}`;
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < VULNERABILITY_BY_ID_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupVulnerabilityByIdCache(): void {
  const now = Date.now();
  for (const [key, entry] of vulnerabilityByIdCache.entries()) {
    if (now - entry.timestamp >= VULNERABILITY_BY_ID_CACHE_DURATION) {
      vulnerabilityByIdCache.delete(key);
    }
  }
}

if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupVulnerabilityByIdCache, 5 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  // Await params from the request URL
  const urlObj = new URL(req.url);
  const id = urlObj.pathname.split("/").pop();
  if (!id) {
    return new Response("Missing vulnerability ID", { status: 400 });
  }

  const cacheKey = getCacheKey(id);
  const cachedEntry = vulnerabilityByIdCache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  }

  try {
    const backendUrl = getBackendApiUrl(`/vulnerabilities/${id}`);
    const res = await fetch(backendUrl);
    if (!res.ok) {
      return new Response("Failed to fetch vulnerability", { status: 500 });
    }
    const data = await res.json();
    vulnerabilityByIdCache.set(cacheKey, { data, timestamp: Date.now() });
    const response = Response.json(data);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}
