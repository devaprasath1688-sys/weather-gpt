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
        className={`inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white ${className}`}
      >
        <ShieldCheck className="h-4 w-4 text-white" />
        <span>Verified Official</span>
        <span className="text-neutral-400 font-normal">· {sourceName}</span>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-neutral-400 ${className}`}
      >
        <Clock className="h-4 w-4 text-neutral-500" />
        <span>Expired Bulletin</span>
      </div>
    );
  }

  if (status === "pending_review") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-neutral-300 ${className}`}
      >
        <CheckCircle2 className="h-4 w-4 text-neutral-400" />
        <span>Pending Official Verification</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-neutral-500 ${className}`}
    >
      <AlertCircle className="h-4 w-4 text-neutral-500" />
      <span>Unverified Stream</span>
    </div>
  );
}
