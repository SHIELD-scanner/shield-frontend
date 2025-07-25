// src/hooks/useExposedSecrets.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ExposedSecretService,
  ExposedSecretReport,
} from "@/services/exposedSecretService";

interface UseExposedSecretsResult {
  data: ExposedSecretReport[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExposedSecrets(
  cluster?: string,
  namespace?: string,
): UseExposedSecretsResult {
  const [data, setData] = useState<ExposedSecretReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExposedSecrets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ExposedSecretService.getExposedSecrets(
        cluster,
        namespace,
      );
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch exposed secrets data",
      );
    } finally {
      setLoading(false);
    }
  }, [cluster, namespace]);

  useEffect(() => {
    void fetchExposedSecrets();
  }, [fetchExposedSecrets]);

  return {
    data,
    loading,
    error,
    refetch: fetchExposedSecrets,
  };
}
