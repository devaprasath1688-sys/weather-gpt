import React from "react";
import { ShieldCheck, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { VerificationStatus } from "@/types";

type VerificationBadgeProps = {
  status: VerificationStatus;
  sourceName?: string;
  className?: string;
};

export function VerificationBadge({
  status,
  sourceName = "Official Authority",
  className = "",
}: VerificationBadgeProps) {
  if (status === "verified_official") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-950/40 px-3.5 py-1.5 text-xs font-semibold text-sky-200 shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)] ${className}`}
      >
        <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
        <span className="text-white font-bold">Verified Official</span>
        <span className="text-sky-300/70 font-normal">· {sourceName}</span>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-[#142a47] bg-[#07111e] px-3.5 py-1.5 text-xs font-medium text-slate-400 ${className}`}
      >
        <Clock className="h-4 w-4 text-slate-500 shrink-0" />
        <span>Expired Bulletin</span>
      </div>
    );
  }

  if (status === "pending_review") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3.5 py-1.5 text-xs font-medium text-amber-200 ${className}`}
      >
        <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
        <span>Pending Official Verification</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[#142a47] bg-[#07111e] px-3.5 py-1.5 text-xs font-medium text-slate-500 ${className}`}
    >
      <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
      <span>Unverified Stream</span>
    </div>
  );
}
