// src/services/complianceService.ts

export interface ComplianceData {
  score: number;
  framework: string;
  version: string;
  status: string;
  lastUpdated: string;
  namespace?: string;
}

export class ComplianceService {
  private static readonly baseUrl = "/api/compliance";

  static async getCompliance(): Promise<ComplianceData> {
    // No need to pass namespace as parameter since it's handled via cookies
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch compliance data: ${response.statusText}`,
      );
    }

    return response.json();
  }

  // Helper method to set the namespace cookie
  static setSelectedNamespace(namespace: string): void {
    document.cookie = `selected-namespace=${encodeURIComponent(namespace)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
  }

  // Helper method to get the current namespace from cookie
  static getSelectedNamespace(): string | null {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "selected-namespace") {
        return decodeURIComponent(value);
      }
    }
    return null;
  }
}
