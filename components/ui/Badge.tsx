import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "ok" | "warn" | "danger" | "info" | "official" | "neutral";
  className?: string;
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  const tones = {
    ok: "bg-neutral-900 text-neutral-200 border-neutral-700",
    warn: "bg-neutral-900 text-neutral-200 border-neutral-600",
    danger: "bg-neutral-900 text-white border-neutral-500 font-semibold",
    info: "bg-neutral-900 text-neutral-200 border-neutral-700",
    official: "bg-white text-black border-white font-semibold tracking-wide",
    neutral: "bg-neutral-900 text-neutral-400 border-neutral-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
