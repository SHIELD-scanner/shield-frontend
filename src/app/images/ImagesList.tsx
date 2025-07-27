"use client";
import React, { useEffect, useState } from "react";
import {
  fetchImages,
  Image,
} from "@/services/imageService";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

const severityColor = {
  LOW: "bg-green-600 text-white",
  MEDIUM: "bg-yellow-500 text-white",
  HIGH: "bg-[#e11d48] text-white",
};

const statusColor = {
  Open: "bg-[#7c2329] text-white",
  Acknowledged: "bg-blue-700 text-white",
  RIF: "bg-[#3b2c1a] text-white",
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

export default function ImagesList() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

  // Fetch vulnerabilities using the current cookie value
  const fetchAndSetImages = (cluster: string, namespace: string) => {
    setLoading(true);
    fetchImages(cluster, namespace)
      .then((data) => {
        setImages(data);
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let prev = getNamespaceCookie();
    fetchAndSetImages(prev.cluster, prev.namespace);
    const interval = setInterval(() => {
      const curr = getNamespaceCookie();
      if (curr.cluster !== prev.cluster || curr.namespace !== prev.namespace) {
        fetchAndSetImages(curr.cluster, curr.namespace);
        prev = curr;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let filteredImages = images;
  if (search.trim()) {
    filteredImages = images.filter((img) =>
      img.vulnerabilityID.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  let tableBody: React.ReactNode;
  if (loading) {
    tableBody = (
      <tr>
        <td colSpan={7} className="text-center py-8 text-gray-400">
          {t("vulnerabilities.loadingTable")}
        </td>
      </tr>
    );
  } else if (filteredImages.length === 0) {
    tableBody = (
      <tr>
        <td colSpan={7} className="text-center py-8 text-gray-400">
          {t("vulnerabilities.noVulnerabilities")}
        </td>
      </tr>
    );
  } else {
    tableBody = filteredImages.map((img, index) => {
      const status = "Open";
      const uniqueKey = `${img.uid || "no-uid"}-${img.vulnerabilityID || "no-id"}-${img.resource || "no-resource"}-${img.namespace || "no-ns"}-${index}`;
      return (
        <tr key={uniqueKey} className="hover:bg-[#232b3b] transition">
          <td className="px-6 py-4 flex flex-col gap-1 min-w-[180px]">
            <span className="font-semibold text-base flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-[#2e3a54] rounded-full flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#e11d48" />
                </svg>
              </span>
              <a
                href={`/images/${img.uid}#${img.vulnerabilityID}`}
                className="text-blue-400 hover:underline"
                title={t("vulnerabilities.viewDetails")}
              >
                {img.vulnerabilityID}
              </a>
            </span>
            <span className="text-xs text-gray-400">{img.target}</span>
          </td>
          <td className="px-6 py-4 min-w-[140px]">
            <div className="font-medium">{img.resource}</div>
            <div className="text-xs text-gray-400">{img.namespace}</div>
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                severityColor[img.severity as keyof typeof severityColor] ||
                "bg-gray-500 text-white"
              }`}
            >
              {img.severity}
            </span>
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                statusColor[status as keyof typeof statusColor] ||
                "bg-gray-700 text-white"
              }`}
            >
              {status}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-red-400 font-mono">
              {img.installedVersion}
            </span>
            {img.fixedVersion && (
              <span className="text-green-400 font-mono ml-2">
                &rarr; {img.fixedVersion}
              </span>
            )}
          </td>
          <td className="px-6 py-4 font-mono text-center">
            {img.score?.toFixed(1) ?? "-"}
          </td>
          <td className="px-6 py-4 flex gap-2 items-center">
            <a
              href={img.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
              title={t("vulnerabilities.viewDetails")}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 5v14m7-7H5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
            <a
              href={`/images/${img.uid}#${img.vulnerabilityID}`}
              className="text-blue-400 hover:underline"
              title={t("vulnerabilities.viewDetails")}
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
        <h2 className="text-xl font-bold">Images</h2>
        <input
          type="text"
          placeholder={t("vulnerabilities.searchPlaceholder")}
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
                {t("vulnerabilities.table.vulnerability")}
              </th>
              <th className="px-6 py-3 text-left">
                {t("vulnerabilities.table.resource")}
              </th>
              <th className="px-6 py-3 text-left">
                {t("vulnerabilities.table.severity")}
              </th>
              <th className="px-6 py-3 text-left">
                {t("vulnerabilities.table.status")}
              </th>
              <th className="px-6 py-3 text-left">
                {t("vulnerabilities.table.version")}
              </th>
              <th className="px-6 py-3 text-left">
                {t("vulnerabilities.table.cvss")}
              </th>
              <th className="px-6 py-3 text-left">
                {t("vulnerabilities.table.actions")}
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
