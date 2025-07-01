"use client";

import React, { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "./nav-data";
import { fetchNamespaces } from "@/services/namespaceService";

// NamespaceDropdown component for reuse and separation
function NamespaceDropdown({
  value,
  onChange,
  namespaces,
}: {
  value: string;
  onChange: (v: string) => void;
  namespaces: { cluster: string; name: string }[];
}) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const options = namespaces.map((ns) => `${ns.cluster}/${ns.name}`);
  const filtered =
    inputValue === "all"
      ? options
      : options.filter((opt) =>
          opt.toLowerCase().includes(inputValue.toLowerCase())
        );

  const handleSelect = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setShowDropdown(false);
  };

  return (
    <div className="mb-6 relative">
      <label
        htmlFor="namespace-autocomplete"
        className="block text-xs font-semibold text-gray-300 mb-2 tracking-wide uppercase"
      >
        Namespace
      </label>
      <input
        id="namespace-autocomplete"
        ref={inputRef}
        className="w-full rounded-lg px-3 py-2 text-sm bg-[#232b3b] text-white border border-[#2e3a54] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="off"
        placeholder="Type to search..."
      />
      {showDropdown && (
        <ul className="absolute z-10 w-full bg-[#232b3b] border border-[#2e3a54] rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
          <li className="px-3 py-2">
            <button
              type="button"
              className={`w-full text-left cursor-pointer bg-transparent border-0 outline-none hover:bg-[#2e3a54] px-0 py-0 ${
                inputValue === "all" ? "bg-[#2e3a54]" : ""
              }`}
              onMouseDown={() => handleSelect("all")}
            >
              All
            </button>
          </li>
          {filtered.map((opt) => (
            <li key={opt} className="px-3 py-2">
              <button
                type="button"
                className={`w-full text-left cursor-pointer bg-transparent border-0 outline-none hover:bg-[#2e3a54] px-0 py-0 ${
                  inputValue === opt ? "bg-[#2e3a54]" : ""
                }`}
                onMouseDown={() => handleSelect(opt)}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [namespaces, setNamespaces] = useState<
    { cluster: string; name: string }[]
  >([]);
  // Always initialize to 'all' for SSR/client parity
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");

  // Hydrate from sessionStorage after mount (client only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ns = sessionStorage.getItem("namespace");
      if (ns) setSelectedNamespace(ns);
    }
  }, []);

  useEffect(() => {
    fetchNamespaces()
      .then((data) => {
        if (Array.isArray(data) && data.length && typeof data[0] === "string") {
          setNamespaces(
            data.map((name: string) => ({ cluster: "default", name }))
          );
        } else if (
          Array.isArray(data) &&
          data.length &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          Object.hasOwn(data[0], "cluster") &&
          Object.hasOwn(data[0], "name")
        ) {
          setNamespaces(data);
        } else {
          setNamespaces([]);
        }
      })
      .catch(() => setNamespaces([]));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("namespace", selectedNamespace);
      document.cookie = `namespace=${encodeURIComponent(
        selectedNamespace
      )}; path=/`;
    }
  }, [selectedNamespace]);

  // Helper to build href with namespace
  const withNamespace = (href?: string) => {
    if (!href || href === "/") return href ?? "/";
    return `${href}?namespace=${selectedNamespace}`;
  };

  return (
    <aside className="w-64 bg-[#1a2232] text-white flex flex-col py-6 px-4 gap-4 border-r border-[#232b3b] min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-[#2e3a54] rounded-full w-8 h-8 flex items-center justify-center">
          <span className="font-bold text-lg">🛡️</span>
        </div>
        <span className="font-bold text-xl">Trivy Dashboard</span>
      </div>
      <NamespaceDropdown
        value={selectedNamespace}
        onChange={setSelectedNamespace}
        namespaces={namespaces}
      />
      <nav className="flex flex-col gap-2 text-base">
        {dashboardNav.map((item) => (
          <SidebarButton
            key={item.label}
            href={withNamespace(item.href)}
            badge={item.badge}
            badgeColor={item.badgeColor}
            active={
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href || "")
            }
          >
            {item.label}
          </SidebarButton>
        ))}
      </nav>
      <div className="mt-auto text-xs text-gray-400 pt-8 border-t border-[#232b3b]">
        <div className="flex items-center gap-2">
          <span className="bg-green-600 w-2 h-2 rounded-full inline-block" />{" "}
          production-cluster
        </div>
        <div>8 nodes • Last scan 2m ago</div>
      </div>
    </aside>
  );
}

function SidebarButton({
  children,
  badge,
  badgeColor,
  active,
  href,
}: {
  children: ReactNode;
  badge?: string;
  badgeColor?: string;
  active?: boolean;
  href?: string;
}) {
  return href ? (
    <Link
      href={href}
      className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg transition-colors no-underline ${
        active ? "bg-[#232b3b] font-semibold" : "hover:bg-[#232b3b]"
      }`}
    >
      <span>{children}</span>
      {badge && (
        <span
          className={`text-white text-xs px-2 py-0.5 rounded-full ml-2 ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </Link>
  ) : (
    <button
      className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg transition-colors ${
        active ? "bg-[#232b3b] font-semibold" : "hover:bg-[#232b3b]"
      }`}
    >
      <span>{children}</span>
      {badge && (
        <span
          className={`text-white text-xs px-2 py-0.5 rounded-full ml-2 ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
