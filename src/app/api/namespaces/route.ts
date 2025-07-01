// src/app/api/namespaces/route.ts

export async function GET() {
  const res = await fetch("http://localhost:8000/namespaces/");
  if (!res.ok) {
    return new Response("Failed to fetch namespaces", { status: 500 });
  }
  const data = await res.json();
  return Response.json(data);
}
