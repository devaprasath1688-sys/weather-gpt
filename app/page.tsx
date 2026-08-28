"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardShell, type DashboardTab } from "@/components/layout/DashboardShell";
import { LandingPage } from "@/components/landing/LandingPage";
import { LiveWeatherMap } from "@/components/geo/LiveWeatherMap";
import { ProductFlowVisualizer } from "@/components/flow/ProductFlowVisualizer";
import { StepPipelinePreview } from "@/components/flow/StepPipelinePreview";
import { MOCK_PERSONAS, type PersonaPreset } from "@/lib/demo-data";
import {
  SIH_PROBLEM_CODE,
  CURRENT_PHASE,
  DISTRICT_OPTIONS,
  OCCUPATION_KEYS,
  CORE_DIFFERENTIATORS,
} from "@/lib/constants";
import { DISTRICT_COORDINATES } from "@/lib/geo/districtCoordinates";
import { useGeolocation } from "@/lib/geo";
import type { UserProfile, OccupationKey, WeatherNormalizedPayload, WeatherData } from "@/types";
import { analyzeWeatherRisk } from "@/lib/risk/analyzeRisk";
import { calculateDistrictIntelligence } from "@/lib/district/calculateDistrictIntelligence";
import { verifyOfficialAlert } from "@/lib/alerts/verifyAlert";
import { generatePersonalizedRecommendation } from "@/lib/recommendations/generateRecommendation";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ExternalLink,
  Clock,
  Sparkles,
  Activity,
  UserCheck,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  CloudSun,
  Compass,
} from "lucide-react";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { user, userProfile } = useAuth();
  const { permissionState, requestLocation } = useGeolocation();

  // Mode: "landing" (default for root URL) vs "dashboard" (when viewing dashboard tabs)
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const validDashboardTabs = [
        "overview",
        "weather",
        "risk",
        "alerts",
        "recommendations",
        "district",
        "pipeline",
        "trust",
        "dashboard",
      ];
      if (validDashboardTabs.includes(hash)) {
        return "dashboard";
      }
    }
    return "landing";
  });

  // Active navigation tab with lazy initializer
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "") as DashboardTab;
      const validTabs: DashboardTab[] = [
        "overview",
        "weather",
        "risk",
        "alerts",
        "recommendations",
        "district",
        "pipeline",
        "trust",
      ];
      if (validTabs.includes(hash)) {
        return hash;
      }
    }
    return "overview";
  });

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setViewMode("dashboard");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`);
    }
  };

  const handleExploreDashboard = () => {
    setViewMode("dashboard");
    setActiveTab("overview");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#overview");
    }
  };

  // Sync viewMode and activeTab on hashchange (e.g. from /signup completion or browser back/forward)
  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace("#", "");
      const validDashboardTabs: DashboardTab[] = [
        "overview",
        "weather",
        "risk",
        "alerts",
        "recommendations",
        "district",
        "pipeline",
        "trust",
      ];
      if (validDashboardTabs.includes(hash as DashboardTab)) {
        setViewMode("dashboard");
        setActiveTab(hash as DashboardTab);
      } else if (hash === "dashboard") {
        setViewMode("dashboard");
        setActiveTab("overview");
      } else if (!hash) {
        setViewMode("landing");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  // District & Occupation state
  const initialDistrict = useMemo(() => {
    if (userProfile?.district) {
      const matched = DISTRICT_OPTIONS.find(
        (d) => d.toLowerCase() === userProfile.district.toLowerCase()
      );
      if (matched) return matched;
    }
    return "Chennai";
  }, [userProfile]);

  const [districtOverride, setDistrictOverride] = useState<string | null>(null);
  const selectedDistrict = districtOverride ?? initialDistrict;

  const initialOccupation = (userProfile?.occupation as OccupationKey) || "student";
  const [occupationOverride, setOccupationOverride] = useState<OccupationKey | null>(null);
  const selectedOccupation = occupationOverride ?? initialOccupation;

  // Live weather & GPS telemetry state
  const [liveWeather, setLiveWeather] = useState<WeatherNormalizedPayload | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [locationSource, setLocationSource] = useState<"gps" | "manual">("manual");
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Active 7-step pipeline inspection step
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);

  // Reactive weather fetching
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const coords = DISTRICT_COORDINATES[selectedDistrict];
    const lat = gpsCoordinates?.lat ?? coords?.lat ?? 13.0827;
    const lon = gpsCoordinates?.lon ?? coords?.lon ?? 80.2707;

    fetch(`/api/weather?district=${encodeURIComponent(selectedDistrict)}&lat=${lat}&lon=${lon}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather telemetry");
        return res.json();
      })
      .then((data: WeatherNormalizedPayload) => {
        if (isMounted) {
          setLiveWeather(data);
          setWeatherLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== "AbortError") {
          setWeatherLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedDistrict, gpsCoordinates]);

  // Handle GPS location request
  const handleUseGPS = useCallback(() => {
    requestLocation();
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setGpsCoordinates({ lat, lon });
          setLocationSource("gps");

          let nearestDist = "Chennai";
          let minDistance = Infinity;
          for (const [dist, coords] of Object.entries(DISTRICT_COORDINATES)) {
            const d = Math.hypot(coords.lat - lat, coords.lon - lon);
            if (d < minDistance) {
              minDistance = d;
              nearestDist = dist;
            }
          }
          setDistrictOverride(nearestDist);
        },
        () => {
          // Fallback to manual
        }
      );
    }
  }, [requestLocation]);

  // Active Weather Resolution
  const isLive = Boolean(liveWeather?.metadata?.isLive);
  const activeWeather: WeatherData = useMemo(() => {
    if (liveWeather?.current) return liveWeather.current;
    return {
      locationName: `${selectedDistrict}, Tamil Nadu`,
      district: selectedDistrict,
      state: "Tamil Nadu",
      temperatureC: 28,
      feelsLikeC: 30,
      humidityPercent: 65,
      windSpeedKmh: 12,
      rainfallMm24h: 0,
      uvIndex: 4,
      conditionCategory: "partly_cloudy",
      conditionDescription: "Partly cloudy with safe environmental baseline",
      updatedAt: "Just now",
    };
  }, [liveWeather, selectedDistrict]);

  // Active UserProfile
  const activeProfile: UserProfile = useMemo(() => ({
    id: user?.id || "active_user",
    state: "Tamil Nadu",
    district: selectedDistrict,
    city: selectedDistrict,
    latitude: gpsCoordinates?.lat ?? DISTRICT_COORDINATES[selectedDistrict]?.lat ?? 13.0827,
    longitude: gpsCoordinates?.lon ?? DISTRICT_COORDINATES[selectedDistrict]?.lon ?? 80.2707,
    locationSource,
    occupation: selectedOccupation,
    language: userProfile?.language || "en",
    notificationPreferences: userProfile?.notificationPreferences || {
      heavyRainfall: true,
      officialClosures: true,
      heatwavesAndDrought: true,
      travelDisruptions: true,
      agriculturalImpact: true,
    },
  }), [user, userProfile, selectedDistrict, selectedOccupation, locationSource, gpsCoordinates]);

  // Step 3 AI Risk Analysis Output
  const riskAnalysis = useMemo(
    () => analyzeWeatherRisk(activeWeather, selectedOccupation),
    [activeWeather, selectedOccupation]
  );

  // Step 4 District Intelligence Output
  const districtIntel = useMemo(
    () =>
      calculateDistrictIntelligence(
        selectedDistrict,
        activeWeather,
        riskAnalysis,
        undefined,
        isLive,
        liveWeather?.metadata?.providerName || "Open-Meteo High-Res Engine"
      ),
    [selectedDistrict, activeWeather, riskAnalysis, isLive, liveWeather]
  );

  // Step 5 Official Alerts Resolution (Strict Ground Truth)
  const activeAlerts = useMemo(() => {
    if (isLive && activeWeather.rainfallMm24h < 40 && riskAnalysis.overallScore < 70) {
      return [];
    }
    if (selectedDistrict === "Chennai" && activeWeather.rainfallMm24h >= 80) {
      return MOCK_PERSONAS.chennai_student.alerts;
    }
    return [];
  }, [isLive, activeWeather.rainfallMm24h, riskAnalysis.overallScore, selectedDistrict]);

  const verifiedAlerts = useMemo(
    () =>
      activeAlerts.map((alert) => ({
        alert,
        report: verifyOfficialAlert(alert),
      })),
    [activeAlerts]
  );

  // Step 6 Personalized Recommendation Output
  const recommendation = useMemo(
    () =>
      generatePersonalizedRecommendation(
        activeProfile,
        activeWeather,
        riskAnalysis,
        districtIntel,
        activeAlerts,
        verifiedAlerts.map((v) => v.report),
        isLive
      ),
    [activeProfile, activeWeather, riskAnalysis, districtIntel, activeAlerts, verifiedAlerts, isLive]
  );

  // Composite Persona for Pipeline Inspector
  const compositePersona: PersonaPreset = useMemo(() => ({
    id: `persona_${selectedDistrict.toLowerCase()}_${selectedOccupation}`,
    name: `${selectedDistrict} ${selectedOccupation.charAt(0).toUpperCase() + selectedOccupation.slice(1)}`,
    subtitle: `Active Profile · ${selectedDistrict} District`,
    profile: activeProfile,
    weather: activeWeather,
    district: districtIntel,
    alerts: activeAlerts,
    recommendation: {
      id: `rec_${selectedDistrict.toLowerCase()}_${selectedOccupation}`,
      occupation: selectedOccupation,
      district: selectedDistrict,
      riskScore: riskAnalysis.overallScore,
      priority:
        recommendation.severity === "emergency" || recommendation.severity === "severe"
          ? "urgent"
          : recommendation.severity === "high" || recommendation.severity === "moderate"
          ? "recommended"
          : "info",
      headline: {
        en: recommendation.primaryDirective.en,
        ta: recommendation.primaryDirective.ta,
      },
      keyActions: {
        en: recommendation.safetyActions.en,
        ta: recommendation.safetyActions.ta,
      },
      travelAdvice: {
        en: recommendation.safetyActions.en[0] || "Safe travel conditions.",
        ta: recommendation.safetyActions.ta?.[0],
      },
      generatedAt: "Just now",
    },
    notificationReason: `Matched ${selectedOccupation.toUpperCase()} profile in ${selectedDistrict} District with 100% telemetry relevance.`,
  }), [selectedDistrict, selectedOccupation, activeProfile, activeWeather, districtIntel, activeAlerts, riskAnalysis, recommendation]);

  // Clean severity badge
  const getSeverityLabel = (score: number) => {
    if (score >= 80) return "CRITICAL RISK";
    if (score >= 60) return "HIGH RISK";
    if (score >= 40) return "MODERATE ADVISORY";
    return "LOW RISK";
  };

  const riskLabel = getSeverityLabel(riskAnalysis.overallScore);

  // =========================================================================
  // VIEW MODE 1: CINEMATIC LANDING PAGE (Default for Root URL)
  // =========================================================================
  if (viewMode === "landing") {
    return (
      <LandingPage
        onExploreDashboard={handleExploreDashboard}
      />
    );
  }

  // =========================================================================
  // VIEW MODE 2: DASHBOARD WORKSPACE (Preserves all 8 Tab Views & Features)
  // =========================================================================
  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isLive={isLive}
      selectedDistrict={selectedDistrict}
      selectedOccupation={selectedOccupation}
    >
      {/* Return to Landing Page Quick Banner */}
      <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-[#07111e] px-4 py-2.5 text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <span>Interactive Command Workspace</span>
        </span>
        <button
          onClick={() => {
            setViewMode("landing");
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", window.location.pathname);
            }
          }}
          className="inline-flex items-center gap-1 text-sky-300 hover:text-white font-semibold hover:underline"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW                                                           */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-10">
          {/* Centered Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#0a1628] px-3.5 py-1 text-xs font-mono font-medium text-sky-300 shadow-[0_0_12px_-2px_rgba(56,189,248,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>
                {SIH_PROBLEM_CODE} · Smart India Hackathon 2026 · Phase {CURRENT_PHASE}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Personalized Weather Intelligence.<br />
              <span className="text-gradient-cyan">Zero Announcement Fatigue.</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              WeatherGPT combines live weather, district intelligence, verified official updates, and your personal context to deliver only what matters to you.
            </p>
          </div>

          {/* 1. LIVE WEATHER MAP */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  01 / Geographic Context
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Live Weather Map
                </h2>
              </div>
            </div>

            <LiveWeatherMap
              selectedDistrict={selectedDistrict}
              gpsCoordinates={gpsCoordinates}
              locationSource={locationSource}
              updatedAt={activeWeather.updatedAt}
              onUseGPS={handleUseGPS}
              gpsLoading={permissionState === "requesting"}
            />
          </section>

          {/* 2. DISTRICT TELEMETRY */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  02 / Real-time Sensors
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  District Telemetry ({selectedDistrict} District)
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Source: <strong className="text-sky-300 font-semibold">{liveWeather?.metadata?.providerName || "Open-Meteo High-Res Engine"}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-sky-400" />
                  {activeWeather.updatedAt}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {/* Temperature */}
              <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Temperature</span>
                  <Thermometer className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {weatherLoading ? "..." : `${activeWeather.temperatureC}°C`}
                </p>
                <span className="text-[10px] text-slate-500 block">Ambient dry-bulb</span>
              </div>

              {/* Feels Like */}
              <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Feels Like</span>
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {weatherLoading ? "..." : `${activeWeather.feelsLikeC}°C`}
                </p>
                <span className="text-[10px] text-slate-500 block">Heat index load</span>
              </div>

              {/* Rainfall */}
              <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">24h Rain</span>
                  <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {activeWeather.rainfallMm24h} <span className="text-xs text-slate-400 font-normal">mm</span>
                </p>
                <span className="text-[10px] text-slate-500 block">Precipitation depth</span>
              </div>

              {/* Wind */}
              <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Wind</span>
                  <Wind className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {activeWeather.windSpeedKmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
                </p>
                <span className="text-[10px] text-slate-500 block">Surface velocity</span>
              </div>

              {/* Humidity */}
              <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Humidity</span>
                  <Droplets className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {activeWeather.humidityPercent}%
                </p>
                <span className="text-[10px] text-slate-500 block">Relative vapor</span>
              </div>

              {/* UV Index */}
              <div className="rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">UV Index</span>
                  <Sun className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {activeWeather.uvIndex} <span className="text-xs text-slate-400 font-normal">/ 11</span>
                </p>
                <span className="text-[10px] text-slate-500 block">Solar radiation</span>
              </div>

              {/* Weather Condition */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-xl border border-[#142a47] bg-[#0a1628]/90 p-3.5 space-y-1 shadow-sm hover:border-sky-500/30 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Condition</span>
                  <CloudSun className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="text-xs font-bold text-white truncate pt-1">
                  {activeWeather.conditionDescription}
                </p>
                <span className="text-[10px] text-slate-500 block capitalize">{activeWeather.conditionCategory.replace("_", " ")}</span>
              </div>
            </div>
          </section>

          {/* 3. LOCATION & ENVIRONMENTAL CONTEXT */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                03 / Location &amp; Environment
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Location &amp; Environmental Context
              </h2>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 sm:p-6 shadow-md space-y-4 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* District Switcher */}
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-3.5 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-sky-400 block font-semibold">
                    District &amp; State
                  </span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setDistrictOverride(e.target.value);
                      setLocationSource("manual");
                    }}
                    className="w-full bg-[#0a1628] border border-[#1e3f68] rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:border-sky-400 focus:outline-none transition-colors"
                  >
                    {DISTRICT_OPTIONS.map((dist) => (
                      <option key={dist} value={dist} className="bg-[#0a1628] text-white">
                        {dist} District, Tamil Nadu
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Administrative Region: Northern / Coastal TN
                  </p>
                </div>

                {/* Coordinates & Positioning */}
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-3.5 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-sky-400 block font-semibold">
                    Geospatial Coordinates
                  </span>
                  <p className="text-sm font-bold text-white font-mono">
                    {activeProfile.latitude.toFixed(4)}°N, {activeProfile.longitude.toFixed(4)}°E
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Fix Source: {locationSource === "gps" ? "Active Live GPS" : "District Administrative Node"}
                  </p>
                </div>

                {/* Current Weather Snapshot */}
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-3.5 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-sky-400 block font-semibold">
                    Atmospheric Baseline
                  </span>
                  <p className="text-xs font-bold text-white">
                    {activeWeather.conditionDescription}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Temperature {activeWeather.temperatureC}°C · Feels {activeWeather.feelsLikeC}°C
                  </p>
                </div>

                {/* Active Occupation Profile */}
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-3.5 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-sky-400 block font-semibold">
                    Active Profile Occupation
                  </span>
                  <select
                    value={selectedOccupation}
                    onChange={(e) => setOccupationOverride(e.target.value as OccupationKey)}
                    className="w-full bg-[#0a1628] border border-[#1e3f68] rounded-lg px-2.5 py-1.5 text-xs font-bold text-white capitalize focus:border-sky-400 focus:outline-none transition-colors"
                  >
                    {OCCUPATION_KEYS.map((occ) => (
                      <option key={occ} value={occ} className="bg-[#0a1628] text-white capitalize">
                        {occ}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Tailors risk threshold to transit &amp; exposure
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. RISK OVERVIEW */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  04 / Impact Analytics
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Risk Overview
                </h2>
              </div>
              <span className="rounded-full border border-sky-500/30 bg-[#0a1628] px-3 py-0.5 text-xs font-bold font-mono text-sky-300 shadow-sm">
                {riskLabel}
              </span>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-5 shadow-md backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase font-mono block">
                    Personal Weather Risk Index
                  </span>
                  <span className="text-xs text-slate-400">
                    Mathematically calculated for <strong className="text-white capitalize">{selectedOccupation}</strong> in <strong className="text-white">{selectedDistrict}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-sky-400 font-mono">
                    {riskAnalysis.overallScore}
                  </span>
                  <span className="text-sm text-slate-500 font-normal font-mono"> / 100</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#040810] border border-[#142a47] p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(4, riskAnalysis.overallScore))}%` }}
                />
              </div>

              {/* Rationale Box */}
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1 text-xs">
                <span className="text-sky-300 font-bold block font-mono">Why this risk score exists:</span>
                <p className="text-slate-300 leading-relaxed">
                  {riskAnalysis.explanation}
                </p>
              </div>

              {/* 5 Risk Sub-Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                <div className="bg-[#07111e] border border-[#142a47] p-3 rounded-xl text-center space-y-1 hover:border-sky-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase block">Rain Risk</span>
                  <span className="text-base font-bold text-sky-400">{riskAnalysis.subScores.rainRisk}/100</span>
                  <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: `${riskAnalysis.subScores.rainRisk}%` }} />
                  </div>
                </div>

                <div className="bg-[#07111e] border border-[#142a47] p-3 rounded-xl text-center space-y-1 hover:border-sky-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase block">Solar UV</span>
                  <span className="text-base font-bold text-sky-400">{riskAnalysis.subScores.uvRisk}/100</span>
                  <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: `${riskAnalysis.subScores.uvRisk}%` }} />
                  </div>
                </div>

                <div className="bg-[#07111e] border border-[#142a47] p-3 rounded-xl text-center space-y-1 hover:border-sky-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase block">Wind Risk</span>
                  <span className="text-base font-bold text-sky-400">{riskAnalysis.subScores.windRisk}/100</span>
                  <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: `${riskAnalysis.subScores.windRisk}%` }} />
                  </div>
                </div>

                <div className="bg-[#07111e] border border-[#142a47] p-3 rounded-xl text-center space-y-1 hover:border-sky-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase block">Heat Risk</span>
                  <span className="text-base font-bold text-sky-400">{riskAnalysis.subScores.heatRisk}/100</span>
                  <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: `${riskAnalysis.subScores.heatRisk}%` }} />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-[#07111e] border border-[#142a47] p-3 rounded-xl text-center space-y-1 hover:border-sky-500/30 transition-colors">
                  <span className="text-[10px] text-slate-400 uppercase block">Travel Risk</span>
                  <span className="text-base font-bold text-sky-400">{Math.round((riskAnalysis.subScores.rainRisk + riskAnalysis.subScores.windRisk) / 2)}/100</span>
                  <div className="h-1 w-full bg-[#040810] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: `${Math.round((riskAnalysis.subScores.rainRisk + riskAnalysis.subScores.windRisk) / 2)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. OFFICIAL ALERTS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  05 / Ground Truth
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Official Alerts &amp; Orders
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#0a1628] text-sky-300 border border-sky-500/30 px-3 py-0.5 rounded-full shadow-sm">
                {activeAlerts.length > 0 ? `${activeAlerts.length} Active Bulletin` : "Verified Normal"}
              </span>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md backdrop-blur-sm">
              {activeAlerts.length > 0 ? (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{alert.title}</span>
                        <span className="text-[10px] font-mono uppercase bg-[#0a1628] text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                        &quot;{alert.rawAnnouncement}&quot;
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#142a47]/80 text-[10px] text-slate-400">
                        <span>Authority: <strong className="text-white">{alert.sourceName}</strong></span>
                        {alert.officialRefUrl && (
                          <a
                            href={alert.officialRefUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-400 hover:underline font-mono"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Source Bulletin</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-6 text-center space-y-2">
                  <CheckCircle2 className="h-7 w-7 text-sky-400 mx-auto" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    NO VERIFIED OFFICIAL ALERTS
                  </h3>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                    No verified official government alert is currently available for your location. Normal administrative and educational operations are currently in effect for {selectedDistrict} District.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 6. IMPACT ON YOU */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  06 / Personalized Impact
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Impact on You
                </h2>
              </div>
              <span className="text-[10px] font-mono text-sky-300 capitalize bg-[#0a1628] border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                {selectedOccupation} Profile
              </span>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md backdrop-blur-sm">
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1.5 text-xs">
                <span className="text-white font-bold text-sm block">
                  Because you&apos;re a {selectedOccupation.charAt(0).toUpperCase() + selectedOccupation.slice(1)} in {selectedDistrict}...
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {riskAnalysis.occupationImpact}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold block">
                  Routine, Commute &amp; Exposure Guidelines:
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {riskAnalysis.recommendedPrecautions.map((prec, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[#142a47] bg-[#07111e] p-3 text-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 7. FOR YOU */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  07 / Action Directives
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  For You (Personalized Recommendation)
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-sky-300 bg-[#0a1628] border border-sky-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                {recommendation.severity}
              </span>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md backdrop-blur-sm">
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block font-semibold">
                  Primary Action Directive
                </span>
                <p className="text-base font-bold text-white leading-snug">
                  {recommendation.primaryDirective.en}
                </p>
                {recommendation.primaryDirective.ta && (
                  <p className="text-xs text-slate-400 pt-2 border-t border-[#142a47]/80">
                    தமிழ்: {recommendation.primaryDirective.ta}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block font-semibold">
                  Action Protocol &amp; Precaution Checklist:
                </span>
                <div className="space-y-1.5">
                  {recommendation.safetyActions.en.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[#142a47] bg-[#07111e] p-3 text-slate-200">
                      <span className="font-mono font-bold text-sky-400">0{i + 1}.</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 8. DISTRICT INTELLIGENCE */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  08 / Local Breakdown
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  District Intelligence ({selectedDistrict} District, {districtIntel.state})
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Dominant Hazard:</span>
                <span className="text-sky-300 font-bold">{districtIntel.dominantHazard}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md backdrop-blur-sm">
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                {districtIntel.affectedAreas.map((area) => (
                  <div key={area.name} className="rounded-xl border border-[#142a47] bg-[#07111e] p-3.5 space-y-1.5 hover:border-sky-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{area.name}</span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border border-sky-500/30 bg-[#0a1628] text-sky-300">
                        {area.waterloggingRisk}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">{area.subdivision}</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{area.disruptionLevel}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-[#142a47]">
                <span>District Helpline: <strong className="text-sky-300">{districtIntel.emergencyContacts.helpline}</strong></span>
                <span>Control Room: <strong className="text-sky-300">{districtIntel.emergencyContacts.controlRoom}</strong></span>
              </div>
            </div>
          </section>

          {/* 9. RIGHT INFORMATION. RIGHT USER. */}
          <section className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
            <div className="max-w-3xl space-y-2 text-center mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#07111e] px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-[0_0_12px_-2px_rgba(56,189,248,0.25)]">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                <span>Ground Truth Verification Standard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Right Information. Right User.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                WeatherGPT filters live weather, verified official information, district intelligence, and your personal context to deliver only what matters to you.
              </p>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1.5 hover:border-sky-500/30 transition-colors">
                <span className="font-mono text-[10px] uppercase text-sky-400 font-semibold">01 · Ground Truth</span>
                <p className="font-bold text-white text-sm">Verified Official Sources</p>
                <p className="text-[11px] text-slate-400">Untouched District Collectorate and IMD bulletins.</p>
              </div>

              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1.5 hover:border-sky-500/30 transition-colors">
                <span className="font-mono text-[10px] uppercase text-sky-400 font-semibold">02 · Verification</span>
                <p className="font-bold text-white text-sm">AI Fact Extraction</p>
                <p className="text-[11px] text-slate-400">Strict fact extraction with zero hallucinated emergency orders.</p>
              </div>

              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1.5 hover:border-sky-500/30 transition-colors">
                <span className="font-mono text-[10px] uppercase text-sky-400 font-semibold">03 · Tailored</span>
                <p className="font-bold text-white text-sm">Personalized For You</p>
                <p className="text-[11px] text-slate-400">Targeted to your occupation, transit routine, and district.</p>
              </div>

              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1.5 hover:border-sky-500/30 transition-colors">
                <span className="font-mono text-[10px] uppercase text-sky-400 font-semibold">04 · Zero Fatigue</span>
                <p className="font-bold text-white text-sm">Actionable Intelligence</p>
                <p className="text-[11px] text-slate-400">Clear safety directives while suppressing irrelevant district spam.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE WEATHER                                                       */}
      {/* ========================================================================= */}
      {activeTab === "weather" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Live Weather Telemetry</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              High-resolution meteorological sensor stream for <strong className="text-white">{selectedDistrict} District</strong>.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-3 shadow-md hover:border-sky-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Thermal Metrics</span>
                <Thermometer className="h-4 w-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.temperatureC}°C</p>
                <p className="text-xs text-slate-400 font-mono">Feels like {activeWeather.feelsLikeC}°C</p>
              </div>
              <div className="pt-3 border-t border-[#142a47] text-[11px] text-slate-400">
                Condition: <strong className="text-white capitalize">{activeWeather.conditionDescription}</strong>
              </div>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-3 shadow-md hover:border-sky-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Precipitation &amp; Moisture</span>
                <CloudRain className="h-4 w-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.rainfallMm24h} mm</p>
                <p className="text-xs text-slate-400 font-mono">Relative Humidity: {activeWeather.humidityPercent}%</p>
              </div>
              <div className="pt-3 border-t border-[#142a47] text-[11px] text-slate-400">
                24h Inundation Load: <strong className="text-white">{activeWeather.rainfallMm24h > 20 ? "Elevated" : "Normal"}</strong>
              </div>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-3 shadow-md hover:border-sky-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Wind &amp; Solar Radiation</span>
                <Wind className="h-4 w-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.windSpeedKmh} km/h</p>
                <p className="text-xs text-slate-400 font-mono">UV Index: {activeWeather.uvIndex} / 11</p>
              </div>
              <div className="pt-3 border-t border-[#142a47] text-[11px] text-slate-400">
                Solar Hazard: <strong className="text-white">{activeWeather.uvIndex > 6 ? "High Exposure" : "Moderate"}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Geographic Location &amp; Sensor Coordinates
            </h3>
            <div className="grid gap-3 sm:grid-cols-3 text-xs font-mono">
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1">
                <span className="text-sky-400 uppercase text-[10px] block">Latitude</span>
                <span className="font-bold text-white text-sm">{activeProfile.latitude.toFixed(4)}°N</span>
              </div>
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1">
                <span className="text-sky-400 uppercase text-[10px] block">Longitude</span>
                <span className="font-bold text-white text-sm">{activeProfile.longitude.toFixed(4)}°E</span>
              </div>
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1">
                <span className="text-sky-400 uppercase text-[10px] block">Provider</span>
                <span className="font-bold text-white text-sm truncate">{liveWeather?.metadata?.providerName || "Open-Meteo High-Res"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RISK & IMPACT                                                      */}
      {/* ========================================================================= */}
      {activeTab === "risk" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Risk &amp; Impact Analysis</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Deterministic mathematical hazard modeling tailored to <strong className="text-white capitalize">{selectedOccupation}</strong> in <strong className="text-white">{selectedDistrict} District</strong>.
            </p>
          </div>

          <RiskMeter
            score={riskAnalysis.overallScore}
            reason={riskAnalysis.explanation}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-400" />
                <span>Environmental Hazard Breakdown</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Precipitation Inundation Hazard</span>
                    <span className="text-sky-400 font-bold">{riskAnalysis.subScores.rainRisk}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#040810] rounded-full overflow-hidden border border-[#142a47]">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${riskAnalysis.subScores.rainRisk}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Thermal Heat Stress Load</span>
                    <span className="text-sky-400 font-bold">{riskAnalysis.subScores.heatRisk}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#040810] rounded-full overflow-hidden border border-[#142a47]">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${riskAnalysis.subScores.heatRisk}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Wind Velocity Impact</span>
                    <span className="text-sky-400 font-bold">{riskAnalysis.subScores.windRisk}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#040810] rounded-full overflow-hidden border border-[#142a47]">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${riskAnalysis.subScores.windRisk}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Solar UV Radiation Exposure</span>
                    <span className="text-sky-400 font-bold">{riskAnalysis.subScores.uvRisk}/100</span>
                  </div>
                  <div className="h-2 w-full bg-[#040810] rounded-full overflow-hidden border border-[#142a47]">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${riskAnalysis.subScores.uvRisk}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-sky-400" />
                <span>Occupational Vulnerability Analysis</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1.5">
                  <span className="font-bold text-white block">Active Profile: {selectedOccupation.toUpperCase()}</span>
                  <p className="text-slate-300 leading-relaxed">{riskAnalysis.occupationImpact}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-sky-400 block">Standard Precautions</span>
                  <ul className="space-y-1.5 text-slate-300">
                    {riskAnalysis.recommendedPrecautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OFFICIAL ALERTS                                                    */}
      {/* ========================================================================= */}
      {activeTab === "alerts" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Official Alerts &amp; Orders</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Verified administrative bulletins issued by District Collectorates, Disaster Management Authorities, and the IMD.
            </p>
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-[#142a47] pb-3">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                <span>Active District Bulletins ({selectedDistrict})</span>
              </h3>
              <span className="text-xs font-mono text-sky-400">
                {activeAlerts.length} Official Bulletins Ingested
              </span>
            </div>

            {activeAlerts.length > 0 ? (
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{alert.title}</span>
                      <span className="text-[10px] font-mono uppercase bg-[#0a1628] text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                        {alert.severity}
                      </span>
                    </div>
                    <div className="rounded-lg bg-[#0a1628] p-3 font-mono text-slate-300 text-[11px] leading-relaxed border border-[#142a47]">
                      &quot;{alert.rawAnnouncement}&quot;
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#142a47]/80 text-[11px] text-slate-400">
                      <span>Issuing Authority: <strong className="text-white">{alert.sourceName}</strong></span>
                      {alert.officialRefUrl && (
                        <a
                          href={alert.officialRefUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-400 hover:underline font-mono"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Official Bulletin</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-8 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-sky-400 mx-auto" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  NO VERIFIED OFFICIAL ALERTS
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  No verified official government alert is currently available for your location. Normal administrative and educational operations are currently in effect for {selectedDistrict} District.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-3 shadow-md">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono text-sky-300">
              Ground-Truth Verification Protocol
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              WeatherGPT implements deterministic authority checking: alerts are only passed into the pipeline when matched against verified government domains (e.g. `chennai.nic.in`, `tnsdma.tn.gov.in`, `mausam.imd.gov.in`). The AI engine never fabricates closures or orders.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FOR YOU                                                            */}
      {/* ========================================================================= */}
      {activeTab === "recommendations" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Personalized For You</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Direct, contextual safety directives synthesized for a <strong className="text-white capitalize">{selectedOccupation}</strong> in <strong className="text-white">{selectedDistrict} District</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold block">
                Primary Directive
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {recommendation.primaryDirective.en}
              </h3>
              {recommendation.primaryDirective.ta && (
                <p className="text-xs sm:text-sm text-slate-400 pt-2 border-t border-[#142a47]">
                  தமிழ்: {recommendation.primaryDirective.ta}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold block">
                Action Protocol &amp; Checklist
              </span>
              <div className="space-y-2">
                {recommendation.safetyActions.en.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-[#142a47] bg-[#07111e] p-3.5 text-xs text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#142a47] text-xs font-mono text-slate-400">
              <span>Severity Classification: <strong className="text-sky-300 uppercase">{recommendation.severity}</strong></span>
              <span>Grounding: <strong className="text-white">{isLive ? "Live Telemetry" : "Preset Mode"}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DISTRICT INTELLIGENCE                                              */}
      {/* ========================================================================= */}
      {activeTab === "district" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">District Intelligence</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              District-wide telemetry, subdivision risk profiles, and official disaster control contacts for <strong className="text-white">{selectedDistrict} District</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-4 shadow-md backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#142a47] pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Subdivision Vulnerability Matrix
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Dominant Hazard: <strong className="text-sky-300">{districtIntel.dominantHazard}</strong>
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              {districtIntel.affectedAreas.map((area) => (
                <div key={area.name} className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-2 hover:border-sky-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{area.name}</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border border-sky-500/30 bg-[#0a1628] text-sky-300">
                      {area.waterloggingRisk}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">{area.subdivision}</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{area.disruptionLevel}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-2 text-xs font-mono">
              <span className="text-sky-400 uppercase text-[10px] block font-semibold">Emergency Control Network</span>
              <div className="flex flex-wrap gap-6 text-slate-300">
                <span>District Disaster Helpline: <strong className="text-sky-300">{districtIntel.emergencyContacts.helpline}</strong></span>
                <span>Collectorate Control Room: <strong className="text-sky-300">{districtIntel.emergencyContacts.controlRoom}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: 7-STEP FLOW                                                        */}
      {/* ========================================================================= */}
      {activeTab === "pipeline" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">7-Step Intelligence Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              The deterministic 7-step pipeline powering WeatherGPT from raw sensor telemetry to targeted user dispatch.
            </p>
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-8 shadow-xl backdrop-blur-sm">
            <ProductFlowVisualizer
              activeStep={activePipelineStep}
              onStepSelect={(step) => setActivePipelineStep(step)}
            />

            <div className="rounded-2xl border border-[#142a47] bg-[#07111e] p-6 sm:p-8">
              <StepPipelinePreview activeStep={activePipelineStep} persona={compositePersona} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: TRUST MODEL                                                        */}
      {/* ========================================================================= */}
      {activeTab === "trust" && (
        <div className="space-y-8">
          <div className="space-y-2 border-b border-[#142a47] pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">WeatherGPT Trust Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Core architectural principles ensuring zero hallucinated closures and 100% grounded meteorological intelligence.
            </p>
          </div>

          <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
            <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-2">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold block">Separation of Concerns Principle</span>
              <p className="text-sm font-semibold text-white leading-relaxed">
                DATA → AI ANALYSIS → OFFICIAL INFORMATION → PERSONALIZED RECOMMENDATION
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                AI does not make government decisions. Official authorities remain the sole source for closures, disaster declarations, and administrative orders.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CORE_DIFFERENTIATORS.map((diff, index) => (
                <div
                  key={diff}
                  className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 flex flex-col justify-between space-y-3 hover:border-sky-500/30 transition-colors"
                >
                  <span className="font-mono font-bold text-xl text-sky-400/40">
                    0{index + 1}
                  </span>
                  <h3 className="font-semibold text-xs text-slate-200 leading-snug">
                    {diff}
                  </h3>
                  <div className="pt-2 border-t border-[#142a47] flex items-center gap-1.5 text-[10px] text-sky-300 font-mono">
                    <CheckCircle2 className="h-3 w-3 text-sky-400" />
                    <span>Verified Standard</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
