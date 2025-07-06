import { useLanguage } from "@/lib/i18n";

export default function ConfigAuditPage() {
  const { t } = useLanguage();
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">{t("configAudit.heading")}</h2>
      <p>{t("configAudit.description")}</p>
    </div>
  );
}
