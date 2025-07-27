// Shared cache module for user-related caches

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// Cache for users list (GET /api/users)
export const usersCache = new Map<string, CacheEntry>();
export const USERS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Cache for individual users (GET /api/users/[id])
export const userByIdCache = new Map<string, CacheEntry>();
export const USER_BY_ID_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Utility functions for users cache
export function getUsersCacheKey(role?: string, namespace?: string): string {
  const roleKey = role && role !== "all" ? role : "all";
  const namespaceKey = namespace && namespace !== "all" ? namespace : "all";
  return `users:${roleKey}:${namespaceKey}`;
}

export function getUserByIdCacheKey(id: string): string {
  return `user:${id}`;
}

export function isValidCacheEntry(
  entry: CacheEntry,
  duration: number
): boolean {
  return Date.now() - entry.timestamp < duration;
}

// Clean up functions
export function cleanupUsersCache(): void {
  const now = Date.now();
  for (const [key, entry] of usersCache.entries()) {
    if (now - entry.timestamp >= USERS_CACHE_DURATION) {
      usersCache.delete(key);
    }
  }
}

export function cleanupUserByIdCache(): void {
  const now = Date.now();
  for (const [key, entry] of userByIdCache.entries()) {
    if (now - entry.timestamp >= USER_BY_ID_CACHE_DURATION) {
      userByIdCache.delete(key);
    }
  }
}

// Clear all user-related caches (useful when a user is updated/deleted)
export function clearAllUserCaches(): void {
  usersCache.clear();
}

// Clear specific user from both caches
export function clearUserFromCaches(userId: string): void {
  userByIdCache.delete(getUserByIdCacheKey(userId));
  usersCache.clear(); // Clear all users cache entries since user data changed
}
