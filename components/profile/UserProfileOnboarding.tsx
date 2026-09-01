"use client";

import React from "react";
import { MapPin, Briefcase, Languages, BellRing, Sparkles, Check } from "lucide-react";
import type { UserProfile, OccupationKey, LanguageCode } from "@/types";
import { MOCK_PERSONAS } from "@/lib/demo-data";
import { SUPPORTED_LANGUAGES, DISTRICT_OPTIONS } from "@/lib/constants";

type UserProfileOnboardingProps = {
  activeProfile: UserProfile;
  onProfileChange: (updated: UserProfile) => void;
  onSelectPreset: (presetKey: string) => void;
  selectedPresetKey: string;
};

const OCCUPATION_OPTIONS: Array<{ key: OccupationKey; label: string; icon: string }> = [
  { key: "student", label: "Student / Academic", icon: "🎓" },
  { key: "farmer", label: "Farmer / Agriculture", icon: "🌾" },
  { key: "construction", label: "Outdoor / Construction", icon: "🏗️" },
  { key: "driver", label: "Driver / Transport", icon: "🚌" },
  { key: "delivery", label: "Delivery Worker", icon: "🛵" },
  { key: "fisher", label: "Healthcare", icon: "🏥" },
  { key: "office", label: "Office / Indoor", icon: "🏢" },
  { key: "other", label: "General Citizen", icon: "👤" },
];

export function UserProfileOnboarding({
  activeProfile,
  onProfileChange,
  onSelectPreset,
  selectedPresetKey,
}: UserProfileOnboardingProps) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-neutral-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Scenario Telemetry Switcher</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Live Intelligence Scenarios
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            Select a target profile to observe how WeatherGPT computes custom risk vectors and suppresses irrelevant announcements.
          </p>
        </div>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(MOCK_PERSONAS).map(([key, persona]) => {
          const isSelected = selectedPresetKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPreset(key)}
              className={`group relative flex flex-col justify-between rounded-2xl p-6 text-left transition-all border ${
                isSelected
                  ? "bg-neutral-900 border-white shadow-md ring-1 ring-white"
                  : "bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60"
              }`}
            >
              {/* Top Tag */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                    📍 {persona.profile.district} District
                  </span>
                  {isSelected ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black font-bold">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border border-neutral-700 bg-neutral-900 group-hover:border-neutral-500" />
                  )}
                </div>

                {/* Persona Name */}
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {persona.name}
                </h3>

                <p className="wgpt-body-text text-xs text-neutral-400">
                  {persona.subtitle}
                </p>
              </div>

              {/* Persona Bottom Meta */}
              <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="capitalize">{persona.profile.occupation}</span>
                <span className="font-mono uppercase">{persona.profile.language}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Manual Telemetry Override Drawer */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <span>Custom Telemetry Calibration</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-400">Active Profile Override</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* District Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              <span>Target District</span>
            </label>
            <select
              value={activeProfile.district}
              onChange={(e) =>
                onProfileChange({
                  ...activeProfile,
                  district: e.target.value,
                })
              }
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition-colors focus:border-white focus:outline-none"
            >
              {DISTRICT_OPTIONS.map((dist) => (
                <option key={dist} value={dist} className="bg-neutral-900 text-white">
                  {dist} District
                </option>
              ))}
            </select>
          </div>

          {/* Occupation Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
              <span>Occupational Role</span>
            </label>
            <select
              value={activeProfile.occupation}
              onChange={(e) =>
                onProfileChange({
                  ...activeProfile,
                  occupation: e.target.value as OccupationKey,
                })
              }
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition-colors focus:border-white focus:outline-none"
            >
              {OCCUPATION_OPTIONS.map((occ) => (
                <option key={occ.key} value={occ.key} className="bg-neutral-900 text-white">
                  {occ.icon} {occ.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <Languages className="h-3.5 w-3.5 text-neutral-400" />
              <span>Preferred Language</span>
            </label>
            <select
              value={activeProfile.language}
              onChange={(e) =>
                onProfileChange({
                  ...activeProfile,
                  language: e.target.value as LanguageCode,
                })
              }
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white transition-colors focus:border-white focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.label} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rule Filter Notice */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-white shrink-0" />
            <span>Right User → Right Notification dispatch filtering is active.</span>
          </div>
          <span className="font-mono text-[10px] text-neutral-300">RULESET: OCCUPATION_DISASTER_MATRIX</span>
        </div>
      </div>
    </div>
  );
}
