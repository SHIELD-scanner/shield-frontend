export type ExposedSecretReport = {
  uid: string;
  cluster: string;
  namespace: string;
  pod_id: string;
  resource: string;
  target: string;
  secretType: string;
  secretValue: string;
  confidence: number;
  ruleID: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  lastModifiedDate: string;
  filePath?: string;
  lineNumber?: number;
};

export async function fetchExposedSecrets(
  cluster: string,
  namespace: string,
): Promise<ExposedSecretReport[]> {
  const params = new URLSearchParams();
  if (cluster && cluster !== "all") params.append("cluster", cluster);
  if (namespace && namespace !== "all") params.append("namespace", namespace);

  // Use the API route instead of directly calling the backend
  const url = `/api/exposedsecrets?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch exposed secrets");
  return res.json();
}

export class ExposedSecretService {
  private static readonly baseUrl = "/api/exposedsecrets";

  static async getExposedSecrets(
    cluster?: string,
    namespace?: string,
  ): Promise<ExposedSecretReport[]> {
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
        `Failed to fetch exposed secrets: ${response.statusText}`,
      );
    }

    return response.json();
  }

  static async getExposedSecretsByCluster(
    cluster: string,
  ): Promise<ExposedSecretReport[]> {
    return this.getExposedSecrets(cluster);
  }

  static async getExposedSecretsByNamespace(
    namespace: string,
  ): Promise<ExposedSecretReport[]> {
    return this.getExposedSecrets(undefined, namespace);
  }

  static async getExposedSecretsByClusterAndNamespace(
    cluster: string,
    namespace: string,
  ): Promise<ExposedSecretReport[]> {
    return this.getExposedSecrets(cluster, namespace);
  }

  static async getExposedSecretById(uid: string): Promise<ExposedSecretReport> {
    const response = await fetch(`${this.baseUrl}/${uid}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch exposed secret by UID: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
