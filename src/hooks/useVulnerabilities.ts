// src/hooks/useVulnerabilities.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  VulnerabilityService,
  VulnerabilityReport,
} from "@/services/vulnerabilityService";

interface UseVulnerabilitiesResult {
  data: VulnerabilityReport[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVulnerabilities(
  cluster?: string,
  namespace?: string,
): UseVulnerabilitiesResult {
  const [data, setData] = useState<VulnerabilityReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVulnerabilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await VulnerabilityService.getVulnerabilities(
        cluster,
        namespace,
      );
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch vulnerabilities data",
      );
    } finally {
      setLoading(false);
    }
  }, [cluster, namespace]);

  useEffect(() => {
    void fetchVulnerabilities();
  }, [fetchVulnerabilities]);

  return {
    data,
    loading,
    error,
    refetch: fetchVulnerabilities,
  };
}
