// __tests__/sbom-service.test.ts
import { SbomService, fetchSbom, type SbomReport } from "../src/services/sbomService";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("SbomService", () => {
  const mockSbomReport: SbomReport = {
    uid: "sbom-123",
    cluster: "production",
    namespace: "web-app",
    pod_id: "pod-456",
    resource: "deployment/web-server",
    target: "container/web-app",
    component: "express",
    version: "4.18.2",
    packageType: "npm",
    packagePURL: "pkg:npm/express@4.18.2",
    licenses: ["MIT"],
    dependencies: ["body-parser@1.20.1", "cookie@0.5.0"],
    lastModifiedDate: "2025-07-25T10:30:00Z",
  };

  const mockSbomReports: SbomReport[] = [
    mockSbomReport,
    {
      ...mockSbomReport,
      uid: "sbom-456",
      component: "react",
      version: "18.2.0",
      packageType: "npm",
      packagePURL: "pkg:npm/react@18.2.0",
      licenses: ["MIT"],
      dependencies: ["loose-envify@1.4.0"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSbomReports,
    });
  });

  describe("getSbom", () => {
    it("should fetch SBOM without parameters", async () => {
      const result = await SbomService.getSbom();

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom");
      expect(result).toEqual(mockSbomReports);
    });

    it("should fetch SBOM with cluster parameter", async () => {
      await SbomService.getSbom("production");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom?cluster=production");
    });

    it("should fetch SBOM with namespace parameter", async () => {
      await SbomService.getSbom(undefined, "web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom?namespace=web-app");
    });

    it("should fetch SBOM with both cluster and namespace parameters", async () => {
      await SbomService.getSbom("production", "web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom?cluster=production&namespace=web-app");
    });

    it("should not include 'all' values in query parameters", async () => {
      await SbomService.getSbom("all", "all");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom");
    });

    it("should handle fetch errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(SbomService.getSbom()).rejects.toThrow(
        "Failed to fetch SBOM: Internal Server Error"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(SbomService.getSbom()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getSbomByCluster", () => {
    it("should fetch SBOM for a specific cluster", async () => {
      await SbomService.getSbomByCluster("production");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom?cluster=production");
    });

    it("should return the same result as getSbom with cluster", async () => {
      const clusterResult = await SbomService.getSbomByCluster("production");
      const generalResult = await SbomService.getSbom("production");

      expect(clusterResult).toEqual(generalResult);
    });
  });

  describe("getSbomByNamespace", () => {
    it("should fetch SBOM for a specific namespace", async () => {
      await SbomService.getSbomByNamespace("web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom?namespace=web-app");
    });

    it("should return the same result as getSbom with namespace", async () => {
      const namespaceResult = await SbomService.getSbomByNamespace("web-app");
      const generalResult = await SbomService.getSbom(undefined, "web-app");

      expect(namespaceResult).toEqual(generalResult);
    });
  });

  describe("getSbomByClusterAndNamespace", () => {
    it("should fetch SBOM for specific cluster and namespace", async () => {
      await SbomService.getSbomByClusterAndNamespace("production", "web-app");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom?cluster=production&namespace=web-app");
    });

    it("should return the same result as getSbom with both parameters", async () => {
      const specificResult = await SbomService.getSbomByClusterAndNamespace("production", "web-app");
      const generalResult = await SbomService.getSbom("production", "web-app");

      expect(specificResult).toEqual(generalResult);
    });
  });

  describe("getSbomById", () => {
    const mockSingleSbom: SbomReport = {
      ...mockSbomReport,
      uid: "sbom-specific-123",
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSingleSbom,
      });
    });

    it("should fetch a specific SBOM by UID", async () => {
      const result = await SbomService.getSbomById("sbom-specific-123");

      expect(mockFetch).toHaveBeenCalledWith("/api/sbom/sbom-specific-123");
      expect(result).toEqual(mockSingleSbom);
    });

    it("should handle not found errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(SbomService.getSbomById("nonexistent")).rejects.toThrow(
        "Failed to fetch SBOM by UID: Not Found"
      );
    });

    it("should handle server errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(SbomService.getSbomById("sbom-123")).rejects.toThrow(
        "Failed to fetch SBOM by UID: Internal Server Error"
      );
    });
  });
});

describe("fetchSbom function", () => {
  const mockSbomReports: SbomReport[] = [
    {
      uid: "sbom-789",
      cluster: "staging",
      namespace: "api",
      pod_id: "pod-789",
      resource: "deployment/api-server",
      target: "container/api",
      component: "fastify",
      version: "4.21.0",
      packageType: "npm",
      packagePURL: "pkg:npm/fastify@4.21.0",
      licenses: ["MIT"],
      dependencies: ["ajv@8.12.0", "find-my-way@7.6.0"],
      lastModifiedDate: "2025-07-25T11:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSbomReports,
    });
  });

  it("should fetch SBOM with cluster and namespace", async () => {
    const result = await fetchSbom("staging", "api");

    expect(mockFetch).toHaveBeenCalledWith("/api/sbom?cluster=staging&namespace=api");
    expect(result).toEqual(mockSbomReports);
  });

  it("should fetch SBOM with only cluster", async () => {
    await fetchSbom("staging", "all");

    expect(mockFetch).toHaveBeenCalledWith("/api/sbom?cluster=staging");
  });

  it("should fetch SBOM with only namespace", async () => {
    await fetchSbom("all", "api");

    expect(mockFetch).toHaveBeenCalledWith("/api/sbom?namespace=api");
  });

  it("should fetch all SBOM when both parameters are 'all'", async () => {
    await fetchSbom("all", "all");

    expect(mockFetch).toHaveBeenCalledWith("/api/sbom?");
  });

  it("should handle fetch errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    await expect(fetchSbom("staging", "api")).rejects.toThrow(
      "Failed to fetch SBOM"
    );
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    await expect(fetchSbom("staging", "api")).rejects.toThrow(
      "Network timeout"
    );
  });
});
