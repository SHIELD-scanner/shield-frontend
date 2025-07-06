import { useLanguage } from "@/lib/i18n";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TrendsCard({ children }: Readonly<{ children?: ReactNode }>) {
  const { t } = useLanguage();
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle>{t("trends.title")}</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-[#181f2a] text-white rounded-lg"
          >
            {t("trends.7d")}
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-[#2563eb] text-white rounded-lg"
          >
            {t("trends.30d")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-[#181f2a] text-white rounded-lg"
          >
            {t("trends.90d")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-56">
        {children ?? (
          <div className="text-gray-400 text-center">
            {t("trends.chartPlaceholder")}
            <br />
            {t("trends.chartImplementation")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CriticalVulnCard({
  children,
}: Readonly<{ children?: ReactNode }>) {
  const { t } = useLanguage();
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>{t("criticalVuln.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-56">
        {children ?? (
          <>
            <div className="text-gray-400 mb-4">
              {t("criticalVuln.noCritical")}
            </div>
            <Button
              variant="secondary"
              className="bg-[#232b3b] text-white border border-[#232b3b] rounded-lg"
            >
              {t("criticalVuln.viewAll")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
