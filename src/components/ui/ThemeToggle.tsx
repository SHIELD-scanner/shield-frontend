"use client";
import * as React from "react";

export function ThemeToggle() {
  // SSR-safe theme detection
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  // Helper to get cookie value
  function getCookie(name: string) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
  }

  // Helper to set cookie
  function setCookie(name: string, value: string, days = 365) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    const saved = getCookie("theme");
    let dark = false;
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
      dark = true;
    } else {
      root.classList.remove("dark");
    }
    setIsDark(dark);
  }, [mounted]);

  if (!mounted) return null;

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setCookie("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setCookie("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#232b3b] hover:bg-[#2e3a54] text-white dark:text-gray-200 text-sm font-medium w-full justify-center"
    >
      {isDark ? (
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sun.svg"
            alt="Light mode"
            className="inline w-4 h-4"
            style={{ filter: "invert(1) brightness(2)" }}
          />
        </span>
      ) : (
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moon.svg"
            alt="Dark mode"
            className="inline w-4 h-4"
            style={{ filter: "invert(1) brightness(2)" }}
          />
        </span>
      )}
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
