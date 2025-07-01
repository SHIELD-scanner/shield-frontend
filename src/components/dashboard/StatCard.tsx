import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  subtext,
  valueClass = "",
  subtextClass = "",
}: {
  title: string;
  value: string | number;
  subtext?: string;
  valueClass?: string;
  subtextClass?: string;
}) {
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
        {subtext && (
          <div className={`text-xs mt-1 ${subtextClass}`}>{subtext}</div>
        )}
      </CardContent>
    </Card>
  );
}
