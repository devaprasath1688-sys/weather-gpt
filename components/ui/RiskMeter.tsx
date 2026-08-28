import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from "lucide-react";

type RiskMeterProps = {
  score: number; // 0 - 100
  label?: string;
  className?: string;
  reason?: string;
};

export function RiskMeter({
  score,
  label = "Personal Weather Risk Index",
  className = "",
  reason,
}: RiskMeterProps) {
  let level = "Low Risk";
  let explanation = "Environmental baseline is within safe thresholds for normal activity.";
  let Icon = CheckCircle;

  if (score >= 80) {
    level = "Severe Risk";
    explanation = "Severe hazards detected. Significant operational disruption and safety risk.";
    Icon = ShieldAlert;
  } else if (score >= 60) {
    level = "High Risk";
    explanation = "Elevated exposure conditions detected for outdoor activities and transit.";
    Icon = AlertTriangle;
  } else if (score >= 35) {
    level = "Moderate Advisory";
    explanation = "Caution advised for sensitive activities; monitor changing weather trends.";
    Icon = Info;
  }

  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-white">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
              {label}
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {level}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-white font-mono">{score}</span>
          <span className="text-xs text-neutral-500 font-normal"> / 100</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-950 p-0.5 border border-neutral-800">
        <div
          className="h-full rounded-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {/* Reason / Why it exists */}
      <div className="pt-2 border-t border-neutral-800/80 text-xs text-neutral-400 leading-relaxed">
        <span className="text-neutral-200 font-medium">Telemetry Rationale: </span>
        {reason || explanation}
      </div>
    </div>
  );
}
