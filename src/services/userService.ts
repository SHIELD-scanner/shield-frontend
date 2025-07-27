export type UserRole = "SysAdmin" | "ClusterAdmin" | "Developer";

export type User = {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  namespaces: string[]; // Can contain "*" for all access or "clustername:namespace" or "clustername:all" for cluster access
  createdAt: string;
  lastLogin: string | null;
  status: "active" | "inactive";
};

export type CreateUserData = Omit<
  User,
  "id" | "createdAt" | "lastLogin" | "status"
>;
export type UpdateUserData = Partial<CreateUserData & { 
  status?: "active" | "inactive";
}>;

// API Response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
};

// User filters for API requests
export type UserFilters = {
  role?: UserRole | "all";
  namespace?: string;
  status?: "active" | "inactive" | "all";
  search?: string;
  page?: number;
  limit?: number;
};

// Bulk operations
export type BulkUserUpdate = {
  userIds: string[];
  updates: Partial<UpdateUserData>;
};

export type BulkUserResult = {
  successful: string[];
  failed: Array<{ id: string; error: string; }>;
};

// Legacy function for backward compatibility
export async function fetchUsers(
  role?: string,
  namespace?: string
): Promise<User[]> {
  console.warn('fetchUsers is deprecated. Use UserService.getUsers() instead.');
  return UserService.getUsers({ role: role as UserRole, namespace });
}

export class UserService {
  private static readonly baseUrl = "/api/users";

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the status text
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle different API response formats
    if (Array.isArray(data)) {
      // Direct array response
      return data as T;
    }
    
    if (data && typeof data === 'object') {
      // Check for nested data structure: { data: { users: [...] } }
      if (data.data && data.data.users !== undefined) {
        return data.data.users as T;
      }
      
      // Object response - check for data property
      if (data.data !== undefined) {
        return data.data as T;
      }
      
      // If no data property, check for other common patterns
      if (data.users !== undefined) {
        return data.users as T;
      }
      
      if (data.results !== undefined) {
        return data.results as T;
      }
    }
    
    return data as T;
  }

  static async getUsers(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams();

    if (filters?.role && filters.role !== "all") {
      params.append("role", filters.role);
    }
    if (filters?.namespace && filters.namespace !== "all") {
      params.append("namespace", filters.namespace);
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<User[]>(response);
  }

  static async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<User>(response);
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  static async deleteUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<User>(response);
  }

  // Bulk operations
  static async bulkUpdateUsers(bulkUpdate: BulkUserUpdate): Promise<BulkUserResult> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bulkUpdate),
    });

    return this.handleResponse<BulkUserResult>(response);
  }

  static async bulkDeleteUsers(userIds: string[]): Promise<BulkUserResult> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIds }),
    });

    return this.handleResponse<BulkUserResult>(response);
  }

  // User status operations
  static async activateUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<User>(response);
  }

  static async deactivateUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<User>(response);
  }

  // Namespace operations
  static async updateUserNamespaces(id: string, namespaces: string[]): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}/namespaces`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ namespaces }),
    });

    return this.handleResponse<User>(response);
  }

  // User statistics
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse(response);
  }

  // Password reset
  static async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/password-reset/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  // User activity
  static async getUserActivity(id: string, limit?: number): Promise<Array<{
    id: string;
    action: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>> {
    const params = new URLSearchParams();
    if (limit) {
      params.append("limit", limit.toString());
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseUrl}/${id}/activity?${queryString}` 
      : `${this.baseUrl}/${id}/activity`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse(response);
  }

  // Get available roles
  static async getRoles(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
  }>> {
    const response = await fetch(`${this.baseUrl}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse(response);
  }
}
