"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExposedSecretReport } from "@/services/exposedSecretService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/custom/card";
import { Button } from "@/components/custom/button";

async function fetchExposedSecretById(
  uid: string
): Promise<ExposedSecretReport | null> {
  try {
    const res = await fetch(`/api/exposedsecrets/${uid}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function ExposedSecretDetailPage() {
  const params = useParams();
  const { uid } = params;
  const [secret, setSecret] = useState<ExposedSecretReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    fetchExposedSecretById(uid as string)
      .then((data) => {
        setSecret(data);
        setError(null);
      })
      .catch(() => setError("Failed to fetch exposed secret"))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading)
    return (
      <div className="p-8 h-full bg-background text-white">
        Loading exposed secret details...
      </div>
    );
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!secret)
    return <div className="p-8 text-gray-600">Exposed secret not found</div>;

  const severityColor = {
    LOW: "bg-green-600 text-white",
    MEDIUM: "bg-yellow-500 text-white",
    HIGH: "bg-[#e11d48] text-white",
    CRITICAL: "bg-red-700 text-white",
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-red-600 text-white";
    if (confidence >= 0.6) return "bg-orange-600 text-white";
    if (confidence >= 0.4) return "bg-yellow-600 text-white";
    return "bg-gray-600 text-white";
  };

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/exposed-secrets">
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                ← Back to Exposed Secrets
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{secret.title}</h1>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Secret Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Title</span>
                    <p className="text-white font-semibold">{secret.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Secret Type</span>
                    <span className="inline-block px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                      {secret.secretType || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Severity</span>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        severityColor[
                          secret.severity as keyof typeof severityColor
                        ] || "bg-gray-500 text-white"
                      }`}
                    >
                      {secret.severity || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Confidence</span>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${confidenceColor(
                        secret.confidence
                      )}`}
                    >
                      {Math.round(secret.confidence * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Rule ID</span>
                    <p className="text-white font-mono">{secret.ruleID}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Category</span>
                    <p className="text-white">{secret.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{secret.description}</p>
              </CardContent>
            </Card>

            {/* Secret Value (Masked) */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"
                      fill="currentColor"
                    />
                  </svg>
                  Exposed Secret (Masked)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                  <code className="text-red-400 break-all">
                    {secret.secretValue
                      ? secret.secretValue.replace(/./g, "•")
                      : "••••••••"}
                  </code>
                  <p className="text-red-300 text-sm mt-2">
                    ⚠️ This secret has been masked for security reasons
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* File Location */}
            {(secret.filePath || secret.lineNumber) && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {secret.filePath && (
                    <div>
                      <span className="text-sm text-gray-400">File Path</span>
                      <p className="text-white font-mono">{secret.filePath}</p>
                    </div>
                  )}
                  {secret.lineNumber && (
                    <div>
                      <span className="text-sm text-gray-400">Line Number</span>
                      <p className="text-white font-mono">
                        {secret.lineNumber}
                      </p>
                    </div>
                  )}
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
                  <p className="text-white">{secret.resource}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Namespace</span>
                  <p className="text-white">{secret.namespace}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Cluster</span>
                  <p className="text-white">{secret.cluster}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Pod ID</span>
                  <p className="text-white font-mono">{secret.pod_id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Target</span>
                  <p className="text-white">{secret.target}</p>
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
                  <span className="text-sm text-gray-400">UID</span>
                  <p className="text-white font-mono text-xs break-all">
                    {secret.uid}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Last Modified</span>
                  <p className="text-white">
                    {new Date(secret.lastModifiedDate).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Remediation Advice */}
            <Card className="bg-yellow-900/20 border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-yellow-400">Remediation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-yellow-200">
                  <p className="text-sm">1. Immediately rotate this secret</p>
                  <p className="text-sm">2. Remove from source code</p>
                  <p className="text-sm">3. Use secure secret management</p>
                  <p className="text-sm">4. Review commit history</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
