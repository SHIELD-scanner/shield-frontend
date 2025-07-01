"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { VulnerabilityReport } from "@/services/vulnerabilityService";

async function fetchVulnerabilityById(
  id: string
): Promise<VulnerabilityReport | null> {
  try {
    const res = await fetch(`http://localhost:8000/vulnerabilities/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const { id } = params;
  const [vuln, setVuln] = useState<VulnerabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVulnerabilityById(id as string)
      .then((data) => {
        setVuln(data);
        setError(null);
      })
      .catch(() => setError("Failed to fetch vulnerability"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!vuln) return <div className="p-8">No data found.</div>;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link href="/vulnerabilities" className="text-blue-600 hover:underline">
        ← Back to Vulnerabilities
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">Vulnerability Detail</h1>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <div className="mb-2">
          <span className="font-semibold">ID:</span> {vuln.vulnerabilityID}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Title:</span> {vuln.title}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Severity:</span> {vuln.severity}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Score:</span> {vuln.score}
        </div>
        {/* <div className="mb-2"><span className="font-semibold">Status:</span> {vuln.status || "-"}</div> */}
        <div className="mb-2">
          <span className="font-semibold">Description:</span> {vuln.description}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Cluster:</span> {vuln.cluster}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Namespace:</span> {vuln.namespace}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Resource:</span> {vuln.resource}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Target:</span> {vuln.target}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Installed Version:</span>{" "}
          {vuln.installedVersion}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Fixed Version:</span>{" "}
          {vuln.fixedVersion}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Published Date:</span>{" "}
          {vuln.publishedDate}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Last Modified:</span>{" "}
          {vuln.lastModifiedDate}
        </div>
        {vuln.links && vuln.links.length > 0 && (
          <div className="mb-2">
            <span className="font-semibold">Links:</span>
            <ul className="list-disc ml-6">
              {vuln.links.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
