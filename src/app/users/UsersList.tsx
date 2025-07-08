"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchUsers,
  User,
  UserRole,
  CreateUserData,
  UserService,
} from "@/services/userService";
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

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    fullname: "",
    role: "Developer",
    namespaces: [],
  });

  const fetchAndSetUsers = async (role: string, namespace: string) => {
    setLoading(true);
    try {
      const data = await fetchUsers(role, namespace);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetUsers(selectedRole, selectedNamespace);
  }, [selectedRole, selectedNamespace]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createData: CreateUserData = {
        ...formData,
        namespaces:
          formData.namespaces.length > 0
            ? formData.namespaces
            : ["development"],
      };
      await UserService.createUser(createData);
      setShowCreateForm(false);
      setFormData({
        email: "",
        fullname: "",
        role: "Developer",
        namespaces: [],
      });
      fetchAndSetUsers(selectedRole, selectedNamespace);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await UserService.updateUser(editingUser.id, formData);
      setEditingUser(null);
      setFormData({
        email: "",
        fullname: "",
        role: "Developer",
        namespaces: [],
      });
      fetchAndSetUsers(selectedRole, selectedNamespace);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await UserService.deleteUser(id);
      fetchAndSetUsers(selectedRole, selectedNamespace);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullname: user.fullname,
      role: user.role,
      namespaces: user.namespaces,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    setFormData({
      email: "",
      fullname: "",
      role: "Developer",
      namespaces: [],
    });
  };

  let filteredUsers = users;
  if (search.trim()) {
    filteredUsers = users.filter(
      (user) =>
        user.email.toLowerCase().includes(search.trim().toLowerCase()) ||
        user.fullname.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Add New User
        </Button>
      </div>

      {(showCreateForm || editingUser) && (
        <UserForm
          title={editingUser ? "Edit User" : "Create New User"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={cancelEdit}
          isEditing={!!editingUser}
        />
      )}

      <Card className="p-6 bg-white dark:bg-gray-900 transition-colors">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Roles</option>
            <option value="SysAdmin">System Admin</option>
            <option value="ClusterAdmin">Cluster Admin</option>
            <option value="Developer">Developer</option>
          </select>
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Namespaces</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Full Name</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Namespaces</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Last Login</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                if (loading) {
                  return (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        Loading users...
                      </td>
                    </tr>
                  );
                }
                if (filteredUsers.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  );
                }
                return filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.email}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{user.fullname}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          roleColor[user.role]
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.namespaces.map((ns) => {
                          const formatted = formatNamespaceDisplay(ns);
                          return (
                            <span
                              key={`${user.id}-${ns}`}
                              className="px-2 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors
                                bg-gray-200 text-gray-900
                                dark:bg-gray-700 dark:text-gray-100"
                            >
                              <span>{formatted.icon}</span>
                              <span>{formatted.text}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          statusColor[user.status]
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/users/${user.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <Button
                          onClick={() => startEdit(user)}
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
