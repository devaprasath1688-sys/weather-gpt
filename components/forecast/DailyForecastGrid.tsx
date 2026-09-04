"use client";

import React from "react";
import { Calendar, Sun, CloudSun, Cloud, CloudRain, Zap, Flame, Wind } from "lucide-react";
import type { DailyForecast } from "@/types";
import { useLanguage } from "@/contexts/language-context";

type DailyForecastGridProps = {
  dailyData: DailyForecast[];
  formatTemp: (tempC: number) => string;
};

function getDailyWeatherIcon(condition: string, className = "h-7 w-7") {
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

function getConditionCardBg(condition: string) {
  const cat = (condition || "").toLowerCase();
  if (cat.includes("thunder") || cat.includes("storm")) {
    return "bg-gradient-to-b from-[#1a1333] to-[#07111e] border-purple-500/20";
  }
  if (cat.includes("rain")) {
    return "bg-gradient-to-b from-[#0e2238] to-[#07111e] border-sky-500/20";
  }
  if (cat === "clear" || cat === "sunny") {
    return "bg-gradient-to-b from-[#1c1d18] to-[#07111e] border-amber-500/20";
  }
  return "bg-gradient-to-b from-[#0a1628] to-[#07111e] border-[#142a47]";
}

export function DailyForecastGrid({ dailyData, formatTemp }: DailyForecastGridProps) {
  const { t } = useLanguage();
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
            03 / {t("forecast.daily")}
          </span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            {t("forecast.sevenDay")}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Calendar className="h-3.5 w-3.5 text-sky-400" />
          <span>{t("forecast.nextSeven")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
        {dailyData.map((day, idx) => {
          const isToday = idx === 0 || day.dayLabel.toLowerCase() === "today";
          const cardBg = getConditionCardBg(day.condition);

          return (
            <div
              key={`${day.dayLabel}-${idx}`}
              className={`rounded-3xl border ${cardBg} p-4 sm:p-4.5 space-y-3 shadow-lg hover:border-sky-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
                isToday ? "ring-1 ring-sky-500/30" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold text-xs ${
                      isToday ? "text-sky-300 font-mono" : "text-white"
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {day.date}
                  </span>
                </div>

                <div className="py-3 flex justify-center">
                  {getDailyWeatherIcon(day.condition, "h-8 w-8")}
                </div>

                <span className="text-[11px] text-slate-300 capitalize block text-center truncate font-medium">
                  {day.condition.replace("_", " ")}
                </span>
              </div>

              <div className="pt-2.5 border-t border-[#142a47] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white text-sm">
                    {formatTemp(day.tempMaxC)}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatTemp(day.tempMinC)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-sky-300">
                    <span>{t("forecast.rainPop")}</span>
                    <span className="font-bold">{day.popPercent}%</span>
                  </div>
                  <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-500"
                      style={{ width: `${day.popPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
