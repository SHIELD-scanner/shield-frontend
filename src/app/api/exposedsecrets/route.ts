// src/app/api/exposedsecrets/route.ts
import { NextRequest } from "next/server";
import { getBackendApiUrl } from "../../../lib/config";

// Simple in-memory cache for exposed secrets
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const exposedSecretsCache = new Map<string, CacheEntry>();
const EXPOSED_SECRETS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

function getCacheKey(cluster?: string, namespace?: string): string {
  const clusterKey = cluster && cluster !== "all" ? cluster : "all";
  const namespaceKey = namespace && namespace !== "all" ? namespace : "all";
  return `exposedsecrets:${clusterKey}:${namespaceKey}`;
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < EXPOSED_SECRETS_CACHE_DURATION;
}

// Clean up expired cache entries periodically
function cleanupExposedSecretsCache(): void {
  const now = Date.now();
  for (const [key, entry] of exposedSecretsCache.entries()) {
    if (now - entry.timestamp >= EXPOSED_SECRETS_CACHE_DURATION) {
      exposedSecretsCache.delete(key);
    }
  }
}

// Clean up every 5 minutes (but not in test environment)
if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupExposedSecretsCache, 5 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cluster = searchParams.get("cluster") ?? "";
  const namespace = searchParams.get("namespace") ?? "";

  // Generate cache key based on parameters
  const cacheKey = getCacheKey(cluster, namespace);

  // Check if we have a valid cached response
  const cachedEntry = exposedSecretsCache.get(cacheKey);
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    console.log(`Cache hit for exposed secrets data: ${cacheKey}`);

    // Add cache headers
    const response = Response.json(cachedEntry.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=120"); // 2 minutes
    return response;
  }

  try {
    // Build the URL for the backend API
    let url = getBackendApiUrl("/exposedsecrets/");
    const params = [];

    if (cluster && cluster !== "all") {
      params.push(`cluster=${encodeURIComponent(cluster)}`);
    }
    if (namespace && namespace !== "all") {
      params.push(`namespace=${encodeURIComponent(namespace)}`);
    }

    if (params.length) {
      url += `?${params.join("&")}`;
    }

    console.log(`Fetching exposed secrets data from: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(
        `Failed to fetch exposed secrets: ${res.status} ${res.statusText}`
      );
      return new Response("Failed to fetch exposed secrets", { status: 500 });
    }

    const data = await res.json();

    // Store in cache
    exposedSecretsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    console.log(
      `Cache miss - stored new exposed secrets data for: ${cacheKey}`
    );

    // Return response with cache headers
    const response = Response.json(data);
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=120"); // 2 minutes

    return response;
  } catch (error) {
    console.error("Error fetching exposed secrets:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
