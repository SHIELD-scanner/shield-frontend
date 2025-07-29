"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "../../components/dashboard/LanguageSwitcher";
import { fetchNamespaces } from "@/services/namespaceService";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/custom/ThemeToggle";

interface NamespaceDropdownProps {
  value: string;
  onChange: (v: string) => void;
  namespaceOptions: { cluster: string; name: string }[];
}

function NamespaceDropdown(props: Readonly<NamespaceDropdownProps>) {
  const { value, onChange, namespaceOptions } = props;
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const options = namespaceOptions.map((ns) => `${ns.cluster}/${ns.name}`);
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
        {t("sidebar.namespace")}
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
        placeholder={t("sidebar.namespacePlaceholder")}
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
              {t("sidebar.all")}
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

export default function Page() {
  const pathname = usePathname();
  const [namespaceList, setNamespaceList] = useState<
    { cluster: string; name: string }[]
  >([]);
  // Always initialize to 'all' for SSR/client parity
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const { t } = useLanguage();

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
          setNamespaceList(
            data.map((name: string) => ({ cluster: "default", name }))
          );
        } else if (
          Array.isArray(data) &&
          data.length &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          Object.hasOwn(data[0], "cluster") &&
          Object.hasOwn(data[0], "name") &&
          data.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              "cluster" in item &&
              "name" in item
          )
        ) {
          setNamespaceList(data as { cluster: string; name: string }[]);
        } else {
          setNamespaceList([]);
        }
      })
      .catch(() => setNamespaceList([]));
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <LanguageSwitcher />
              <NamespaceDropdown
                value={selectedNamespace}
                onChange={setSelectedNamespace}
                namespaceOptions={namespaceList}
              />
                      <ThemeToggle />
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
