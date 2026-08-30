"use client";

import React from "react";
import {
  MapPin,
  Clock,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
} from "lucide-react";
import type { WeatherData } from "@/types";
import { WeatherConditionVisual } from "./WeatherConditionVisual";

type WeatherHeroSectionProps = {
  activeWeather: WeatherData;
  selectedDistrict: string;
  locationSource: "gps" | "manual";
  tempUnit: "C" | "F";
  onTempUnitToggle: (unit: "C" | "F") => void;
  weatherLoading: boolean;
  providerName?: string;
  highTemp?: number;
  lowTemp?: number;
};

export function WeatherHeroSection({
  activeWeather,
  selectedDistrict,
  locationSource,
  tempUnit,
  onTempUnitToggle,
  weatherLoading,
  providerName = "Open-Meteo High-Res Engine",
  highTemp,
  lowTemp,
}: WeatherHeroSectionProps) {
  const formatTemp = (tempC: number) => {
    if (tempUnit === "F") {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  const formatTempVal = (tempC: number) => {
    if (tempUnit === "F") {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  const resolvedHigh = highTemp ?? activeWeather.temperatureC + 2;
  const resolvedLow = lowTemp ?? activeWeather.temperatureC - 4;

  return (
    <section className="space-y-4">
      {/* Location Status & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#142a47]/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-300 bg-[#0a1628] border border-sky-500/30 px-3 py-1.5 rounded-xl shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-bold">{selectedDistrict}, Tamil Nadu</span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border font-semibold ${
              locationSource === "gps"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-[#07111e] border-[#1e3f68] text-slate-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                locationSource === "gps"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-slate-400"
              }`}
            />
            <span>{locationSource === "gps" ? "GPS Active" : "District Fix"}</span>
          </span>
        </div>

        {/* Right Tools: Temp Unit Toggle & Refresh Timestamp */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Temperature Unit Toggle */}
          <div className="flex items-center rounded-xl border border-[#142a47] bg-[#07111e] p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onTempUnitToggle("C")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tempUnit === "C"
                  ? "bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onTempUnitToggle("F")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tempUnit === "F"
                  ? "bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °F
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-[#07111e] border border-[#142a47] px-2.5 py-1 rounded-lg">
            <Clock className="h-3 w-3 text-sky-400" />
            <span>{activeWeather.updatedAt}</span>
          </div>
        </div>
      </div>

      {/* Main Meteorological Cockpit Hero Banner */}
      <div className="rounded-3xl border border-[#1a385c] bg-gradient-to-br from-[#0a1628] via-[#07111e] to-[#040810] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Huge Temperature & Condition Specs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-bold block">
                Current Atmospheric State
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeWeather.conditionCategory.replace("_", " ").toUpperCase()}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {activeWeather.conditionDescription}
              </p>
            </div>

            {/* Big Temperature Numbers */}
            <div className="pt-2 flex flex-wrap items-baseline gap-4 sm:gap-6">
              <div className="flex items-start">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                  {weatherLoading ? "..." : formatTempVal(activeWeather.temperatureC)}
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-sky-400 font-mono mt-1">
                  °
                </span>
              </div>

              <div className="space-y-1 border-l border-[#142a47] pl-4 sm:pl-6 text-xs sm:text-sm">
                <div className="font-mono text-slate-300">
                  <span>Feels like </span>
                  <strong className="text-white font-bold">
                    {formatTemp(activeWeather.feelsLikeC)}
                  </strong>
                </div>
                <div className="font-mono text-slate-400 flex items-center gap-3">
                  <span>
                    H: <strong className="text-sky-300">{formatTemp(resolvedHigh)}</strong>
                  </span>
                  <span>
                    L: <strong className="text-slate-300">{formatTemp(resolvedLow)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Provider Verification Strip */}
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              <span>Calibrated via: </span>
              <span className="text-sky-300 font-semibold">{providerName}</span>
            </div>
          </div>

          {/* Right Column: Dynamic Meteorological Illustration */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <WeatherConditionVisual
              condition={activeWeather.conditionCategory}
              className="w-44 h-44 sm:w-56 sm:h-56"
            />
          </div>
        </div>

        {/* Bottom Metrics Bar: 4 Core Sensors */}
        <div className="mt-8 pt-6 border-t border-[#142a47] grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
          {/* Precipitation / Rain Depth */}
          <div className="rounded-2xl border border-[#142a47] bg-[#07111e]/90 p-4 space-y-1.5 shadow-sm hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">24h Rain</span>
              <CloudRain className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {activeWeather.rainfallMm24h} <span className="text-xs text-slate-400 font-normal">mm</span>
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">
                {activeWeather.rainfallMm24h > 0 ? "Precipitation active" : "Dry surface"}
              </span>
            </div>
            <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, activeWeather.rainfallMm24h * 2))}%` }}
              />
            </div>
          </div>

          {/* Surface Wind */}
          <div className="rounded-2xl border border-[#142a47] bg-[#07111e]/90 p-4 space-y-1.5 shadow-sm hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Surface Wind</span>
              <Wind className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {activeWeather.windSpeedKmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">
                {activeWeather.windSpeedKmh > 30 ? "Elevated gusts" : "Moderate breeze"}
              </span>
            </div>
            <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (activeWeather.windSpeedKmh / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="rounded-2xl border border-[#142a47] bg-[#07111e]/90 p-4 space-y-1.5 shadow-sm hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Humidity</span>
              <Droplets className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {activeWeather.humidityPercent}%
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">
                {activeWeather.humidityPercent >= 75 ? "Humid air" : "Balanced vapor"}
              </span>
            </div>
            <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-500"
                style={{ width: `${activeWeather.humidityPercent}%` }}
              />
            </div>
          </div>

          {/* Solar UV Index */}
          <div className="rounded-2xl border border-[#142a47] bg-[#07111e]/90 p-4 space-y-1.5 shadow-sm hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">UV Index</span>
              <Sun className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {activeWeather.uvIndex} <span className="text-xs text-slate-400 font-normal">/ 11</span>
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">
                {activeWeather.uvIndex >= 8
                  ? "Very High UV"
                  : activeWeather.uvIndex >= 6
                  ? "High Exposure"
                  : "Moderate Index"}
              </span>
            </div>
            <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${(activeWeather.uvIndex / 11) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
