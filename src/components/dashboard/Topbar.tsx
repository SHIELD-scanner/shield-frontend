import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function DashboardTopbar() {
  return (
    <div className="flex items-center justify-between px-10 py-6 bg-white border-b border-[#d1d5db] shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-[#232b3b]">
          S.H.I.E.L.D. Security Dashboard
        </h1>
        <div className="text-xs text-[#a0aec0]">
          Strategic Homeland Intervention, Enforcement and Logistics Division
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-[#232b3b] w-9 h-9 flex items-center justify-center text-white font-bold">
          N
        </div>
      </div>
    </div>
  );
}
