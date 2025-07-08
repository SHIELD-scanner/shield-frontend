// src/services/namespaceService.ts

export interface Namespace {
  name: string;
  displayName?: string;
  cluster?: string;
}

export async function fetchNamespaces(): Promise<string[]> {
  const res = await fetch("/api/namespaces");
  if (!res.ok) throw new Error("Failed to fetch namespaces");
  return res.json();
}

export class NamespaceService {
  private static readonly baseUrl = "/api/namespaces";

  static async getNamespaces(): Promise<Namespace[] | string[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch namespaces: ${response.statusText}`);
    }

    const data = await response.json();

    // The API may return either an array of namespace objects or an array of strings
    // We return the data as-is and let the consuming component handle the format
    return data;
  }
}
