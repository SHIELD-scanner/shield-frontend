"use client";
import { DashboardTopbar } from "@/components/dashboard/Topbar";
import { StatCard } from "@/components/dashboard/StatCard";
import React, { useEffect, useState } from "react";
import {
  TrendsCard,
  CriticalVulnCard,
} from "@/components/dashboard/TrendsAndCriticalCards";
import {
  RecentActivityCard,
  ComplianceOverviewCard,
} from "@/components/dashboard/ActivityAndComplianceCards";

export default function Home() {
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [criticalIssues, setCriticalIssues] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/vulnerabilities/")
      .then((response) => response.json())
      .then((data) => {
        const total = data.reduce(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (sum: number, item: any) =>
            sum + (item?.report?.vulnerabilities?.length || 0),
          0
        );
        setTotalVulnerabilities(total);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/reports/vulnerabilityreports")
      .then((response) => response.json())
      .then((data) => {
        const total = data.reduce(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (sum: number, item: any) =>
            sum + (item?.report?.vulnerabilities?.length || 0),
          0
        );
        setCriticalIssues(total);
      });
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#f7f8fa]">
      <DashboardTopbar />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-10 py-6">
        <StatCard
          title="Total Vulnerabilities"
          value={totalVulnerabilities}
          subtext="+12 from last scan"
          subtextClass="text-[#f87171]"
        />
        <StatCard
          title="Critical Issues"
          value={criticalIssues}
          subtext="Requires immediate attention"
          subtextClass="text-[#f87171]"
        />
        <StatCard
          title="Compliance Score"
          value="0%"
          valueClass="text-[#fde047]"
          subtext="+5% improvement"
          subtextClass="text-[#fde047]"
        />
        <StatCard
          title="Scanned Resources"
          value="0"
          valueClass="text-[#34d399]"
          subtext="Last scan: 2 minutes ago"
          subtextClass="text-[#34d399]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
        <TrendsCard />
        <CriticalVulnCard />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10 py-6">
        <RecentActivityCard />
        <ComplianceOverviewCard />
      </div>
    </main>
  );
}
