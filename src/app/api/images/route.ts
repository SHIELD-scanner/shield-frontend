import { NextRequest } from "next/server";
import { getBackendApiUrl } from "../../../lib/config";

// Simple in-memory cache for images overview (list)
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const imagesOverviewCache = new Map<string, CacheEntry>();
const IMAGES_OVERVIEW_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const OVERVIEW_CACHE_KEY = "images:overview";

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < IMAGES_OVERVIEW_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupImagesOverviewCache(): void {
  const now = Date.now();
  for (const [key, entry] of imagesOverviewCache.entries()) {
    if (now - entry.timestamp >= IMAGES_OVERVIEW_CACHE_DURATION) {
      imagesOverviewCache.delete(key);
    }
  }
}

if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupImagesOverviewCache, 5 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  const cachedEntry = imagesOverviewCache.get(OVERVIEW_CACHE_KEY);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  }

  try {
    const backendUrl = getBackendApiUrl("/vulnerabilities");
    const res = await fetch(backendUrl);
    if (!res.ok) {
      return new Response("Failed to fetch images overview", { status: 500 });
    }
    const data = await res.json();
    imagesOverviewCache.set(OVERVIEW_CACHE_KEY, {
      data,
      timestamp: Date.now(),
    });
    const response = Response.json(data);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=120");
    return response;
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}
