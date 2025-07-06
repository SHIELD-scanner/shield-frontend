import { useLanguage } from "@/lib/i18n";

export function DashboardTopbar() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between px-10 py-6 border-b border-gray-800/50 bg-[#0a0e16]">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("dashboard.title")}
        </h1>
        <div className="text-sm text-gray-400">{t("dashboard.subtitle")}</div>
      </div>
    </div>
  );
}
