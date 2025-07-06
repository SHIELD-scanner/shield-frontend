import { useLanguage } from "@/lib/i18n";

export function DashboardTopbar() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between px-10 py-6  border-b border-[#d1d5db] shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">
          {t("dashboard.title")}
        </h1>
        <div className="text-xs text-[#a0aec0]">{t("dashboard.subtitle")}</div>
      </div>
    </div>
  );
}
