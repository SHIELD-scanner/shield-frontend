import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";

export function StatCard({
  title,
  value,
  subtext,
  valueClass = "",
  subtextClass = "",
}: Readonly<{
  title: string;
  value: string | number;
  subtext?: string;
  valueClass?: string;
  subtextClass?: string;
}>) {
  const { t } = useLanguage();
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>{t(title)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
        {subtext && (
          <div className={`text-xs mt-1 ${subtextClass}`}>{t(subtext)}</div>
        )}
      </CardContent>
    </Card>
  );
}
