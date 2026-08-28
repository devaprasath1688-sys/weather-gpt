"use client";

import React from "react";

const RISK_LEGEND = [
  { level: "LOW", color: "#71717a", desc: "Safe baseline" },
  { level: "MODERATE", color: "#a1a1aa", desc: "Minor advisory" },
  { level: "ELEVATED", color: "#d4d4d8", desc: "Elevated hazard" },
  { level: "HIGH", color: "#e4e4e7", desc: "High hazard" },
  { level: "CRITICAL", color: "#ffffff", desc: "Critical threat" },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 space-y-2 shadow-2xl max-w-[200px] backdrop-blur-md">
      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold block">Risk Spectrum</span>
      <div className="space-y-1.5">
        {RISK_LEGEND.map((item) => (
          <div key={item.level} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 border border-neutral-700"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-white">{item.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
