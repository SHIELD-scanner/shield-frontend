"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";

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
