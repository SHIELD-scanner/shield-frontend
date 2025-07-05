// src/hooks/useCompliance.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ComplianceService,
  ComplianceData,
} from "@/services/complianceService";

interface UseComplianceResult {
  data: ComplianceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setNamespace: (namespace: string) => void;
  currentNamespace: string | null;
}

export function useCompliance(): UseComplianceResult {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNamespace, setCurrentNamespace] = useState<string | null>(null);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ComplianceService.getCompliance();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch compliance data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const setNamespace = useCallback(
    (namespace: string) => {
      ComplianceService.setSelectedNamespace(namespace);
      setCurrentNamespace(namespace);
      // Refetch data when namespace changes
      void fetchCompliance();
    },
    [fetchCompliance]
  );

  useEffect(() => {
    // Get initial namespace from cookie
    const initialNamespace = ComplianceService.getSelectedNamespace();
    setCurrentNamespace(initialNamespace);
    void fetchCompliance();
  }, [fetchCompliance]);

  return {
    data,
    loading,
    error,
    refetch: fetchCompliance,
    setNamespace,
    currentNamespace,
  };
}
