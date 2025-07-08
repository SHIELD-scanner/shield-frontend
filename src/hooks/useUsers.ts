import { useState, useEffect } from "react";
import { User, UserService } from "@/services/userService";

export function useUsers(role?: string, namespace?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.getUsers(role, namespace);
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

  return { users, loading, error, refetch: () => setUsers([]) };
}
