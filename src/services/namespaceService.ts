// src/services/namespaceService.ts
export async function fetchNamespaces(): Promise<string[]> {
  const res = await fetch("/api/namespaces");
  if (!res.ok) throw new Error("Failed to fetch namespaces");
  return res.json();
}
