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
  let scoreColor = "text-sky-400";
  let trackGradient = "from-sky-500 to-sky-400";
  let badgeBorder = "border-sky-500/30 bg-sky-950/40 text-sky-300";

  if (score >= 80) {
    level = "Severe Risk";
    explanation = "Severe hazards detected. Significant operational disruption and safety risk.";
    Icon = ShieldAlert;
    scoreColor = "text-rose-400";
    trackGradient = "from-rose-600 via-orange-500 to-rose-400";
    badgeBorder = "border-rose-500/40 bg-rose-950/40 text-rose-300";
  } else if (score >= 60) {
    level = "High Risk";
    explanation = "Elevated exposure conditions detected for outdoor activities and transit.";
    Icon = AlertTriangle;
    scoreColor = "text-amber-400";
    trackGradient = "from-amber-500 to-orange-400";
    badgeBorder = "border-amber-500/40 bg-amber-950/40 text-amber-300";
  } else if (score >= 35) {
    level = "Moderate Advisory";
    explanation = "Caution advised for sensitive activities; monitor changing weather trends.";
    Icon = Info;
    scoreColor = "text-sky-300";
    trackGradient = "from-sky-600 to-sky-400";
    badgeBorder = "border-sky-500/30 bg-sky-950/40 text-sky-200";
  }

  return (
    <div className={`rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-4 shadow-lg backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#07111e] border border-[#1e3f68] text-sky-400 shadow-inner">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
              {label}
            </span>
            <span className={`inline-block text-xs font-bold uppercase tracking-wide rounded-md px-2 py-0.5 mt-0.5 border ${badgeBorder}`}>
              {level}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-extrabold font-mono ${scoreColor}`}>{score}</span>
          <span className="text-xs text-slate-500 font-normal"> / 100</span>
        </div>
      </div>

      {/* Progress Track with smooth transition */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#040810] p-0.5 border border-[#142a47]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${trackGradient} transition-all duration-700 ease-out shadow-[0_0_12px_rgba(56,189,248,0.3)]`}
          style={{ width: `${Math.min(100, Math.max(4, score))}%` }}
        />
      </div>

      {/* Reason / Why it exists */}
      <div className="pt-2.5 border-t border-[#142a47] text-xs text-slate-300 leading-relaxed">
        <span className="text-sky-300 font-semibold font-mono">Telemetry Rationale: </span>
        <span className="text-slate-300">{reason || explanation}</span>
      </div>
    </div>
  );
}
