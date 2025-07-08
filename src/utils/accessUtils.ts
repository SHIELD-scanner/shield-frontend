// Utility functions for namespace/cluster access checking
export const hasNamespaceAccess = (
  userNamespaces: string[],
  targetNamespace: string
): boolean => {
  // If user has "*" access, they can access everything
  if (userNamespaces.includes("*")) {
    return true;
  }

  // Check direct namespace access
  if (userNamespaces.includes(targetNamespace)) {
    return true;
  }

  // Check cluster-level access
  // This would need to be implemented based on your cluster/namespace mapping
  // For now, we'll assume namespace format includes cluster info
  // const clusterChecks = userNamespaces.filter(ns => ns.startsWith("cluster:"));
  // for (const clusterAccess of clusterChecks) {
  //   // Here you would check if targetNamespace belongs to this cluster
  //   // This logic depends on your namespace/cluster structure
  //   // Example: if (isNamespaceInCluster(targetNamespace, clusterAccess.replace("cluster:", ""))) return true;
  // }

  return false;
};

export const getUserAccessibleNamespaces = (
  userNamespaces: string[],
  allNamespaces: { name: string; cluster: string }[]
): string[] => {
  if (userNamespaces.includes("*")) {
    return allNamespaces.map((ns) => ns.name);
  }

  const accessibleNamespaces: string[] = [];

  // Add direct namespace access
  userNamespaces.forEach((userNs) => {
    if (!userNs.startsWith("cluster:")) {
      accessibleNamespaces.push(userNs);
    }
  });

  // Add cluster-level access
  const clusterAccess = userNamespaces.filter((ns) =>
    ns.startsWith("cluster:")
  );
  clusterAccess.forEach((clusterAccess) => {
    const clusterName = clusterAccess.replace("cluster:", "");
    const clusterNamespaces = allNamespaces
      .filter((ns) => ns.cluster === clusterName)
      .map((ns) => ns.name);
    accessibleNamespaces.push(...clusterNamespaces);
  });

  return [...new Set(accessibleNamespaces)]; // Remove duplicates
};
