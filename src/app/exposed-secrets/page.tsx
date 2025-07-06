"use client";
import { useLanguage } from "@/lib/i18n";

export default function ExposedSecretsPage() {
  const { t } = useLanguage();
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">{t("exposedSecrets.heading")}</h2>
      <p>{t("exposedSecrets.description")}</p>
    </div>
  );
}
