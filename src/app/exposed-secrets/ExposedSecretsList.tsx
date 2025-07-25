"use client";
import React, { useEffect, useState } from "react";
import {
  fetchExposedSecrets,
  ExposedSecretReport,
} from "@/services/exposedSecretService";
import { Card } from "@/components/ui/card";

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

export default function ExposedSecretsList() {
  const [exposedSecrets, setExposedSecrets] = useState<ExposedSecretReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch exposed secrets using the current cookie value
  const fetchAndSetSecrets = (cluster: string, namespace: string) => {
    setLoading(true);
    fetchExposedSecrets(cluster, namespace)
      .then((data) => {
        setExposedSecrets(data);
      })
      .catch(() => setExposedSecrets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let prev = getNamespaceCookie();
    fetchAndSetSecrets(prev.cluster, prev.namespace);
    const interval = setInterval(() => {
      const curr = getNamespaceCookie();
      if (curr.cluster !== prev.cluster || curr.namespace !== prev.namespace) {
        fetchAndSetSecrets(curr.cluster, curr.namespace);
        prev = curr;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let filteredSecrets = exposedSecrets;
  if (search.trim()) {
    filteredSecrets = exposedSecrets.filter((secret) =>
      secret.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      secret.secretType.toLowerCase().includes(search.trim().toLowerCase()) ||
      secret.ruleID.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  let tableBody: React.ReactNode;
  if (loading) {
    tableBody = (
      <tr>
        <td colSpan={7} className="text-center py-8 text-gray-400">
          Loading exposed secrets...
        </td>
      </tr>
    );
  } else if (filteredSecrets.length === 0) {
    tableBody = (
      <tr>
        <td colSpan={7} className="text-center py-8 text-gray-400">
          No exposed secrets found
        </td>
      </tr>
    );
  } else {
    tableBody = filteredSecrets.map((secret) => {
      return (
        <tr key={secret.uid} className="hover:bg-[#232b3b] transition">
          <td className="px-6 py-4 flex flex-col gap-1 min-w-[180px]">
            <span className="font-semibold text-base flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-[#2e3a54] rounded-full flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"
                    fill="#e11d48"
                  />
                </svg>
              </span>
              {/* Link to detail page using uid */}
              <a
                href={`/exposed-secrets/${secret.uid}`}
                className="text-blue-400 hover:underline"
                title="View secret details"
              >
                {secret.title}
              </a>
            </span>
            <span className="text-xs text-gray-400">{secret.target}</span>
          </td>
          <td className="px-6 py-4 min-w-[140px]">
            <div className="font-medium">{secret.resource}</div>
            <div className="text-xs text-gray-400">{secret.namespace}</div>
          </td>
          <td className="px-6 py-4">
            <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
              {secret.secretType}
            </span>
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                severityColor[secret.severity as keyof typeof severityColor] ||
                "bg-gray-500 text-white"
              }`}
            >
              {secret.severity}
            </span>
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${confidenceColor(
                secret.confidence
              )}`}
            >
              {Math.round(secret.confidence * 100)}%
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="font-mono text-xs text-gray-400">
              {secret.ruleID}
            </span>
          </td>
          <td className="px-6 py-4 flex gap-2 items-center">
            <a
              href={`/exposed-secrets/${secret.uid}`}
              className="text-blue-400 hover:underline"
              title="View secret details"
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
          Exposed Secrets
        </h2>
        <input
          type="text"
          placeholder="Search secrets..."
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
                Secret
              </th>
              <th className="px-6 py-3 text-left">
                Resource
              </th>
              <th className="px-6 py-3 text-left">
                Type
              </th>
              <th className="px-6 py-3 text-left">
                Severity
              </th>
              <th className="px-6 py-3 text-left">
                Confidence
              </th>
              <th className="px-6 py-3 text-left">
                Rule ID
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
