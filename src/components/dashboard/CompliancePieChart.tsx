import React from "react";

interface CompliancePieChartProps {
  compliant?: number;
  nonCompliant?: number;
  title?: string;
}

export function CompliancePieChart({
  compliant = 120,
  nonCompliant = 4,
  title = "Compliance Overview",
}: Readonly<CompliancePieChartProps>) {
  const total = compliant + nonCompliant;
  const percent = total === 0 ? 0 : Math.round((compliant / total) * 100);
  const compliantColor = "#34d399";
  const nonCompliantColor = "#f87171";
  const radius = 90;
  const stroke = 28;
  const size = radius * 2 + stroke;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const compliantLength = (percent / 100) * circumference;


  return (
    <div className="bg-[#232b3b] rounded-2xl shadow-md p-6 text-white flex flex-col items-center">
      <div className="text-lg font-semibold mb-4">{title}</div>
      <svg width={size} height={size} className="mb-6">
        {/* Full background circle (red) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={nonCompliantColor}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Compliant arc (green) overlaid on top */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={compliantColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${compliantLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.5s', transform: 'rotate(-90deg)', transformOrigin: `${center}px ${center}px` }}
        />
        <text
          x={center}
          y={center - 12}
          textAnchor="middle"
          fontSize="44"
          fontWeight="bold"
          fill="white"
          dominantBaseline="middle"
        >
          {percent}%
        </text>
        <text
          x={center}
          y={center + 38}
          textAnchor="middle"
          fontSize="24"
          fill="#a0aec0"
          dominantBaseline="middle"
        >
          compliant
        </text>
      </svg>
      {/* compliant label is now inside the pie chart */}
      <div className="flex w-full justify-between px-2 mt-2">
        <div className="text-sm font-bold" style={{ color: compliantColor }}>{compliant}</div>
        <div className="text-sm font-bold" style={{ color: nonCompliantColor }}>{nonCompliant}</div>
      </div>
    </div>
  );
}
