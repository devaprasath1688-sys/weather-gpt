"use client";

import React from "react";
import { BarChart3, Sun, CloudSun, Cloud, CloudRain, Zap, Flame, Wind } from "lucide-react";
import type { HourlyForecast } from "@/types";
import { useLanguage } from "@/contexts/language-context";

type HourlyTimelineProps = {
  hourlyData: HourlyForecast[];
  formatTemp: (tempC: number) => string;
};

function getHourWeatherIcon(condition: string, className = "h-5 w-5") {
  const cat = (condition || "").toLowerCase();
  if (cat === "clear" || cat === "sunny") {
    return <Sun className={`${className} text-amber-400`} />;
  }
  if (cat.includes("thunder") || cat.includes("storm")) {
    return <Zap className={`${className} text-amber-400 animate-pulse`} />;
  }
  if (cat.includes("heavy_rain")) {
    return <CloudRain className={`${className} text-blue-400 animate-pulse`} />;
  }
  if (cat.includes("rain")) {
    return <CloudRain className={`${className} text-sky-400`} />;
  }
  if (cat === "cloudy") {
    return <Cloud className={`${className} text-slate-300`} />;
  }
  if (cat === "extreme_heat") {
    return <Flame className={`${className} text-orange-400`} />;
  }
  if (cat === "windy") {
    return <Wind className={`${className} text-teal-400`} />;
  }
  return <CloudSun className={`${className} text-sky-400`} />;
}

export function HourlyTimeline({ hourlyData, formatTemp }: HourlyTimelineProps) {
  const { t } = useLanguage();
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
            02 / {t("forecast.hourly")}
          </span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            {t("forecast.timeline")}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <BarChart3 className="h-3.5 w-3.5 text-sky-400" />
          <span>{t("forecast.horizon")}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#142a47] bg-[#0a1628]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        {/* Horizontal Scrollable Hourly Nodes */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {hourlyData.map((hour, index) => {
            const isNow = index === 0 || hour.time.toLowerCase() === "now";

            return (
              <div
                key={`${hour.time}-${index}`}
                className={`shrink-0 flex flex-col items-center justify-between rounded-2xl px-4 py-3.5 min-w-[90px] space-y-2.5 transition-all duration-200 ${
                  isNow
                    ? "border-2 border-sky-400 bg-sky-500/10 shadow-[0_0_20px_rgba(56,189,248,0.25)] font-semibold"
                    : "border border-[#142a47] bg-[#07111e] hover:border-sky-500/40 hover:bg-[#0c1c30] hover:-translate-y-0.5"
                }`}
              >
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isNow ? "text-sky-300" : "text-slate-400"
                  }`}
                >
                  {hour.time}
                </span>

                <div className="py-1">
                  {getHourWeatherIcon(hour.condition, isNow ? "h-6 w-6" : "h-5 w-5")}
                </div>

                <span className="text-sm font-bold text-white font-mono">
                  {formatTemp(hour.tempC)}
                </span>

                {hour.popPercent > 0 ? (
                  <span className="text-[10px] font-mono text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                    {hour.popPercent}% {t("forecast.rainPop")}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">0%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
