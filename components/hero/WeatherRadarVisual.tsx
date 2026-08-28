"use client";

import React from "react";
import { CloudRain, Radio, Sparkles, MapPin, Check } from "lucide-react";
import type { PersonaPreset } from "@/lib/demo-data";
import { VerificationBadge } from "@/components/ui/VerificationBadge";

type WeatherRadarVisualProps = {
  persona: PersonaPreset;
};

export function WeatherRadarVisual({ persona }: WeatherRadarVisualProps) {
  const { profile, weather, recommendation } = persona;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Main Monochrome Cockpit Frame */}
      <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-7 space-y-6 shadow-2xl overflow-hidden">
        {/* Cockpit Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-white">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                  Telemetry Field
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {profile.district} District Radar
              </h3>
            </div>
          </div>

          <VerificationBadge
            status={persona.alerts[0]?.verificationStatus || "verified_official"}
            sourceName={persona.alerts[0]?.sourceName || "Official Authority"}
          />
        </div>

        {/* Cockpit Main 3-Column Display Layout */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 items-center">
          {/* LEFT: Risk Score Gauge */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
              Risk Score
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {recommendation.riskScore}
            </div>
            <span className="inline-flex items-center rounded-full bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {recommendation.priority}
            </span>
          </div>

          {/* CENTER: Monochrome Radar Animation Element */}
          <div className="relative flex items-center justify-center py-2">
            {/* Concentric Radar Rings */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/50">
              <div className="absolute inset-2 rounded-full border border-dashed border-neutral-800" />
              <div className="absolute inset-5 rounded-full border border-neutral-800" />
              <div className="absolute inset-0 rounded-full animate-radar-ring border border-neutral-600" />

              {/* Rotating Radar Sweep Line */}
              <div className="absolute inset-0 rounded-full animate-radar-sweep">
                <div className="h-1/2 w-0.5 bg-gradient-to-t from-white to-transparent mx-auto origin-bottom" />
              </div>

              {/* Center Radar Node */}
              <div className="relative flex flex-col items-center justify-center z-10 text-center">
                <CloudRain className="h-5 w-5 text-white" />
                <span className="mt-1 text-[10px] font-mono font-bold text-white">
                  {weather.temperatureC}°C
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Primary Action Directive */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-white" />
              Action Directive
            </span>
            <p className="text-xs font-semibold text-white leading-snug line-clamp-3">
              {recommendation.headline.en}
            </p>
          </div>
        </div>

        {/* Cockpit Telemetry Footer */}
        <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
            {profile.latitude}°N, {profile.longitude}°E
          </span>
          <span className="flex items-center gap-1 text-white font-semibold">
            <Check className="h-3.5 w-3.5" />
            <span>Target: {profile.occupation.toUpperCase()}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
