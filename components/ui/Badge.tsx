import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "ok" | "warn" | "danger" | "info" | "official" | "neutral" | "cyan";
  className?: string;
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  const tones = {
    ok: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
    warn: "bg-amber-950/40 text-amber-300 border-amber-500/30",
    danger: "bg-rose-950/40 text-rose-300 border-rose-500/30 font-semibold",
    info: "bg-sky-950/50 text-sky-300 border-sky-500/30",
    cyan: "bg-sky-500/10 text-sky-300 border-sky-400/40 font-semibold shadow-[0_0_12px_-2px_rgba(56,189,248,0.25)]",
    official: "bg-sky-400 text-slate-950 border-sky-300 font-bold tracking-wide shadow-[0_0_15px_-3px_rgba(56,189,248,0.4)]",
    neutral: "bg-[#0a1628] text-slate-400 border-[#142a47]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
