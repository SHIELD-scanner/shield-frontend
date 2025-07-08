import React, { useEffect, useState } from "react";
import { NamespaceService, type Namespace } from "@/services/namespaceService";

export interface NamespaceOption {
  id: string;
  name: string;
  cluster: string;
  type: "namespace" | "cluster";
  displayName: string;
}

interface NamespaceMultiSelectProps {
  readonly value: string[];
  readonly onChange: (selectedNamespaces: string[]) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export default function NamespaceMultiSelect({
  value,
  onChange,
  placeholder = "Select namespaces...",
  disabled = false,
}: NamespaceMultiSelectProps) {
  const [options, setOptions] = useState<NamespaceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNamespaces = async () => {
      setLoading(true);
      try {
        // Use the existing NamespaceService - matches NamespaceSelector pattern
        const namespacesData = await NamespaceService.getNamespaces();

        let namespacesList: Namespace[] = [];

        // Handle both object and string array responses (exactly like NamespaceSelector)
        if (
          Array.isArray(namespacesData) &&
          namespacesData.length > 0 &&
          typeof namespacesData[0] === "object"
        ) {
          namespacesList = namespacesData as Namespace[];
        } else {
          // If the response is an array of strings, convert to objects
          const stringArray = namespacesData as string[];
          namespacesList = stringArray.map((name) => ({
            name,
            cluster: "default-cluster", // Default cluster if not specified
            displayName: name, // Use name as displayName
          }));
        }

        // Group namespaces by cluster and create options
        const clusters = new Set(
          namespacesList.map((ns) => ns.cluster || "default-cluster")
        );
        const namespaceOptions: NamespaceOption[] = [];

        // Add cluster options (allows access to all namespaces in cluster)
        clusters.forEach((cluster) => {
          namespaceOptions.push({
            id: `cluster:${cluster}`,
            name: cluster,
            cluster: cluster,
            type: "cluster",
            displayName: `🏢 ${cluster} (entire cluster)`,
          });
        });

        // Add individual namespace options
        namespacesList.forEach((ns) => {
          const cluster = ns.cluster || "default-cluster";
          const displayName = ns.displayName || ns.name;
          namespaceOptions.push({
            id: `namespace:${cluster}:${ns.name}`,
            name: ns.name,
            cluster: cluster,
            type: "namespace",
            displayName: `📁 ${displayName} (${cluster})`,
          });
        });

        // Sort: clusters first, then namespaces, both alphabetically
        namespaceOptions.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "cluster" ? -1 : 1;
          }
          return a.displayName.localeCompare(b.displayName);
        });

        setOptions(namespaceOptions);
      } catch (error) {
        console.error("Failed to fetch namespaces:", error);
        // Fallback to default namespaces (matches NamespaceSelector pattern)
        const fallbackNamespaces = [
          "acc/default",
          "production",
          "staging",
          "development",
        ];
        const fallbackOptions: NamespaceOption[] = [];

        // Add default cluster option
        fallbackOptions.push({
          id: "cluster:default-cluster",
          name: "default-cluster",
          cluster: "default-cluster",
          type: "cluster",
          displayName: "🏢 default-cluster (entire cluster)",
        });

        // Add fallback namespace options
        fallbackNamespaces.forEach((ns) => {
          fallbackOptions.push({
            id: `namespace:default-cluster:${ns}`,
            name: ns,
            cluster: "default-cluster",
            type: "namespace",
            displayName: `📁 ${ns} (default-cluster)`,
          });
        });

        setOptions(fallbackOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchNamespaces();
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      option.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.cluster.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: NamespaceOption) => {
    const newValue = [...value];

    if (option.type === "cluster") {
      // If selecting a cluster, remove all individual namespaces from that cluster
      // and add the cluster identifier
      const clusterKey = `cluster:${option.cluster}`;
      const namespacesInCluster = options
        .filter(
          (opt) => opt.type === "namespace" && opt.cluster === option.cluster
        )
        .map((opt) => opt.name);

      // Remove individual namespaces from this cluster
      namespacesInCluster.forEach((ns) => {
        const index = newValue.indexOf(ns);
        if (index > -1) {
          newValue.splice(index, 1);
        }
      });

      // Toggle cluster selection
      const clusterIndex = newValue.indexOf(clusterKey);
      if (clusterIndex > -1) {
        newValue.splice(clusterIndex, 1);
      } else {
        newValue.push(clusterKey);
      }
    } else {
      // If selecting a namespace, remove cluster access for that cluster
      const clusterKey = `cluster:${option.cluster}`;
      const clusterIndex = newValue.indexOf(clusterKey);
      if (clusterIndex > -1) {
        newValue.splice(clusterIndex, 1);
      }

      // Toggle namespace selection
      const namespaceIndex = newValue.indexOf(option.name);
      if (namespaceIndex > -1) {
        newValue.splice(namespaceIndex, 1);
      } else {
        newValue.push(option.name);
      }
    }

    onChange(newValue);
  };

  const isSelected = (option: NamespaceOption) => {
    if (option.type === "cluster") {
      return value.includes(`cluster:${option.cluster}`);
    } else {
      return (
        value.includes(option.name) ||
        value.includes(`cluster:${option.cluster}`)
      );
    }
  };

  const removeSelection = (item: string) => {
    const newValue = value.filter((v) => v !== item);
    onChange(newValue);
  };

  const getDisplayText = (item: string) => {
    if (item.startsWith("cluster:")) {
      const clusterName = item.replace("cluster:", "");
      return `🏢 ${clusterName} (entire cluster)`;
    }
    const option = options.find((opt) => opt.name === item);
    return option ? `📁 ${item} (${option.cluster})` : item;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="w-full">
        {/* Selected items display */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                  bg-gray-200 text-gray-900
                  dark:bg-gray-700 dark:text-gray-100"
              >
                {getDisplayText(item)}
                <button
                  type="button"
                  onClick={() => removeSelection(item)}
                  className="hover:text-red-500 dark:hover:text-red-300 focus:outline-none"
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input field */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length > 0 ? "Add more..." : placeholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            disabled={disabled}
          >
            ▼
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {(() => {
            if (loading) {
              return (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  Loading namespaces...
                </div>
              );
            }
            if (filteredOptions.length === 0) {
              return (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  No namespaces found
                </div>
              );
            }
            return filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between ${
                  isSelected(option)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                    : ""
                }`}
              >
                <span>{option.displayName}</span>
                {isSelected(option) && <span className="text-blue-600 dark:text-blue-200">✓</span>}
              </button>
            ));
          })()}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          aria-label="Close dropdown"
        />
      )}
    </div>
  );
}
