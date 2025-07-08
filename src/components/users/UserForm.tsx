import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/services/userService";
import NamespaceMultiSelect from "./NamespaceMultiSelect";

interface UserFormData {
  email: string;
  fullname: string;
  role: UserRole;
  namespaces: string[];
}

interface UserFormProps {
  readonly title: string;
  readonly formData: UserFormData;
  readonly setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
  readonly isEditing: boolean;
}

export default function UserForm({
  title,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
}: UserFormProps) {
  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label
              htmlFor="fullname"
              className="block text-sm font-medium mb-1"
            >
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              value={formData.fullname}
              onChange={(e) =>
                setFormData({ ...formData, fullname: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as UserRole })
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Developer">Developer</option>
            <option value="ClusterAdmin">Cluster Admin</option>
            <option value="SysAdmin">System Admin</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="namespaces"
            className="block text-sm font-medium mb-1"
          >
            Namespaces & Cluster Access
          </label>
          <NamespaceMultiSelect
            value={formData.namespaces}
            onChange={(namespaces) => setFormData({ ...formData, namespaces })}
            placeholder="Select namespaces or clusters..."
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {isEditing ? "Update User" : "Create User"}
          </Button>
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
