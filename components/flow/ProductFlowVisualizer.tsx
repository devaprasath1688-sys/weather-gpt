"use client";

import React from "react";
import {
  UserCheck,
  CloudRain,
  Cpu,
  MapPin,
  ShieldCheck,
  Sparkles,
  Send,
} from "lucide-react";
import { PRODUCT_FLOW } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

type ProductFlowVisualizerProps = {
  activeStep: number; // 1 to 7
  onStepSelect: (stepNumber: number) => void;
};

const STEP_ICONS = [
  UserCheck,
  CloudRain,
  Cpu,
  MapPin,
  ShieldCheck,
  Sparkles,
  Send,
];

const STEP_PHASES = [
  "INPUT",
  "METEOROLOGY",
  "INTELLIGENCE",
  "MAPPING",
  "VERIFICATION",
  "PERSONALIZATION",
  "DISPATCH",
];

export function ProductFlowVisualizer({
  activeStep,
  onStepSelect,
}: ProductFlowVisualizerProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#142a47] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-sky-400 font-mono">
              {t("pipeline.architecture")}
            </span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t("pipeline.lockedFlow")}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#0a1628] px-3.5 py-1.5 text-xs font-semibold text-sky-300 shadow-[0_0_12px_-2px_rgba(56,189,248,0.25)]">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          <span>{t("pipeline.stepActive", { step: `0${activeStep}` })}</span>
        </div>
      </div>

      {/* Connected 7-Step Pipeline Nodes */}
      <div className="relative">
        {/* Horizontal Connector Line for Desktop */}
        <div className="absolute top-1/2 left-6 right-6 hidden -translate-y-1/2 border-t border-[#142a47] lg:block z-0" />

        <div className="relative z-10 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {PRODUCT_FLOW.map((stepTitle, idx) => {
            const stepNumber = idx + 1;
            const isActive = activeStep === stepNumber;
            const Icon = STEP_ICONS[idx];
            const phaseLabel = STEP_PHASES[idx];

            return (
              <button
                key={stepTitle}
                type="button"
                onClick={() => onStepSelect(stepNumber)}
                className={`group relative flex flex-col justify-between rounded-xl p-4 text-left transition-all duration-200 border ${
                  isActive
                    ? "border-sky-400 bg-[#0f223d] shadow-[0_0_20px_-3px_rgba(56,189,248,0.35)] ring-1 ring-sky-400/50"
                    : "border-[#142a47] bg-[#07111e] hover:border-sky-500/30 hover:bg-[#0a1628]"
                }`}
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isActive ? "text-sky-300" : "text-slate-500"
                      }`}
                    >
                      0{stepNumber}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? "bg-sky-500 text-slate-950 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                          : "bg-[#0a1628] text-slate-400 border-[#142a47] group-hover:text-sky-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Phase Eyebrow Tag */}
                  <span className={`text-[9px] font-mono uppercase tracking-wider font-semibold block mb-1 ${
                    isActive ? "text-sky-400" : "text-slate-500"
                  }`}>
                    {t(`pipeline.${phaseLabel.toLowerCase()}` as "pipeline.input")}
                  </span>

                  {/* Step Title */}
                  <div
                    className={`text-xs font-semibold leading-tight line-clamp-2 ${
                      isActive ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {stepTitle}
                  </div>
                </div>

                <div className={`mt-3 pt-2 border-t border-[#142a47]/80 text-[10px] ${
                  isActive ? "text-sky-300/80 font-mono font-medium" : "text-slate-500"
                }`}>
                  {isActive ? t("pipeline.viewing") : t("pipeline.clickView")}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
