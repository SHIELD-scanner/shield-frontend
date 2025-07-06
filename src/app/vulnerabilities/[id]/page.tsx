"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { VulnerabilityReport } from "@/services/vulnerabilityService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

async function fetchVulnerabilityById(
  id: string,
): Promise<VulnerabilityReport | null> {
  try {
    const res = await fetch(`/api/vulnerabilities/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function VulnerabilityDetailPage() {
  const { t } = useLanguage();
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

  if (loading)
    return (
      <div className="p-8 h-full bg-background text-white">
        {t("vulnerabilities.loading")}
      </div>
    );
  if (error)
    return <div className="p-8 text-red-600">{t("vulnerabilities.error")}</div>;
  if (!vuln) return <div className="p-8">{t("vulnerabilities.noData")}</div>;

  // Helper for badge color
  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Placeholder for status, as the model does not provide it
  const status = "OPEN";

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-2 md:px-0">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/vulnerabilities"
            className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium flex items-center gap-1"
          >
            <span className="text-2xl">←</span> {t("vulnerabilities.back")}
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {vuln.vulnerabilityID}
            </h1>
            <h2 className="text-xl text-muted-foreground">
              {vuln.title || t("vulnerabilities.noTitle")}
            </h2>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityColor(
                vuln.severity,
              )}`}
            >
              {vuln.severity || "-"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === "OPEN"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Overview */}
          <Card className="col-span-2 bg-card border-none">
            <CardHeader>
              <CardTitle>{t("vulnerabilities.overview")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm text-muted-foreground font-semibold mb-1">
                  {t("vulnerabilities.description")}
                </div>
                <div className="text-base text-foreground mb-2">
                  {vuln.description || "-"}
                </div>
                {vuln.links && vuln.links.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground font-semibold mb-1">
                      {t("vulnerabilities.references")}
                    </div>
                    <ul className="list-disc ml-6">
                      {vuln.links.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            className="text-blue-600 dark:text-blue-400 underline"
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
            </CardContent>
          </Card>
          {/* Actions */}
          <div className="flex flex-col gap-6">
            <Card className="bg-card border-none">
              <CardHeader>
                <CardTitle>{t("vulnerabilities.actions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  {t("vulnerabilities.acknowledge")}
                </Button>
              </CardContent>
            </Card>
            {/* Resource Info */}
            <Card className="bg-card border-none">
              <CardHeader>
                <CardTitle>{t("vulnerabilities.resourceInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="text-muted-foreground">
                    {t("vulnerabilities.resourceName")}
                  </span>
                  <div className="text-foreground font-medium">
                    {vuln.resource || "-"}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-muted-foreground">
                    {t("vulnerabilities.namespace")}
                  </span>
                  <div className="text-foreground font-medium">
                    {vuln.namespace || "-"}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-muted-foreground">
                    {t("vulnerabilities.resourceKind")}
                  </span>
                  <div className="text-foreground font-medium">Secret</div>
                </div>
                <div className="mb-2">
                  <span className="text-muted-foreground">
                    {t("vulnerabilities.detectedAt")}
                  </span>
                  <div className="text-foreground font-medium">
                    {vuln.lastModifiedDate
                      ? new Date(vuln.lastModifiedDate).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Package Info */}
        <div className="mt-6">
          <Card className="bg-card border-none">
            <CardHeader>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <Image
                    src="/cube.svg"
                    alt="Dark mode"
                    width={16}
                    height={16}
                    className="inline w-4 h-4"
                    style={{ filter: "invert(1) brightness(2)" }}
                  />
                  <span>{t("vulnerabilities.packageInfo")}</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-muted-foreground">
                    {t("vulnerabilities.packageName")}
                  </div>
                  <div className="text-foreground font-medium">
                    {vuln.target || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    {t("vulnerabilities.installedVersion")}
                  </div>
                  <div className="text-foreground font-medium">
                    {vuln.installedVersion || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    {t("vulnerabilities.cvssScore")}
                  </div>
                  <div className="text-foreground font-medium">
                    {vuln.score ? `${vuln.score}/10.0` : "-"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
