"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import type { OfficialAlert } from "@/types";
import type { AlertVerificationReport } from "@/types/alerts-normalized";

type AlertMarkerPopupProps = {
  alert: OfficialAlert;
  report: AlertVerificationReport;
};

export function AlertMarkerPopup({ alert, report }: AlertMarkerPopupProps) {
  const isVerified = report.isVerifiedOfficial;

  return (
    <div className="min-w-[220px] max-w-[280px] text-xs text-neutral-200">
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-neutral-800">
        {isVerified ? (
          <ShieldCheck className="h-3.5 w-3.5 text-white shrink-0" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        )}
        <span className="font-bold text-white text-[11px]">
          {isVerified ? "Verified Official Alert" : "Advisory Alert"}
        </span>
      </div>

      <div className="font-bold text-white text-xs mb-1">
        {alert.title}
      </div>

      <div className="text-neutral-400 text-[10px] mb-2 font-mono">
        {report.issuingAuthority}
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className="px-2 py-0.5 rounded-full font-bold bg-neutral-900 border border-neutral-700 text-white uppercase tracking-wider">
          {alert.severity.toUpperCase()}
        </span>
        <span className="flex items-center gap-1 text-neutral-500 font-mono">
          <Clock className="h-2.5 w-2.5" />
          {alert.issuedAt}
        </span>
      </div>
    </div>
  );
}
