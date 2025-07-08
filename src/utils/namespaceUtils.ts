// Utility functions for namespace display
export const formatNamespaceDisplay = (
  namespace: string
): { text: string; icon: string; type: "namespace" | "cluster" | "all" } => {
  if (namespace === "*") {
    return { text: "All namespaces", icon: "🌐", type: "all" };
  }
  if (namespace.startsWith("cluster:")) {
    const clusterName = namespace.replace("cluster:", "");
    return {
      text: `${clusterName} (entire cluster)`,
      icon: "🏢",
      type: "cluster",
    };
  }
  return { text: namespace, icon: "📁", type: "namespace" };
};
