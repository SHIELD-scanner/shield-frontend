# Namespace and Cluster Access Documentation

## Namespace Format

The user management system supports granular namespace and cluster-level access control:

### Access Types

1. **Global Access**: `["*"]`

   - Grants access to all namespaces across all clusters
   - Typically for SysAdmin role

2. **Cluster Access**: `["cluster:cluster-name"]`

   - Grants access to all namespaces within a specific cluster
   - Format: `cluster:${clusterName}`
   - Example: `["cluster:prod-cluster", "cluster:staging-cluster"]`

3. **Namespace Access**: `["namespace-name"]`

   - Grants access to specific namespaces only
   - Example: `["development", "testing", "feature-branch-1"]`

4. **Mixed Access**: Combination of cluster and namespace access
   - Example: `["cluster:dev-cluster", "production", "security"]`
   - Grants full access to dev-cluster + specific access to production and security namespaces

### Usage in Frontend

The `NamespaceMultiSelect` component handles:

- Fetching available namespaces from the `/api/namespaces` endpoint
- Grouping namespaces by cluster
- Displaying cluster-level options (🏢 icon) and namespace-level options (📁 icon)
- Preventing conflicts (selecting a cluster removes individual namespace selections for that cluster)

### Backend Integration

When integrating with the real backend at `localhost:8000`:

1. **Uncomment API calls** in:

   - `/api/users/route.ts`
   - `/api/users/[id]/route.ts`
   - `NamespaceMultiSelect.tsx`

2. **Expected Backend Endpoints**:

   - `GET /users` - List users with optional filtering
   - `POST /users` - Create new user
   - `GET /users/{id}` - Get user details
   - `PUT /users/{id}` - Update user
   - `DELETE /users/{id}` - Delete user
   - `GET /namespaces` - List available namespaces with cluster info

3. **Namespace API Response Format**:

```json
[
  {
    "name": "production",
    "cluster": "prod-cluster",
    "displayName": "Production"
  },
  {
    "name": "staging",
    "cluster": "staging-cluster",
    "displayName": "Staging"
  }
]
```

### Access Control Logic

Use the utility functions in `/utils/accessUtils.ts`:

- `hasNamespaceAccess(userNamespaces, targetNamespace)` - Check if user can access a namespace
- `getUserAccessibleNamespaces(userNamespaces, allNamespaces)` - Get all accessible namespaces for a user

### UI Features

- **Multi-select dropdown** with search functionality
- **Visual indicators**: 🏢 for clusters, 📁 for namespaces, 🌐 for global access
- **Conflict resolution**: Selecting cluster access removes individual namespace selections
- **Tag display**: Shows selected items as removable tags
- **Search**: Filter namespaces/clusters by name
