export type SbomReport = {
  uid: string;
  cluster: string;
  namespace: string;
  pod_id: string;
  resource: string;
  target: string;
  component: string;
  version: string;
  packageType: string;
  packagePURL: string;
  licenses: string[];
  dependencies: string[];
  lastModifiedDate: string;
};

export async function fetchSbom(
  cluster: string,
  namespace: string,
): Promise<SbomReport[]> {
  const params = new URLSearchParams();
  if (cluster && cluster !== "all") params.append("cluster", cluster);
  if (namespace && namespace !== "all") params.append("namespace", namespace);

  // Use the API route instead of directly calling the backend
  const url = `/api/sbom?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch SBOM");
  return res.json();
}

export class SbomService {
  private static readonly baseUrl = "/api/sbom";

  static async getSbom(
    cluster?: string,
    namespace?: string,
  ): Promise<SbomReport[]> {
    const params = new URLSearchParams();

    if (cluster && cluster !== "all") {
      params.append("cluster", cluster);
    }
    if (namespace && namespace !== "all") {
      params.append("namespace", namespace);
    }

    const url = params.toString()
      ? `${this.baseUrl}?${params.toString()}`
      : this.baseUrl;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch SBOM: ${response.statusText}`,
      );
    }

    return response.json();
  }

  static async getSbomByCluster(
    cluster: string,
  ): Promise<SbomReport[]> {
    return this.getSbom(cluster);
  }

  static async getSbomByNamespace(
    namespace: string,
  ): Promise<SbomReport[]> {
    return this.getSbom(undefined, namespace);
  }

  static async getSbomByClusterAndNamespace(
    cluster: string,
    namespace: string,
  ): Promise<SbomReport[]> {
    return this.getSbom(cluster, namespace);
  }

  static async getSbomById(uid: string): Promise<SbomReport> {
    const response = await fetch(`${this.baseUrl}/${uid}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch SBOM by UID: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
