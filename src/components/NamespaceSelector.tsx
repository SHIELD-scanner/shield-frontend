// src/components/NamespaceSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { ComplianceService } from "@/services/complianceService";
import { NamespaceService, type Namespace } from "@/services/namespaceService";

interface NamespaceSelectorProps {
  readonly className?: string;
  readonly onNamespaceChange?: (namespace: string) => void;
}

export function NamespaceSelector({
  className = "",
  onNamespaceChange,
}: NamespaceSelectorProps) {
  const [currentNamespace, setCurrentNamespace] =
    useState<string>("acc/default");
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial namespace from cookie
    const initialNamespace = ComplianceService.getSelectedNamespace();
    if (initialNamespace) {
      setCurrentNamespace(initialNamespace);
    }

    // Fetch available namespaces
    const fetchNamespaces = async () => {
      try {
        const namespacesData = await NamespaceService.getNamespaces();
        // If the response is an array of objects with name property
        if (
          Array.isArray(namespacesData) &&
          namespacesData.length > 0 &&
          typeof namespacesData[0] === "object"
        ) {
          setNamespaces(namespacesData.map((ns: Namespace) => ns.name ?? ns));
        } else {
          // If the response is an array of strings
          setNamespaces(namespacesData as unknown as string[]);
        }
      } catch (error) {
        console.error("Failed to fetch namespaces:", error);
        // Fallback to default namespaces
        setNamespaces(["acc/default", "production", "staging", "development"]);
      } finally {
        setLoading(false);
      }
    };

    void fetchNamespaces();
  }, []);

  const handleNamespaceChange = (namespace: string) => {
    setCurrentNamespace(namespace);
    ComplianceService.setSelectedNamespace(namespace);
    onNamespaceChange?.(namespace);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-300 rounded w-32"></div>
      </div>
    );
  }

  return (
    <select
      value={currentNamespace}
      onChange={(e) => handleNamespaceChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {namespaces.map((namespace) => (
        <option key={namespace} value={namespace}>
          {namespace}
        </option>
      ))}
    </select>
  );
}
