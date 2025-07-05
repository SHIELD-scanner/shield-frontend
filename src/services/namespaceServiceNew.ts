// src/services/namespaceService.ts

export interface Namespace {
  name: string;
  displayName?: string;
  cluster?: string;
}

export class NamespaceService {
  private static readonly baseUrl = "/api/namespaces";

  static async getNamespaces(): Promise<Namespace[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch namespaces: ${response.statusText}`);
    }

    return response.json();
  }
}
