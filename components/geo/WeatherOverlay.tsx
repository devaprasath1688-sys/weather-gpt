"use client";

import React from "react";
import { CloudRain, Thermometer, Wind, Sun, Radio } from "lucide-react";
import type { WeatherData } from "@/types";
import type { RiskAnalysisResult } from "@/types/risk";

type WeatherOverlayProps = {
  weather: WeatherData;
  risk: RiskAnalysisResult;
  districtName: string;
  isLive: boolean;
};

export function WeatherOverlay({ weather, risk, districtName, isLive }: WeatherOverlayProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          {districtName} Telemetry
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700">
          {isLive && <Radio className="h-3 w-3 animate-pulse" />}
          {isLive ? "LIVE FEED" : "PRESET"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5">
          <Thermometer className="h-4 w-4 text-neutral-400 shrink-0" />
          <div>
            <span className="text-white font-bold block">{weather.temperatureC}°C</span>
            <span className="text-neutral-500 text-[10px]">Feels {weather.feelsLikeC}°C</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5">
          <CloudRain className="h-4 w-4 text-neutral-400 shrink-0" />
          <div>
            <span className="text-white font-bold block">{weather.rainfallMm24h}mm</span>
            <span className="text-neutral-500 text-[10px]">24h Rain</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5">
          <Wind className="h-4 w-4 text-neutral-400 shrink-0" />
          <div>
            <span className="text-white font-bold block">{weather.windSpeedKmh} km/h</span>
            <span className="text-neutral-500 text-[10px]">Wind Velocity</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5">
          <Sun className="h-4 w-4 text-neutral-400 shrink-0" />
          <div>
            <span className="text-white font-bold block">UV {weather.uvIndex}</span>
            <span className="text-neutral-500 text-[10px]">Solar Index</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
        <span className="text-neutral-400">{weather.conditionDescription}</span>
        <span className="font-mono font-bold text-white">
          Risk: {risk.overallScore}/100
        </span>
      </div>
    </div>
  );
}
