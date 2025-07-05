# API Caching Implementation

## Overview
This implementation adds caching to the `/api/compliance`, `/api/namespaces`, and `/api/vulnerabilities` endpoints to reduce the load on the backend server. Different endpoints use different caching strategies based on their usage patterns.

## Features

- **In-memory caching**: Uses Map to store responses with timestamps
- **Multiple caching strategies**:
  - **Compliance**: Cookie-based namespace selection (1 minute cache)
  - **Vulnerabilities**: Parameter-based caching with cluster/namespace (2 minutes cache)
  - **Namespaces**: Simple caching (5 minutes cache)
- **Automatic cache expiration**: Different durations based on data volatility
- **Cache cleanup**: Expired entries are automatically removed periodically
- **HTTP cache headers**: Proper Cache-Control and X-Cache headers are set
- **React hooks**: Easy-to-use React hooks for components

## Cache Durations

- **Compliance**: 1 minute (frequently updated)
- **Vulnerabilities**: 2 minutes (moderate update frequency)
- **Namespaces**: 5 minutes (rarely updated)

## Files Created/Modified

### API Routes

- `src/app/api/compliance/route.ts` - Compliance API endpoint with cookie-based namespace selection
- `src/app/api/namespaces/route.ts` - Namespaces API endpoint with caching
- `src/app/api/vulnerabilities/route.ts` - Vulnerabilities API endpoint with parameter-based caching

### Services

- `src/services/complianceService.ts` - Service class with cookie management
- `src/services/namespaceService.ts` - Updated namespace service
- `src/services/vulnerabilityService.ts` - Enhanced vulnerability service with caching

### Hooks

- `src/hooks/useCompliance.ts` - React hook with namespace management
- `src/hooks/useVulnerabilities.ts` - React hook for vulnerabilities with caching

### Pages

- `src/app/compliance/page.tsx` - Updated to demonstrate cached API usage with namespace selection
- `src/app/vulnerabilities/VulnerabilitiesList.tsx` - Updated to use cached vulnerabilities API

### Components

- `src/components/NamespaceSelector.tsx` - Reusable component for namespace selection

### Testing

- `test-cache.sh` - Script to test cache behavior for all endpoints

## Usage

### Compliance API Endpoint
```
GET /api/compliance
```
The namespace is read from the `selected-namespace` cookie.

### Namespaces API Endpoint
```
GET /api/namespaces
```

### React Hook
```typescript
import { useCompliance } from '@/hooks/useCompliance';

function MyComponent() {
  const { data, loading, error, refetch, setNamespace, currentNamespace } = useCompliance();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <select value={currentNamespace ?? 'acc/default'} onChange={(e) => setNamespace(e.target.value)}>
        <option value="acc/default">acc/default</option>
        <option value="production">production</option>
      </select>
      <div>Score: {data?.score}%</div>
    </div>
  );
}
```

### Service Class
```typescript
import { ComplianceService } from '@/services/complianceService';

// Set namespace (saves to cookie)
ComplianceService.setSelectedNamespace('acc/default');

// Get current namespace from cookie
const currentNamespace = ComplianceService.getSelectedNamespace();

// Fetch compliance data (uses namespace from cookie)
const data = await ComplianceService.getCompliance();
```

## Cache Behavior

### Compliance API
1. **First request**: Cache MISS - fetches from backend using namespace from cookie
2. **Subsequent requests**: Cache HIT - returns cached data (within 1 minute)
3. **Namespace change**: Cache MISS - fetches data for new namespace
4. **After expiration**: Cache MISS - fetches fresh data

### Namespaces API
1. **First request**: Cache MISS - fetches from backend
2. **Subsequent requests**: Cache HIT - returns cached data (within 5 minutes)
3. **After expiration**: Cache MISS - fetches fresh data

## Cache Headers

- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response fetched from backend
- `Cache-Control: public, max-age=60` - Compliance (1 minute)
- `Cache-Control: public, max-age=300` - Namespaces (5 minutes)

## Cookie Management

The `selected-namespace` cookie is used to store the current namespace:
- **Name**: `selected-namespace`
- **Value**: URL-encoded namespace (e.g., `acc%2Fdefault`)
- **Path**: `/`
- **Max-Age**: 7 days
- **Domain**: Current domain

## Testing

Run the test script to verify caching behavior:
```bash
./test-cache.sh
```

This will test both endpoints for cache hits/misses.

## Configuration

### Compliance Cache Duration
```typescript
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
```

### Namespaces Cache Duration
```typescript
const NAMESPACES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
```

## Benefits

- **Reduced backend load**: Frequent requests are served from cache
- **Cleaner URLs**: No namespace parameters in URLs
- **Persistent namespace selection**: Namespace choice persists across page reloads
- **Better user experience**: Faster page loads and API responses
- **Scalability**: Reduces database/backend queries significantly

## Monitoring

The implementation includes console logging to monitor cache behavior:
- Cache hits and misses are logged for both endpoints
- Backend API calls are logged
- Cache cleanup operations are visible in server logs

## Architecture

```
Frontend Component
       ↓
React Hook (useCompliance)
       ↓
Service Layer (ComplianceService)
       ↓
API Route (/api/compliance)
       ↓
Cookie → Namespace Selection
       ↓
Cache Check → Backend API (if needed)
```

This approach keeps URLs clean while providing efficient caching and persistent namespace selection.
