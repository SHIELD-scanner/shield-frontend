import * as React from "react";
import { useLanguage, availableLanguages } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const langs = availableLanguages();

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-300 mb-1 tracking-wide uppercase">
        {t("language")}
      </label>
      <select
        className="w-full rounded-lg px-3 py-2 text-sm bg-[#232b3b] text-white border border-[#2e3a54] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        {langs.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </div>
  );
}
