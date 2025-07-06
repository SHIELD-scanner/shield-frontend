import { useLanguage } from "@/lib/i18n";

export default function RBACAssessmentPage() {
  const { t } = useLanguage();
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">{t("rbacAssessment.heading")}</h2>
      <p>{t("rbacAssessment.description")}</p>
    </div>
  );
}
