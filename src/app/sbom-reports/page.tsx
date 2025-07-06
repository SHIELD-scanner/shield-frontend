import { useLanguage } from "@/lib/i18n";

export default function SBOMReportsPage() {
  const { t } = useLanguage();
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">{t("sbomReports.heading")}</h2>
      <p>{t("sbomReports.description")}</p>
    </div>
  );
}
