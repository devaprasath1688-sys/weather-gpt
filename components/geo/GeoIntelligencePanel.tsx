"use client";

import React, { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Globe, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LocationControls } from "./LocationControls";
import { WeatherOverlay } from "./WeatherOverlay";
import {
  useGeolocation,
  DISTRICT_COORDINATES,
  DISTRICT_ZOOM,
  TAMIL_NADU_CENTER,
  DEFAULT_ZOOM,
} from "@/lib/geo";
import { analyzeWeatherRisk } from "@/lib/risk/analyzeRisk";
import { calculateDistrictIntelligence } from "@/lib/district/calculateDistrictIntelligence";
import { verifyOfficialAlert } from "@/lib/alerts/verifyAlert";
import { generatePersonalizedRecommendation } from "@/lib/recommendations/generateRecommendation";
import type { PersonaPreset } from "@/lib/demo-data";
import type { WeatherNormalizedPayload } from "@/types";
import { useLanguage } from "@/contexts/language-context";

// Dynamically import InteractiveMap to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(
  () => import("./InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-xs font-mono">{t("map.initializing")}</span>
        </div>
      </div>
    ),
  }
);

type GeoIntelligencePanelProps = {
  persona: PersonaPreset;
};

export function GeoIntelligencePanel({ persona }: GeoIntelligencePanelProps) {
  const { t } = useLanguage();
  const { profile, alerts } = persona;

  // Geolocation
  const { permissionState, position, errorMessage, requestLocation } =
    useGeolocation();

  // User-initiated state only
  const [manualDistrict, setManualDistrict] = useState<string | null>(null);
  const [gpsDistrict, setGpsDistrict] = useState<string | null>(null);
  const [mapOverride, setMapOverride] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [liveWeather, setLiveWeather] = useState<WeatherNormalizedPayload | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Derive location source
  const locationSource: "gps" | "manual" | "demo" =
    position && gpsDistrict ? "gps" : manualDistrict ? "manual" : "demo";

  // Derive selected district
  const selectedDistrict = gpsDistrict ?? manualDistrict ?? profile.district;

  // Derive map center/zoom
  const derivedCenter = useMemo((): [number, number] => {
    if (mapOverride) return mapOverride.center;
    if (position && gpsDistrict) return [position.latitude, position.longitude];
    const coord = DISTRICT_COORDINATES[selectedDistrict];
    return coord ? [coord.lat, coord.lon] : TAMIL_NADU_CENTER;
  }, [mapOverride, position, gpsDistrict, selectedDistrict]);

  const derivedZoom = useMemo(() => {
    if (mapOverride) return mapOverride.zoom;
    if (position && gpsDistrict) return DISTRICT_ZOOM + 1;
    const coord = DISTRICT_COORDINATES[selectedDistrict];
    return coord ? DISTRICT_ZOOM : DEFAULT_ZOOM;
  }, [mapOverride, position, gpsDistrict, selectedDistrict]);

  // Weather fetch function — uses GPS coordinates when available, otherwise district center
  const fetchWeather = useCallback((district: string, gpsLat?: number, gpsLon?: number) => {
    const coord = DISTRICT_COORDINATES[district];
    if (!coord && gpsLat === undefined) return;

    const lat = gpsLat ?? coord?.lat;
    const lon = gpsLon ?? coord?.lon;
    setWeatherLoading(true);

    const url = gpsLat !== undefined && gpsLon !== undefined
      ? `/api/weather?lat=${lat}&lon=${lon}&district=${encodeURIComponent(district)}`
      : `/api/weather?district=${encodeURIComponent(district)}&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then((data: WeatherNormalizedPayload) => {
        setLiveWeather(data);
      })
      .catch((err) => {
        console.warn("Weather fetch fallback:", err);
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, []);

  // Handlers
  const handleRequestGPS = useCallback(() => {
    setManualDistrict(null);
    setMapOverride(null);
    requestLocation();
  }, [requestLocation]);

  const handleSelectDistrict = useCallback(
    (district: string) => {
      setGpsDistrict(null);
      setManualDistrict(district);
      setMapOverride(null);
      fetchWeather(district);
    },
    [fetchWeather]
  );

  const handleRecenter = useCallback(() => {
    setMapOverride(null);
  }, []);

  // Resolve active weather & intelligence
  const activeWeather = liveWeather?.current ?? persona.weather;
  const isLive = Boolean(liveWeather?.metadata?.isLive);

  const riskAnalysis = useMemo(
    () => analyzeWeatherRisk(activeWeather, profile.occupation),
    [activeWeather, profile.occupation]
  );

  const districtIntel = useMemo(
    () =>
      calculateDistrictIntelligence(
        selectedDistrict,
        activeWeather,
        riskAnalysis,
        persona.district,
        isLive,
        liveWeather?.metadata?.providerName || "Open-Meteo High-Res Engine"
      ),
    [selectedDistrict, activeWeather, riskAnalysis, persona.district, isLive, liveWeather]
  );

  const verifiedAlerts = useMemo(
    () =>
      (alerts || []).map((alert) => ({
        alert,
        report: verifyOfficialAlert(alert),
      })),
    [alerts]
  );

  const recommendation = useMemo(
    () =>
      generatePersonalizedRecommendation(
        { ...profile, district: selectedDistrict },
        activeWeather,
        riskAnalysis,
        districtIntel,
        alerts || [],
        verifiedAlerts.map((v) => v.report),
        isLive
      ),
    [profile, selectedDistrict, activeWeather, riskAnalysis, districtIntel, alerts, verifiedAlerts, isLive]
  );

  const userPosition = position
    ? { lat: position.latitude, lon: position.longitude }
    : null;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-neutral-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
            <Globe className="h-3.5 w-3.5" />
            <span>{t("map.interactiveEngine")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t("map.districtIntel")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            {t("map.explore")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={isLive ? "ok" : "warn"}>
            {isLive ? t("map.liveData") : t("map.presetData")}
          </Badge>
          <Badge tone="neutral">
            {selectedDistrict} District
          </Badge>
        </div>
      </div>

      {/* Main Layout: Map + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Map Column */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-neutral-800" style={{ minHeight: 480 }}>
          <InteractiveMap
            center={derivedCenter}
            zoom={derivedZoom}
            userPosition={userPosition}
            selectedDistrict={selectedDistrict}
            districtIntel={districtIntel}
            verifiedAlerts={verifiedAlerts}
            districtRiskScore={districtIntel.districtRiskScore ?? 0}
          />
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Location Controls */}
          <LocationControls
            permissionState={permissionState}
            locationSource={locationSource}
            currentDistrict={selectedDistrict}
            gpsLat={position?.latitude ?? null}
            gpsLon={position?.longitude ?? null}
            errorMessage={errorMessage}
            onRequestGPS={handleRequestGPS}
            onSelectDistrict={handleSelectDistrict}
            onRecenter={handleRecenter}
          />

          {/* Weather Overlay */}
          {weatherLoading ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex items-center justify-center gap-2 text-neutral-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>{t("map.fetching")}</span>
            </div>
          ) : (
            <WeatherOverlay
              weather={activeWeather}
              risk={riskAnalysis}
              districtName={selectedDistrict}
              isLive={isLive}
            />
          )}

          {/* Compact Directive Card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {t("common.actionDirective")}
              </span>
              <span className="text-[10px] font-bold font-mono uppercase text-white bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-full">
                {recommendation.severity}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white leading-snug">
              {recommendation.primaryDirective.en}
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {recommendation.safetyActions.en.slice(0, 3).map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 font-mono">
              {t("pipeline.target")} {profile.occupation.toUpperCase()} · {selectedDistrict}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
