import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/custom/card";

export function RecentActivityCard() {
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="bg-[#2563eb] w-2 h-2 rounded-full mt-1"></div>
            <div>
              <div className="font-semibold">
                New vulnerability scan completed
              </div>
              <div className="text-xs text-gray-400">
                Found 0 vulnerabilities in production namespace
              </div>
              <div className="text-xs text-gray-500">2 minutes ago</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-[#e11d48] w-2 h-2 rounded-full mt-1"></div>
            <div>
              <div className="font-semibold">
                Critical vulnerability detected
              </div>
              <div className="text-xs text-gray-400">No action required</div>
              <div className="text-xs text-gray-500">2 minutes ago</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComplianceOverviewCard() {
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-[#181f2a] p-3 rounded-lg">
            <span className="text-[#34d399] font-bold">CIS Kubernetes</span>
            <div className="text-xs text-gray-400">v1.6.1</div>
          </div>
          <div className="text-3xl font-bold text-[#34d399]">92%</div>
          <div className="text-xs text-[#34d399]">Passing</div>
        </div>
      </CardContent>
    </Card>
  );
}
