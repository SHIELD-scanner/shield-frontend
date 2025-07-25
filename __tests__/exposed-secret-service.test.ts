// __tests__/exposed-secret-service.test.ts
import { ExposedSecretService, fetchExposedSecrets, type ExposedSecretReport } from "../src/services/exposedSecretService";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("ExposedSecretService", () => {
  const mockExposedSecret: ExposedSecretReport = {
    uid: "secret-123",
    cluster: "production",
    namespace: "web-app",
    pod_id: "pod-456",
    resource: "deployment/web-server",
    target: "container/web-app",
    secretType: "aws-access-key",
    secretValue: "AKIAIOSFODNN7EXAMPLE",
    confidence: 95,
    ruleID: "aws-access-key-id",
    title: "AWS Access Key ID",
    description: "Detected AWS Access Key ID",
    category: "secrets",
    severity: "high",
    lastModifiedDate: "2025-07-25T10:30:00Z",
    filePath: "/app/config.env",
    lineNumber: 42,
  };

  const mockExposedSecrets: ExposedSecretReport[] = [
    mockExposedSecret,
    {
      ...mockExposedSecret,
      uid: "secret-456",
      secretType: "github-token",
      secretValue: "ghp_1234567890abcdef",
      confidence: 88,
      severity: "critical",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockExposedSecrets,
    });
  });

  describe("getExposedSecrets", () => {
    it("should fetch exposed secrets without parameters", async () => {
      const result = await ExposedSecretService.getExposedSecrets();

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets");
      expect(result).toEqual(mockExposedSecrets);
    });

    it("should fetch exposed secrets with cluster parameter", async () => {
      await ExposedSecretService.getExposedSecrets("production");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?cluster=production");
    });

    it("should fetch exposed secrets with namespace parameter", async () => {
      await ExposedSecretService.getExposedSecrets(undefined, "web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?namespace=web-app");
    });

    it("should fetch exposed secrets with both cluster and namespace parameters", async () => {
      await ExposedSecretService.getExposedSecrets("production", "web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?cluster=production&namespace=web-app");
    });

    it("should not include 'all' values in query parameters", async () => {
      await ExposedSecretService.getExposedSecrets("all", "all");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets");
    });

    it("should handle fetch errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(ExposedSecretService.getExposedSecrets()).rejects.toThrow(
        "Failed to fetch exposed secrets: Internal Server Error"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(ExposedSecretService.getExposedSecrets()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getExposedSecretsByCluster", () => {
    it("should fetch exposed secrets for a specific cluster", async () => {
      await ExposedSecretService.getExposedSecretsByCluster("production");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?cluster=production");
    });

    it("should return the same result as getExposedSecrets with cluster", async () => {
      const clusterResult = await ExposedSecretService.getExposedSecretsByCluster("production");
      const generalResult = await ExposedSecretService.getExposedSecrets("production");

      expect(clusterResult).toEqual(generalResult);
    });
  });

  describe("getExposedSecretsByNamespace", () => {
    it("should fetch exposed secrets for a specific namespace", async () => {
      await ExposedSecretService.getExposedSecretsByNamespace("web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?namespace=web-app");
    });

    it("should return the same result as getExposedSecrets with namespace", async () => {
      const namespaceResult = await ExposedSecretService.getExposedSecretsByNamespace("web-app");
      const generalResult = await ExposedSecretService.getExposedSecrets(undefined, "web-app");

      expect(namespaceResult).toEqual(generalResult);
    });
  });

  describe("getExposedSecretsByClusterAndNamespace", () => {
    it("should fetch exposed secrets for specific cluster and namespace", async () => {
      await ExposedSecretService.getExposedSecretsByClusterAndNamespace("production", "web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?cluster=production&namespace=web-app");
    });

    it("should return the same result as getExposedSecrets with both parameters", async () => {
      const specificResult = await ExposedSecretService.getExposedSecretsByClusterAndNamespace("production", "web-app");
      const generalResult = await ExposedSecretService.getExposedSecrets("production", "web-app");

      expect(specificResult).toEqual(generalResult);
    });
  });

  describe("getExposedSecretById", () => {
    const mockSingleSecret: ExposedSecretReport = {
      ...mockExposedSecret,
      uid: "secret-specific-123",
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSingleSecret,
      });
    });

    it("should fetch a specific exposed secret by UID", async () => {
      const result = await ExposedSecretService.getExposedSecretById("secret-specific-123");

      expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets/secret-specific-123");
      expect(result).toEqual(mockSingleSecret);
    });

    it("should handle not found errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(ExposedSecretService.getExposedSecretById("nonexistent")).rejects.toThrow(
        "Failed to fetch exposed secret by UID: Not Found"
      );
    });

    it("should handle server errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(ExposedSecretService.getExposedSecretById("secret-123")).rejects.toThrow(
        "Failed to fetch exposed secret by UID: Internal Server Error"
      );
    });
  });
});

describe("fetchExposedSecrets function", () => {
  const mockExposedSecrets: ExposedSecretReport[] = [
    {
      uid: "secret-789",
      cluster: "staging",
      namespace: "api",
      pod_id: "pod-789",
      resource: "deployment/api-server",
      target: "container/api",
      secretType: "database-password",
      secretValue: "supersecretpassword123",
      confidence: 92,
      ruleID: "generic-password",
      title: "Generic Password",
      description: "Detected generic password",
      category: "secrets",
      severity: "medium",
      lastModifiedDate: "2025-07-25T11:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockExposedSecrets,
    });
  });

  it("should fetch exposed secrets with cluster and namespace", async () => {
    const result = await fetchExposedSecrets("staging", "api");

    expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?cluster=staging&namespace=api");
    expect(result).toEqual(mockExposedSecrets);
  });

  it("should fetch exposed secrets with only cluster", async () => {
    await fetchExposedSecrets("staging", "all");

    expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?cluster=staging");
  });

  it("should fetch exposed secrets with only namespace", async () => {
    await fetchExposedSecrets("all", "api");

    expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?namespace=api");
  });

  it("should fetch all exposed secrets when both parameters are 'all'", async () => {
    await fetchExposedSecrets("all", "all");

    expect(mockFetch).toHaveBeenCalledWith("/api/exposedsecrets?");
  });

  it("should handle fetch errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    await expect(fetchExposedSecrets("staging", "api")).rejects.toThrow(
      "Failed to fetch exposed secrets"
    );
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    await expect(fetchExposedSecrets("staging", "api")).rejects.toThrow(
      "Network timeout"
    );
  });
});
