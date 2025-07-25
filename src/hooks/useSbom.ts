// src/hooks/useSbom.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { SbomService, SbomReport } from "@/services/sbomService";

interface UseSbomResult {
  data: SbomReport[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSbom(cluster?: string, namespace?: string): UseSbomResult {
  const [data, setData] = useState<SbomReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSbom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SbomService.getSbom(cluster, namespace);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch SBOM data"
      );
    } finally {
      setLoading(false);
    }
  }, [cluster, namespace]);

  useEffect(() => {
    void fetchSbom();
  }, [fetchSbom]);

  return {
    data,
    loading,
    error,
    refetch: fetchSbom,
  };
}
