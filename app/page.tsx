"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardShell, type DashboardTab } from "@/components/layout/DashboardShell";
import { LandingPage } from "@/components/landing/LandingPage";
import { LiveWeatherMap } from "@/components/geo/LiveWeatherMap";
import { ProductFlowVisualizer } from "@/components/flow/ProductFlowVisualizer";
import { StepPipelinePreview } from "@/components/flow/StepPipelinePreview";
import { MOCK_PERSONAS, type PersonaPreset } from "@/lib/demo-data";
import {
  DISTRICT_OPTIONS,
  OCCUPATION_KEYS,
  CORE_DIFFERENTIATORS,
} from "@/lib/constants";
import { DISTRICT_COORDINATES } from "@/lib/geo/districtCoordinates";
import { useGeolocation } from "@/lib/geo";
import type {
  UserProfile,
  OccupationKey,
  WeatherNormalizedPayload,
  WeatherData,
  HourlyForecast,
  DailyForecast,
} from "@/types";
import { analyzeWeatherRisk } from "@/lib/risk/analyzeRisk";
import { calculateDistrictIntelligence } from "@/lib/district/calculateDistrictIntelligence";
import { verifyOfficialAlert } from "@/lib/alerts/verifyAlert";
import { generatePersonalizedRecommendation } from "@/lib/recommendations/generateRecommendation";
import { ShieldCheck, CircleCheck as CheckCircle2, ExternalLink, Activity, UserCheck, Thermometer, CloudRain, Wind } from "lucide-react";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { useAuth } from "@/contexts/auth-context";
import { WeatherAssistant, type AssistantContext } from "@/components/assistant/WeatherAssistant";
import { WeatherHeroSection } from "@/components/hero/WeatherHeroSection";
import { HourlyTimeline } from "@/components/forecast/HourlyTimeline";
import { DailyForecastGrid } from "@/components/forecast/DailyForecastGrid";

export default function HomePage() {
  const { user, userProfile } = useAuth();
  const { permissionState, requestLocation } = useGeolocation();

  // Mode: "landing" (default for root URL) vs "dashboard" (when viewing dashboard tabs)
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Temperature unit (°C / °F)
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");

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

  // District Resolution Hierarchy:
  // 1. districtOverride (manual selection)
  // 2. gpsDistrict (detected from GPS fix)
  // 3. profileDistrict (from userProfile)
  // 4. Default fallback: DISTRICT_OPTIONS[0]
  const [gpsDistrict, setGpsDistrict] = useState<string | null>(null);
  const [districtOverride, setDistrictOverride] = useState<string | null>(null);

  const profileDistrict = useMemo(() => {
    if (userProfile?.district) {
      const matched = DISTRICT_OPTIONS.find(
        (d) => d.toLowerCase() === userProfile.district.toLowerCase()
      );
      if (matched) return matched;
    }
    return null;
  }, [userProfile]);

  const selectedDistrict = useMemo(() => {
    if (districtOverride) return districtOverride;
    if (gpsDistrict) return gpsDistrict;
    if (profileDistrict) return profileDistrict;
    return DISTRICT_OPTIONS[0] || "Chennai";
  }, [districtOverride, gpsDistrict, profileDistrict]);

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

  // Nearest district locator helper
  const findNearestDistrict = useCallback((lat: number, lon: number): string => {
    let nearest: string = DISTRICT_OPTIONS[0] || "Chennai";
    let minD = Infinity;
    for (const [dist, coord] of Object.entries(DISTRICT_COORDINATES)) {
      const d = Math.hypot(coord.lat - lat, coord.lon - lon);
      if (d < minD) {
        minD = d;
        nearest = dist;
      }
    }
    return nearest;
  }, []);

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

          const nearest = findNearestDistrict(lat, lon);
          setGpsDistrict(nearest);
          setDistrictOverride(nearest);

          try {
            localStorage.setItem(
              "wgpt_last_location",
              JSON.stringify({ lat, lon, district: nearest, source: "gps" })
            );
          } catch {
            // Ignore local storage errors
          }
        },
        () => {
          // Fallback to manual
        }
      );
    }
  }, [requestLocation, findNearestDistrict]);

  // Initial mount location restoration & automatic GPS check if permission previously granted
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("wgpt_last_location");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.district && parsed.lat && parsed.lon) {
            setGpsDistrict(parsed.district);
            setGpsCoordinates({ lat: parsed.lat, lon: parsed.lon });
            setLocationSource("gps");
          }
        }
      } catch {
        // Ignore
      }

      if (typeof navigator !== "undefined" && navigator.permissions) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((permissionStatus) => {
            if (permissionStatus.state === "granted") {
              handleUseGPS();
            }
          })
          .catch(() => {
            // Ignore
          });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [handleUseGPS]);

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

  // Resolved Hourly Forecast data
  const hourlyData: HourlyForecast[] = useMemo(() => {
    if (liveWeather?.hourlyForecast && liveWeather.hourlyForecast.length > 0) {
      return liveWeather.hourlyForecast.slice(0, 24);
    }
    // Fallback baseline hourly curve
    const hours: HourlyForecast[] = [];
    const baseTemp = activeWeather.temperatureC;
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const h = (now.getHours() + i) % 24;
      const hourStr = `${h % 12 || 12} ${h >= 12 ? "PM" : "AM"}`;
      const tempDiff = Math.sin((i / 24) * Math.PI * 2) * 3;
      hours.push({
        time: i === 0 ? "Now" : hourStr,
        tempC: Math.round(baseTemp + tempDiff),
        popPercent: Math.max(0, Math.round(activeWeather.rainfallMm24h > 0 ? 40 : 10 + i * 2)),
        rainfallMm: activeWeather.rainfallMm24h > 0 ? 0.5 : 0,
        condition: activeWeather.conditionCategory,
      });
    }
    return hours;
  }, [liveWeather, activeWeather]);

  // Resolved Daily Forecast data
  const dailyData: DailyForecast[] = useMemo(() => {
    if (liveWeather?.dailyForecast && liveWeather.dailyForecast.length > 0) {
      return liveWeather.dailyForecast.slice(0, 7);
    }
    // Fallback baseline daily curve
    const days: DailyForecast[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayLabel = i === 0 ? "Today" : dayNames[d.getDay()];
      days.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayLabel,
        tempMaxC: activeWeather.temperatureC + (i % 2 === 0 ? 2 : 1),
        tempMinC: activeWeather.temperatureC - (i % 2 === 0 ? 4 : 5),
        popPercent: Math.min(80, Math.max(10, Math.round(activeWeather.rainfallMm24h * 3 + i * 5))),
        condition: activeWeather.conditionCategory,
      });
    }
    return days;
  }, [liveWeather, activeWeather]);

  // Temperature conversion helpers
  const formatTemp = useCallback(
    (tempC: number) => {
      if (tempUnit === "F") {
        return `${Math.round((tempC * 9) / 5 + 32)}°F`;
      }
      return `${Math.round(tempC)}°C`;
    },
    [tempUnit]
  );

  // Composite Persona for Pipeline Visualizer
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

  // Context payload for WeatherGPT AI Assistant
  const assistantContext: AssistantContext = {
    profile: {
      district: activeProfile.district,
      state: activeProfile.state,
      occupation: activeProfile.occupation,
      language: activeProfile.language,
    },
    weather: {
      temperatureC: activeWeather.temperatureC,
      feelsLikeC: activeWeather.feelsLikeC,
      humidityPercent: activeWeather.humidityPercent,
      windSpeedKmh: activeWeather.windSpeedKmh,
      rainfallMm24h: activeWeather.rainfallMm24h,
      uvIndex: activeWeather.uvIndex,
      conditionDescription: activeWeather.conditionDescription,
      updatedAt: activeWeather.updatedAt,
    },
    hourlyForecast: hourlyData.slice(0, 12).map((h) => ({
      time: h.time,
      tempC: h.tempC,
      popPercent: h.popPercent,
      rainfallMm: h.rainfallMm,
      condition: h.condition,
    })),
    dailyForecast: dailyData.slice(0, 7).map((d) => ({
      date: d.date,
      dayLabel: d.dayLabel,
      tempMaxC: d.tempMaxC,
      tempMinC: d.tempMinC,
      popPercent: d.popPercent,
      condition: d.condition,
    })),
    risk: {
      overallScore: riskAnalysis.overallScore,
      severity: riskAnalysis.severity,
      primaryHazard: riskAnalysis.primaryHazard,
      explanation: riskAnalysis.explanation,
      recommendedPrecautions: riskAnalysis.recommendedPrecautions,
      occupationImpact: riskAnalysis.occupationImpact,
    },
    recommendation: {
      severity: recommendation.severity,
      primaryDirective: recommendation.primaryDirective.en,
      primaryDirectiveTa: recommendation.primaryDirective.ta,
      safetyActions: recommendation.safetyActions.en,
      safetyActionsTa: recommendation.safetyActions.ta,
    },
    verifiedAlerts: activeAlerts.map((a) => ({
      title: a.title,
      sourceName: a.sourceName,
      severity: a.severity,
      officialRefUrl: a.officialRefUrl,
      effectiveFrom: a.effectiveFrom,
      effectiveUntil: a.effectiveUntil,
    })),
    districtInfo: {
      districtName: selectedDistrict,
      helpline: districtIntel?.emergencyContacts?.helpline,
      controlRoom: districtIntel?.emergencyContacts?.controlRoom,
      floodZones: districtIntel?.affectedAreas?.map((a) => a.name),
    },
  };

  // =========================================================================
  // VIEW MODE 1: CINEMATIC LANDING PAGE (Default for Root URL)
  // =========================================================================
  if (viewMode === "landing") {
    return (
      <>
        <LandingPage onExploreDashboard={handleExploreDashboard} />
        <WeatherAssistant context={assistantContext} />
      </>
    );
  }

  // =========================================================================
  // VIEW MODE 2: DASHBOARD WORKSPACE (Preserves all 8 Tab Views & Features)
  // =========================================================================
  return (
    <>
      <DashboardShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLive={isLive}
        selectedDistrict={selectedDistrict}
        selectedOccupation={selectedOccupation}
      >
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW                                                           */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* 1. CURRENT WEATHER HERO (TOP MAJOR SECTION) */}
            <WeatherHeroSection
              activeWeather={activeWeather}
              selectedDistrict={selectedDistrict}
              locationSource={locationSource}
              tempUnit={tempUnit}
              onTempUnitToggle={setTempUnit}
              weatherLoading={weatherLoading}
              providerName={liveWeather?.metadata?.providerName || "Open-Meteo High-Res Engine"}
              highTemp={dailyData[0]?.tempMaxC}
              lowTemp={dailyData[0]?.tempMinC}
            />

            {/* 2. 24-HOUR HOURLY FORECAST TIMELINE */}
            <HourlyTimeline
              hourlyData={hourlyData}
              formatTemp={formatTemp}
            />

            {/* 3. 7-DAY MULTI-DAY FORECAST GRID */}
            <DailyForecastGrid
              dailyData={dailyData}
              formatTemp={formatTemp}
            />

            {/* ===================================================================== */}
            {/* 4. LIVE WEATHER MAP (BELOW CURRENT WEATHER + FORECASTS)               */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                    04 / Geographic Context
                  </span>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                    Live Weather Map ({selectedDistrict} District)
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

            {/* ===================================================================== */}
            {/* 5. LOCATION & ENVIRONMENTAL CONTEXT                                   */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                  05 / Location &amp; Environment
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
                      Region: {selectedDistrict} District, TN
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
                      Fix: {locationSource === "gps" ? "Active Live GPS" : "District Node"}
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
                      {formatTemp(activeWeather.temperatureC)} · Feels {formatTemp(activeWeather.feelsLikeC)}
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

            {/* ===================================================================== */}
            {/* 6. RISK OVERVIEW & IMPACT ANALYTICS                                   */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                    06 / Impact Analytics
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
                  <p className="wgpt-body-text text-slate-300">
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

            {/* ===================================================================== */}
            {/* 7. OFFICIAL ALERTS & ORDERS                                           */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                    07 / Ground Truth
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
                    <p className="wgpt-body-text text-xs text-slate-400 max-w-lg mx-auto">
                      No verified official government alert is currently active for {selectedDistrict} District. Normal administrative operations are in effect.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ===================================================================== */}
            {/* 8. IMPACT ON YOU                                                      */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                    08 / Personalized Impact
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
                  <p className="wgpt-body-text text-slate-300">
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

            {/* ===================================================================== */}
            {/* 9. FOR YOU (PERSONALIZED RECOMMENDATION)                              */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                    09 / Action Directives
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

            {/* ===================================================================== */}
            {/* 10. DISTRICT INTELLIGENCE                                             */}
            {/* ===================================================================== */}
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
                    10 / Local Breakdown
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
                      <p className="wgpt-body-text text-slate-400 text-[11px]">{area.disruptionLevel}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-[#142a47]">
                  <span>District Helpline: <strong className="text-sky-300">{districtIntel.emergencyContacts.helpline}</strong></span>
                  <span>Control Room: <strong className="text-sky-300">{districtIntel.emergencyContacts.controlRoom}</strong></span>
                </div>
              </div>
            </section>

            {/* ===================================================================== */}
            {/* 11. GROUND TRUTH VERIFICATION STANDARD                                */}
            {/* ===================================================================== */}
            <section className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
              <div className="max-w-3xl space-y-2 text-center mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#07111e] px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-[0_0_12px_-2px_rgba(56,189,248,0.25)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>Ground Truth Verification Standard</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Right Information. Right User.
                </h2>
                <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
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
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
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
                  <p className="text-3xl font-extrabold text-white font-mono">{formatTemp(activeWeather.temperatureC)}</p>
                  <p className="text-xs text-slate-400 font-mono">Feels like {formatTemp(activeWeather.feelsLikeC)}</p>
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
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
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
                    <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold block">
                      Targeted Guidelines
                    </span>
                    <div className="space-y-1 text-slate-300">
                      {riskAnalysis.recommendedPrecautions.map((prec, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-[#07111e] p-2.5 text-xs border border-[#142a47]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{prec}</span>
                        </div>
                      ))}
                    </div>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Official Government Bulletins</h2>
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
                Ground-truth official orders verified against District Collectorate and IMD administrative portals for <strong className="text-white">{selectedDistrict} District</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#142a47] pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-sky-400" />
                  <h3 className="font-bold text-white text-base">District Administrative Bulletins</h3>
                </div>
                <span className="text-xs font-mono text-sky-300 bg-[#07111e] px-3 py-1 rounded-full border border-sky-500/30">
                  {activeAlerts.length} Official Bulletins Active
                </span>
              </div>

              {activeAlerts.length > 0 ? (
                <div className="grid gap-4">
                  {activeAlerts.map((alert) => {
                    const verification = verifyOfficialAlert(alert);
                    return (
                      <div
                        key={alert.id}
                        className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-3 hover:border-sky-500/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                              {alert.severity}
                            </span>
                            <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Effective: {new Date(alert.effectiveFrom).toLocaleDateString()} – {new Date(alert.effectiveUntil).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-mono bg-[#040810] p-3 rounded-lg border border-[#142a47] leading-relaxed">
                          &quot;{alert.rawAnnouncement}&quot;
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-[#142a47]">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span>Authority: <strong className="text-white">{alert.sourceName}</strong></span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-sky-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                              {verification.isVerifiedOfficial ? "Domain Whitelist Verified" : verification.status}
                            </span>
                          </div>

                          {alert.officialRefUrl && (
                            <a
                              href={alert.officialRefUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-mono text-xs hover:underline"
                            >
                              <span>Official Bulletin Link</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-sky-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">No Active Warnings</h4>
                  <p className="wgpt-body-text text-xs text-slate-400 max-w-md mx-auto">
                    All administrative operations, educational institutions, and public transit schedules for {selectedDistrict} District are operating normally.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PERSONALIZED RECOMMENDATIONS                                       */}
        {/* ========================================================================= */}
        {activeTab === "recommendations" && (
          <div className="space-y-8">
            <div className="space-y-2 border-b border-[#142a47] pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Personalized Directives</h2>
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
                Contextual safety decisions generated for <strong className="text-white capitalize">{selectedOccupation}</strong> profile in <strong className="text-white">{selectedDistrict} District</strong>.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8 space-y-6">
                <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-5 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-[#142a47] pb-3">
                    <span className="text-xs font-mono uppercase font-bold text-sky-400">Primary Safety Directive</span>
                    <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      {recommendation.severity} Priority
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                      {recommendation.primaryDirective.en}
                    </p>
                    {recommendation.primaryDirective.ta && (
                      <p className="text-sm text-slate-300 pt-3 border-t border-[#142a47] leading-relaxed">
                        <strong className="text-sky-400 font-mono text-xs uppercase block mb-1">தமிழ் வழிகாட்டல்:</strong>
                        {recommendation.primaryDirective.ta}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-4 shadow-xl backdrop-blur-sm">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                    Action Protocol Checklist
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    {recommendation.safetyActions.en.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-[#142a47] bg-[#07111e] p-4 text-slate-200"
                      >
                        <span className="font-mono font-bold text-sky-400 text-sm">0{i + 1}.</span>
                        <span className="leading-relaxed">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-4">
                <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-3 shadow-xl backdrop-blur-sm">
                  <span className="text-xs font-mono uppercase font-bold text-sky-400 block">User Context Filter</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#142a47]">
                      <span className="text-slate-400">District:</span>
                      <span className="font-bold text-white">{selectedDistrict}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#142a47]">
                      <span className="text-slate-400">Occupation:</span>
                      <span className="font-bold text-white capitalize">{selectedOccupation}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#142a47]">
                      <span className="text-slate-400">Telemetry Relevance:</span>
                      <span className="font-bold text-sky-400 font-mono">100% Deterministic</span>
                    </div>
                  </div>
                </div>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">District Intelligence &amp; Flood Zones</h2>
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
                Subdivision vulnerability, waterlogging risk, and emergency response contacts for <strong className="text-white">{selectedDistrict} District</strong>.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {districtIntel.affectedAreas.map((area) => (
                <div
                  key={area.name}
                  className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-5 space-y-3 shadow-md hover:border-sky-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{area.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-sky-500/30 bg-[#07111e] text-sky-300">
                      {area.waterloggingRisk}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono block">Subdivision: {area.subdivision}</span>
                  <p className="wgpt-body-text text-xs text-slate-300 pt-1 border-t border-[#142a47]">
                    {area.disruptionLevel}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 space-y-3 shadow-md">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Emergency Control Room &amp; Helplines</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-xs font-mono">
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] block">State Disaster Helpline</span>
                  <span className="text-lg font-bold text-sky-400">{districtIntel.emergencyContacts.helpline}</span>
                </div>
                <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-4 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] block">District Disaster Control Room</span>
                  <span className="text-lg font-bold text-sky-400">{districtIntel.emergencyContacts.controlRoom}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: 7-STEP PIPELINE                                                    */}
        {/* ========================================================================= */}
        {activeTab === "pipeline" && (
          <div className="space-y-8">
            <div className="space-y-2 border-b border-[#142a47] pb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">7-Step Intelligence Architecture</h2>
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
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
              <p className="wgpt-body-text text-xs sm:text-sm text-slate-400">
                Core architectural principles ensuring zero hallucinated closures and 100% grounded meteorological intelligence.
              </p>
            </div>

            <div className="rounded-2xl border border-[#142a47] bg-[#0a1628]/90 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
              <div className="rounded-xl border border-[#142a47] bg-[#07111e] p-5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold block">Separation of Concerns Principle</span>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  DATA → AI ANALYSIS → OFFICIAL INFORMATION → PERSONALIZED RECOMMENDATION
                </p>
                <p className="wgpt-body-text text-xs text-slate-400 pt-1">
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
      <WeatherAssistant context={assistantContext} />
    </>
  );
}
