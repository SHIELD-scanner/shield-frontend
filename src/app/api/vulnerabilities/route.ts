// src/app/api/vulnerabilities/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cluster = searchParams.get("cluster") ?? "";
  const namespace = searchParams.get("namespace") ?? "";
  let url = `http://localhost:8000/vulnerabilities/`;
  const params = [];
  if (cluster && cluster !== "all")
    params.push(`cluster=${encodeURIComponent(cluster)}`);
  if (namespace && namespace !== "all")
    params.push(`namespace=${encodeURIComponent(namespace)}`);
  if (params.length) url += `?${params.join("&")}`;
  const res = await fetch(url);
  if (!res.ok) {
    return new Response("Failed to fetch vulnerabilities", { status: 500 });
  }
  const data = await res.json();
  return Response.json(data);
}
