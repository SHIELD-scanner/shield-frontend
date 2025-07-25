"use client";
import React, { useEffect, useState } from "react";
import {
  fetchSbom,
  SbomReport,
} from "@/services/sbomService";
import { Card } from "@/components/ui/card";

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

function getNamespaceCookie() {
  if (typeof document === "undefined")
    return { cluster: "all", namespace: "all" };
  const regex = /(?:^|; )namespace=([^;]*)/;
  const match = regex.exec(document.cookie);
  const nsValue = match ? decodeURIComponent(match[1]) : "all/all";
  let cluster = "all";
  let namespace = "all";
  if (nsValue.includes("/")) {
    [cluster, namespace] = nsValue.split("/");
    cluster = cluster || "all";
    namespace = namespace || "all";
  } else if (nsValue) {
    namespace = nsValue;
  }
  return { cluster, namespace };
}

export default function SbomList() {
  const [sbomReports, setSbomReports] = useState<SbomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch SBOM using the current cookie value
  const fetchAndSetSbom = (cluster: string, namespace: string) => {
    setLoading(true);
    fetchSbom(cluster, namespace)
      .then((data) => {
        console.log("SBOM response:", data); // Debug log
        setSbomReports(data);
      })
      .catch(() => setSbomReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let prev = getNamespaceCookie();
    fetchAndSetSbom(prev.cluster, prev.namespace);
    const interval = setInterval(() => {
      const curr = getNamespaceCookie();
      if (curr.cluster !== prev.cluster || curr.namespace !== prev.namespace) {
        fetchAndSetSbom(curr.cluster, curr.namespace);
        prev = curr;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let filteredSbomReports = sbomReports;
  if (search.trim()) {
    filteredSbomReports = sbomReports.filter((sbom) =>
      sbom.component.toLowerCase().includes(search.trim().toLowerCase()) ||
      sbom.packagePURL.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  let tableBody: React.ReactNode;
  if (loading) {
    tableBody = (
      <tr>
        <td colSpan={7} className="text-center py-8 text-gray-400">
          Loading SBOM reports...
        </td>
      </tr>
    );
  } else if (filteredSbomReports.length === 0) {
    tableBody = (
      <tr>
        <td colSpan={7} className="text-center py-8 text-gray-400">
          No SBOM reports found
        </td>
      </tr>
    );
  } else {
    tableBody = filteredSbomReports.map((sbom) => {
      return (
        <tr key={sbom.uid} className="hover:bg-[#232b3b] transition">
          <td className="px-6 py-4 flex flex-col gap-1 min-w-[180px]">
            <span className="font-semibold text-base flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-[#2e3a54] rounded-full flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="#3b82f6" />
                </svg>
              </span>
              {/* Link to detail page using uid */}
              <a
                href={`/sbom-reports/${sbom.uid}`}
                className="text-blue-400 hover:underline"
                title="View SBOM details"
              >
                {sbom.component}
              </a>
            </span>
            <span className="text-xs text-gray-400">{sbom.target}</span>
          </td>
          <td className="px-6 py-4 min-w-[140px]">
            <div className="font-medium">{sbom.resource}</div>
            <div className="text-xs text-gray-400">{sbom.namespace}</div>
          </td>
          <td className="px-6 py-4">
            <span className="font-mono text-green-400">
              {sbom.version}
            </span>
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                packageTypeColor[sbom.packageType as keyof typeof packageTypeColor] ||
                "bg-gray-500 text-white"
              }`}
            >
              {sbom.packageType}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="text-xs text-gray-400 max-w-xs truncate">
              {sbom.packagePURL}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-wrap gap-1">
              {sbom.licenses?.slice(0, 2).map((license) => (
                <span
                  key={`${sbom.hash}-${license}`}
                  className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs"
                >
                  {license}
                </span>
              ))}
              {sbom.licenses?.length > 2 && (
                <span className="px-2 py-1 bg-gray-500 text-white rounded-full text-xs">
                  +{sbom.licenses.length - 2}
                </span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 flex gap-2 items-center">
            <a
              href={`/sbom-reports/${sbom.uid}`}
              className="text-blue-400 hover:underline"
              title="View SBOM details"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="3"
                  y="3"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </a>
          </td>
        </tr>
      );
    });
  }

  return (
    <Card className="bg-white dark:bg-[#181f2a] text-gray-900 dark:text-white p-0 rounded-2xl shadow-lg border-0 relative h-full transition-colors">
      {loading && (
        <div className="absolute inset-0 bg-[#181f2a]/80 flex items-center justify-center z-20">
          <svg
            className="animate-spin h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-xl font-bold">
          SBOM Reports
        </h2>
        <input
          type="text"
          placeholder="Search components or packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-100 dark:bg-[#232b3b] text-gray-900 dark:text-white rounded-lg px-3 py-2 border border-gray-300 dark:border-[#2e3a54] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-72 transition-colors"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm mt-2">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#232b3b] text-gray-700 dark:text-gray-300 uppercase text-xs transition-colors">
              <th className="px-6 py-3 text-left">
                Component
              </th>
              <th className="px-6 py-3 text-left">
                Resource
              </th>
              <th className="px-6 py-3 text-left">
                Version
              </th>
              <th className="px-6 py-3 text-left">
                Type
              </th>
              <th className="px-6 py-3 text-left">
                Package URL
              </th>
              <th className="px-6 py-3 text-left">
                Licenses
              </th>
              <th className="px-6 py-3 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#181f2a] divide-y divide-gray-200 dark:divide-[#232b3b] transition-colors">
            {tableBody}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
