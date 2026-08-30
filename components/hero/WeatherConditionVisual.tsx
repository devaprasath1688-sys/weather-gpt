"use client";

import React from "react";

type WeatherConditionVisualProps = {
  condition: string;
  className?: string;
};

export function WeatherConditionVisual({
  condition,
  className = "w-36 h-36",
}: WeatherConditionVisualProps) {
  const category = (condition || "").toLowerCase();

  // 1. SUNNY / CLEAR
  if (category === "clear" || category === "sunny") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Ambient Sun Radiance */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
          <circle cx="50" cy="50" r="22" fill="url(#sunGrad)" />
          {/* Subtle Rays */}
          <g stroke="url(#rayGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
            <line x1="50" y1="12" x2="50" y2="20" />
            <line x1="50" y1="80" x2="50" y2="88" />
            <line x1="12" y1="50" x2="20" y2="50" />
            <line x1="80" y1="50" x2="88" y2="50" />
            <line x1="23" y1="23" x2="29" y2="29" />
            <line x1="71" y1="71" x2="77" y2="77" />
            <line x1="23" y1="77" x2="29" y2="71" />
            <line x1="71" y1="29" x2="77" y2="23" />
          </g>
          <defs>
            <radialGradient id="sunGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 2. RAIN / HEAVY RAIN
  if (category.includes("rain")) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Cool Atmospheric Glow */}
        <div className="absolute inset-0 rounded-full bg-sky-500/15 blur-2xl" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_16px_rgba(56,189,248,0.35)]">
          {/* Main Cloud */}
          <path
            d="M28 62h46a16 16 0 0 0 2-31.8A22 22 0 0 0 34 32a15 15 0 0 0-6 30z"
            fill="url(#rainCloudGrad)"
          />
          {/* Rain Drops */}
          <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
            <line x1="36" y1="68" x2="32" y2="82" />
            <line x1="50" y1="68" x2="46" y2="82" />
            <line x1="64" y1="68" x2="60" y2="82" />
            <line x1="43" y1="76" x2="39" y2="90" />
            <line x1="57" y1="76" x2="53" y2="90" />
          </g>
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 3. THUNDERSTORM
  if (category.includes("thunder") || category.includes("storm")) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Storm Purple/Amber Glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_20px_rgba(245,158,11,0.45)]">
          {/* Dark Storm Cloud */}
          <path
            d="M28 58h46a16 16 0 0 0 2-31.8A22 22 0 0 0 34 28a15 15 0 0 0-6 30z"
            fill="url(#stormCloudGrad)"
          />
          {/* Lightning Bolt */}
          <polygon
            points="50,56 42,70 48,70 44,88 58,68 51,68 56,56"
            fill="url(#lightningGrad)"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 4. PARTLY CLOUDY (Default / Sun + Cloud)
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft Sunlight Glow Behind Cloud */}
      <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-amber-500/25 blur-xl" />
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_16px_rgba(56,189,248,0.25)]">
        {/* Sun Behind */}
        <circle cx="62" cy="38" r="16" fill="url(#partlySunGrad)" />
        {/* Sun Ray Accents */}
        <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.75">
          <line x1="62" y1="14" x2="62" y2="18" />
          <line x1="82" y1="38" x2="86" y2="38" />
          <line x1="77" y1="23" x2="80" y2="20" />
        </g>
        {/* Floating Front Cloud */}
        <path
          d="M24 68h48a15 15 0 0 0 2-29.8A20 20 0 0 0 30 38a14 14 0 0 0-6 30z"
          fill="url(#partlyCloudGrad)"
        />
        <defs>
          <radialGradient id="partlySunGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <linearGradient id="partlyCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
