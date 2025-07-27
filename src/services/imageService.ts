import { ImageOverview } from "@/types/image";

export async function fetchImages(cluster: string, namespace: string): Promise<ImageOverview[]> {
  const params = new URLSearchParams();
  if (cluster && cluster !== "all") params.append("cluster", cluster);
  if (namespace && namespace !== "all") params.append("namespace", namespace);

  const url = `/api/images?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export type Image = {
  cluster: string;
  description: string;
  fixedVersion: string;
  installedVersion: string;
  lastModifiedDate: string;
  links: string[];
  namespace: string;
  packagePURL: string;
  pod_id: string;
  primaryLink: string;
  publishedDate: string;
  resource: string;
  score: number;
  severity: string;
  target: string;
  title: string;
  vulnerabilityID: string;
  uid: string;
};
