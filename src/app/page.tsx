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
import { VulnerabilitySeverityBarChart } from "@/components/dashboard/VulnerabilitySeverityBarChart";
import { CompliancePieChart } from "@/components/dashboard/CompliancePieChart";

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
          (sum: number, item: { report?: { vulnerabilities?: unknown[] } }) =>
            sum + (item?.report?.vulnerabilities?.length ?? 0),
          0
        );
        setTotalVulnerabilities(total);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/vulnerabilities")
      .then((response) => response.json())
      .then((data) => {
        const total = data.reduce(
          (sum: number, item: { report?: { vulnerabilities?: unknown[] } }) =>
            sum + (item?.report?.vulnerabilities?.length ?? 0),
          1
        );
        setCriticalIssues(total);
      });
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#232b3b] text-white dark:text-gray-200">
      {/* <div className="flex justify-end px-10 pt-6">
        <ThemeToggle />
      </div> */}
      <DashboardTopbar />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-10 py-6">
        <StatCard
          title="Total Vulnerabilities"
          value={totalVulnerabilities}
          subtext="+12% from last week"
          subtextClass="text-[#f87171]"
          icon="vulnerability"
        />
        <StatCard
          title="Critical Issues"
          value={criticalIssues}
          subtext="-5% from last week"
          subtextClass="text-[#fbbf24]"
          icon="critical"
        />
        <StatCard
          title="Compliant Resources"
          value="77%"
          valueClass="text-[#34d399]"
          subtext="+3% from last week"
          subtextClass="text-[#34d399]"
          icon="shield"
        />
        <StatCard
          title="Exposed Secrets"
          value="8"
          valueClass="text-[#f87171]"
          subtext="+2 new findings"
          subtextClass="text-[#f87171]"
          icon="key"
        />
      </div>
      <div className="grid grid-cols- md:grid-cols-4 gap-6 px-10 pb-6">
        <VulnerabilitySeverityBarChart />
        <CompliancePieChart />
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
        <TrendsCard />
        <CriticalVulnCard />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10 py-6">
        <RecentActivityCard />
        <ComplianceOverviewCard />
      </div> */}
    </main>
  );
}
