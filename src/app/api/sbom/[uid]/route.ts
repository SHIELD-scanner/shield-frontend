import { NextRequest } from "next/server";
import { getBackendApiUrl } from "../../../../lib/config";

// Simple in-memory cache for SBOM by ID
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const sbomByIdCache = new Map<string, CacheEntry>();
const SBOM_BY_ID_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

function getCacheKey(uid: string): string {
  return `sbom:${uid}`;
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < SBOM_BY_ID_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupSbomByIdCache(): void {
  const now = Date.now();
  for (const [key, entry] of sbomByIdCache.entries()) {
    if (now - entry.timestamp >= SBOM_BY_ID_CACHE_DURATION) {
      sbomByIdCache.delete(key);
    }
  }
}

if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupSbomByIdCache, 5 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  // Await params from the request URL
  const urlObj = new URL(req.url);
  const uid = urlObj.pathname.split("/").pop();
  if (!uid) {
    return new Response("Missing SBOM UID", { status: 400 });
  }

  const cacheKey = getCacheKey(uid);
  const cachedEntry = sbomByIdCache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  }

  try {
    const backendUrl = getBackendApiUrl(`/sbom/${uid}`);
    const res = await fetch(backendUrl);
    if (!res.ok) {
      return new Response("Failed to fetch SBOM", { status: 500 });
    }
    const data = await res.json();
    sbomByIdCache.set(cacheKey, { data, timestamp: Date.now() });
    const response = Response.json(data);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}
