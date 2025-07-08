export type UserRole = "SysAdmin" | "ClusterAdmin" | "Developer";

export type User = {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  namespaces: string[]; // Can contain namespace names or "cluster:clustername" for full cluster access
  createdAt: string;
  lastLogin: string | null;
  status: "active" | "inactive";
};

export type CreateUserData = Omit<
  User,
  "id" | "createdAt" | "lastLogin" | "status"
>;
export type UpdateUserData = Partial<CreateUserData>;

export async function fetchUsers(
  role?: string,
  namespace?: string
): Promise<User[]> {
  const params = new URLSearchParams();
  if (role && role !== "all") params.append("role", role);
  if (namespace && namespace !== "all") params.append("namespace", namespace);

  const url = `/api/users?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export class UserService {
  private static readonly baseUrl = "/api/users";

  static async getUsers(role?: string, namespace?: string): Promise<User[]> {
    const params = new URLSearchParams();

    if (role && role !== "all") {
      params.append("role", role);
    }
    if (namespace && namespace !== "all") {
      params.append("namespace", namespace);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  static async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  static async deleteUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    return response.json();
  }
}
