"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import en from "./i18n/en.json";
import nl from "./i18n/nl.json";

const translations: Record<string, Record<string, string>> = { en, nl };

const defaultLang = "en";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const regex = new RegExp("(^| )" + name + "=([^;]+)");
  const match = regex.exec(document.cookie);
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${expires}; path=/`;
}

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: defaultLang,
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>(defaultLang);

  useEffect(() => {
    const cookieLang = getCookie("lang");
    if (cookieLang && translations[cookieLang]) {
      setLangState(cookieLang);
    }
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    setCookie("lang", newLang);
  };

  const t = (key: string) => {
    return translations[lang]?.[key] || translations[defaultLang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function availableLanguages() {
  return Object.keys(translations);
}
