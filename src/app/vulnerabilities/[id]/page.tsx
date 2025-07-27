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
  id: string
): Promise<VulnerabilityReport[] | null> {
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
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVulnerabilityById(id as string)
      .then((data) => {
        setVulnerabilities(data || []);
        setError(null);
      })
      .catch(() => setError("Failed to fetch vulnerability"))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-scroll to anchor location after page loads
  useEffect(() => {
    if (!loading && vulnerabilities.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    }
  }, [loading, vulnerabilities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".quick-nav-dropdown")) {
        setIsNavOpen(false);
      }
    };

    if (isNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNavOpen]);

  if (loading)
    return (
      <div className="p-8 h-full bg-background text-white">
        {t("vulnerabilities.loading")}
      </div>
    );
  if (error)
    return <div className="p-8 text-red-600">{t("vulnerabilities.error")}</div>;
  if (!vulnerabilities.length)
    return <div className="p-8">{t("vulnerabilities.noData")}</div>;

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

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Vulnerability Report
          </h1>
          <p className="text-muted-foreground">
            {vulnerabilities.length}{" "}
            {vulnerabilities.length === 1 ? "vulnerability" : "vulnerabilities"}{" "}
            found
          </p>
        </div>

        {/* Quick Navigation Dropdown */}
        {vulnerabilities.length > 1 && (
          <div className="fixed top-20 right-4 z-50">
            <div className="relative quick-nav-dropdown">
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
                title="Quick Navigation"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {isNavOpen && (
                <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[250px] max-h-[400px] overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Quick Navigation
                    </h3>
                  </div>
                  <div className="p-2">
                    {vulnerabilities.map((vuln, index) => (
                      <button
                        key={`nav-${index}-${vuln.vulnerabilityID}-${
                          vuln.uid || "no-uid"
                        }-${vuln.resource || "no-resource"}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsNavOpen(false);
                          const element = document.getElementById(
                            vuln.vulnerabilityID
                          );
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }}
                        className="w-full text-left block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="font-medium">
                          {vuln.vulnerabilityID}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {vuln.resource} • {vuln.namespace}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display each vulnerability */}
        {vulnerabilities.map((vuln, index) => (
          <div
            key={`vuln-${index}-${vuln.vulnerabilityID}-${
              vuln.uid || "no-uid"
            }-${vuln.resource || "no-resource"}`}
            id={vuln.vulnerabilityID}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {vuln.vulnerabilityID}
                </h2>
                <h3 className="text-lg text-muted-foreground">
                  {vuln.title || t("vulnerabilities.noTitle")}
                </h3>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityColor(
                    vuln.severity
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          {vuln.links.map((link: string, linkIndex: number) => (
                            <li key={`link-${linkIndex}-${link}`}>
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

              {/* Actions & Resource Info */}
              <div className="flex flex-col gap-4">
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
            <div className="mt-4">
              <Card className="bg-card border-none">
                <CardHeader>
                  <CardTitle>
                    <span className="inline-flex items-center gap-2">
                      <Image
                        src="/cube.svg"
                        alt="Package"
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

            {/* Separator line between vulnerabilities */}
            {index < vulnerabilities.length - 1 && (
              <hr className="mt-8 border-border" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
