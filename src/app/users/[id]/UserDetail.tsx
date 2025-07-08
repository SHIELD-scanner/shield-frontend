"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, UserService, UserRole } from "@/services/userService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/users/UserForm";
import { formatNamespaceDisplay } from "@/utils/namespaceUtils";

const roleColor: Record<UserRole, string> = {
  SysAdmin: "bg-red-600 text-white",
  ClusterAdmin: "bg-blue-600 text-white",
  Developer: "bg-green-600 text-white",
};

const statusColor = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
};

interface UserFormData {
  email: string;
  fullname: string;
  role: UserRole;
  namespaces: string[];
}

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    fullname: "",
    role: "Developer",
    namespaces: [],
  });

  const userId = params.id as string;

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await UserService.getUserById(userId);
        setUser(userData);
        setFormData({
          email: userData.email,
          fullname: userData.fullname,
          role: userData.role,
          namespaces: userData.namespaces,
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/users");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedUser = await UserService.updateUser(user.id, formData);
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await UserService.deleteUser(user.id);
      router.push("/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        namespaces: user.namespaces,
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/users")} variant="outline">
            Back to Users
          </Button>
          {!editing && (
            <>
              <Button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit User
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete User
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <UserForm
          title="Edit User"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
          isEditing={true}
        />
      ) : (
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="block text-sm font-medium text-gray-600">
                    Email
                  </div>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-600">
                    Full Name
                  </div>
                  <p className="text-lg">{user.fullname}</p>
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-600">
                    Role
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm ${
                      roleColor[user.role]
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-600">
                    Status
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm ${
                      statusColor[user.status]
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Namespace Access</h3>
              <div className="space-y-3">
                <div>
                  <div className="block text-sm font-medium text-gray-600">
                    Namespaces
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.namespaces.map((namespace) => {
                      const formatted = formatNamespaceDisplay(namespace);
                      return (
                        <span
                          key={`${user.id}-${namespace}`}
                          className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <span>{formatted.icon}</span>
                          <span>{formatted.text}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="block text-sm font-medium text-gray-600">
                  Created At
                </div>
                <p className="text-lg">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-600">
                  Last Login
                </div>
                <p className="text-lg">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-600">
                  User ID
                </div>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
