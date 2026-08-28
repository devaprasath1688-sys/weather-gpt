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
  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 font-mono">
              Pipeline Architecture
            </span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Locked 7-Step Intelligence Flow
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span>Step 0{activeStep} Active</span>
        </div>
      </div>

      {/* Connected 7-Step Pipeline Nodes */}
      <div className="relative">
        {/* Horizontal Connector Line for Desktop */}
        <div className="absolute top-1/2 left-6 right-6 hidden -translate-y-1/2 border-t border-neutral-800 lg:block z-0" />

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
                className={`group relative flex flex-col justify-between rounded-xl p-4 text-left transition-all border ${
                  isActive
                    ? "border-white bg-neutral-900 shadow-md ring-1 ring-white"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/60"
                }`}
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isActive ? "text-white" : "text-neutral-500"
                      }`}
                    >
                      0{stepNumber}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                        isActive
                          ? "bg-white text-black border-white"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Phase Eyebrow Tag */}
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                    {phaseLabel}
                  </span>

                  {/* Step Title */}
                  <div
                    className={`text-xs font-semibold leading-tight line-clamp-2 ${
                      isActive ? "text-white" : "text-neutral-300"
                    }`}
                  >
                    {stepTitle}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500">
                  {isActive ? "Viewing output" : "Click to view"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
