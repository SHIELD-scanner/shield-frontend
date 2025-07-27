import { useState, useEffect } from "react";
import { User, UserService, UserFilters, UserRole } from "@/services/userService";

export function useUsers(role?: string, namespace?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters: UserFilters = {};
        
        if (role && role !== "all") {
          filters.role = role as UserRole;
        }
        
        if (namespace && namespace !== "all") {
          filters.namespace = namespace;
        }

        const data = await UserService.getUsers(filters);
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role, namespace]);

  const refetch = async () => {
    const filters: UserFilters = {};
    
    if (role && role !== "all") {
      filters.role = role as UserRole;
    }
    
    if (namespace && namespace !== "all") {
      filters.namespace = namespace;
    }

    try {
      setLoading(true);
      const data = await UserService.getUsers(filters);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, refetch };
}
