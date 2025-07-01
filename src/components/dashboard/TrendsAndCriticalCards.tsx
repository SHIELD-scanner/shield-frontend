import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TrendsCard({ children }: { children?: ReactNode }) {
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle>Vulnerability Trends</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-[#181f2a] text-white rounded-lg"
          >
            7D
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-[#2563eb] text-white rounded-lg"
          >
            30D
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-[#181f2a] text-white rounded-lg"
          >
            90D
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-56">
        {children ? (
          children
        ) : (
          <div className="text-gray-400 text-center">
            Vulnerability Trends Chart
            <br />
            Chart implementation with Recharts
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CriticalVulnCard({ children }: { children?: ReactNode }) {
  return (
    <Card className="bg-[#232b3b] text-white rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>Critical Vulnerabilities</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-56">
        {children ? (
          children
        ) : (
          <>
            <div className="text-gray-400 mb-4">
              No critical vulnerabilities found
            </div>
            <Button
              variant="secondary"
              className="bg-[#232b3b] text-white border border-[#232b3b] rounded-lg"
            >
              View All Vulnerabilities
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
