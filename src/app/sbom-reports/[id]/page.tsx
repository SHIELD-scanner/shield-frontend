"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SbomReport } from "@/services/sbomService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function fetchSbomById(id: string): Promise<SbomReport | null> {
  try {
    const res = await fetch(`/api/sbom/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function SbomDetailPage() {
  const params = useParams();
  const { id } = params;
  const [sbom, setSbom] = useState<SbomReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSbomById(id as string)
      .then((data) => {
        setSbom(data);
        setError(null);
      })
      .catch(() => setError("Failed to fetch SBOM"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-8 h-full bg-background text-white">
        Loading SBOM details...
      </div>
    );
  if (error)
    return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!sbom)
    return <div className="p-8 text-gray-600">SBOM not found</div>;

  const packageTypeColor = {
    npm: "bg-red-600 text-white",
    pip: "bg-blue-600 text-white",
    maven: "bg-orange-600 text-white",
    nuget: "bg-purple-600 text-white",
    composer: "bg-yellow-600 text-white",
    gem: "bg-red-500 text-white",
    go: "bg-cyan-600 text-white",
    cargo: "bg-orange-500 text-white",
  };

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/sbom-reports">
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                ← Back to SBOM Reports
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{sbom.component}</h1>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Component Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Component</span>
                    <p className="text-white font-mono">{sbom.component}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Version</span>
                    <p className="text-green-400 font-mono">{sbom.version}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Package Type</span>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        packageTypeColor[sbom.packageType as keyof typeof packageTypeColor] ||
                        "bg-gray-500 text-white"
                      }`}
                    >
                      {sbom.packageType}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Target</span>
                    <p className="text-white">{sbom.target}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package URL */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Package URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-400 break-all">{sbom.packagePURL}</code>
                </div>
              </CardContent>
            </Card>

            {/* Licenses */}
            {sbom.licenses && sbom.licenses.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {sbom.licenses.map((license) => (
                      <span
                        key={`${sbom.hash}-license-${license}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                      >
                        {license}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dependencies */}
            {sbom.dependencies && sbom.dependencies.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sbom.dependencies.map((dependency) => (
                      <div
                        key={`${sbom.hash}-dep-${dependency}`}
                        className="bg-gray-900 p-3 rounded-lg"
                      >
                        <code className="text-green-400">{dependency}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Resource Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-400">Resource</span>
                  <p className="text-white">{sbom.resource}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Namespace</span>
                  <p className="text-white">{sbom.namespace}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Cluster</span>
                  <p className="text-white">{sbom.cluster}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Pod ID</span>
                  <p className="text-white font-mono">{sbom.pod_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-400">Hash</span>
                  <p className="text-white font-mono text-xs break-all">{sbom.hash}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Last Modified</span>
                  <p className="text-white">
                    {new Date(sbom.lastModifiedDate).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
