"use client";

import React, { useEffect, useState, useMemo } from "react";
import { User, CloudRain, Thermometer, Wind, Sun, ShieldAlert, Sparkles, CircleCheck as CheckCircle2, Bell, Check, Cpu, Activity, Radio, TriangleAlert as AlertTriangle, Building2, ExternalLink, ShieldCheck, Circle as XCircle, Zap, Info, Layers } from "lucide-react";
import type { PersonaPreset } from "@/lib/demo-data";
import type { WeatherNormalizedPayload } from "@/types";
import { analyzeWeatherRisk } from "@/lib/risk/analyzeRisk";
import { calculateDistrictIntelligence } from "@/lib/district/calculateDistrictIntelligence";
import { verifyOfficialAlert } from "@/lib/alerts/verifyAlert";
import { translateGroundedAlert } from "@/lib/alerts/translateGroundedAlert";
import { generatePersonalizedRecommendation } from "@/lib/recommendations/generateRecommendation";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/language-context";

type StepPipelinePreviewProps = {
  activeStep: number;
  persona: PersonaPreset;
};

export function StepPipelinePreview({ activeStep, persona }: StepPipelinePreviewProps) {
  const { t } = useLanguage();
  const { profile, weather: personaWeather, district, alerts, recommendation, notificationReason } = persona;

  // Live Weather Telemetry State
  const [liveData, setLiveData] = useState<WeatherNormalizedPayload | null>(null);
  const [liveError, setLiveError] = useState<boolean>(false);

  useEffect(() => {
    if (activeStep !== 2 && activeStep !== 3 && activeStep !== 4) return;

    let isMounted = true;
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const res = await fetch(
          `/api/weather?district=${encodeURIComponent(profile.district)}&lat=${profile.latitude}&lon=${profile.longitude}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch live weather");
        const payload: WeatherNormalizedPayload = await res.json();
        if (isMounted) {
          setLiveData(payload);
          setLiveError(false);
        }
      } catch (err: unknown) {
        if (isMounted && (err as { name?: string })?.name !== "AbortError") {
          setLiveError(true);
        }
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeStep, profile.district, profile.latitude, profile.longitude]);

  const loadingLive = activeStep === 2 && !liveData && !liveError;

  // Display live weather if available, otherwise persona mock weather
  const activeWeather = liveData?.current || personaWeather;
  const isLiveActive = Boolean(liveData?.metadata?.isLive && !liveError);

  // AI Risk & Impact Analysis Output
  const riskAnalysis = analyzeWeatherRisk(activeWeather, profile.occupation);

  // District-Level Intelligence Output
  const districtIntel = calculateDistrictIntelligence(
    profile.district,
    activeWeather,
    riskAnalysis,
    district,
    isLiveActive,
    liveData?.metadata?.providerName || "Open-Meteo High-Res Engine"
  );

  // Official Alert Verification & Grounded AI Translation Output
  const primaryAlert = alerts && alerts.length > 0 ? alerts[0] : null;
  const verificationReport = primaryAlert
    ? verifyOfficialAlert(primaryAlert, profile.district)
    : null;
  const groundedSummary = primaryAlert ? translateGroundedAlert(primaryAlert) : null;

  // Verification reports for ALL alerts
  const allVerificationReports = useMemo(
    () => (alerts || []).map((a) => verifyOfficialAlert(a, profile.district)),
    [alerts, profile.district]
  );

  // Personalized Recommendation Engine Output
  const phase6Recommendation = useMemo(
    () =>
      generatePersonalizedRecommendation(
        profile,
        activeWeather,
        riskAnalysis,
        districtIntel,
        alerts || [],
        allVerificationReports,
        isLiveActive
      ),
    [profile, activeWeather, riskAnalysis, districtIntel, alerts, allVerificationReports, isLiveActive]
  );

  // STEP 1: User Profile / Location Context
  if (activeStep === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 01 {t("pipeline.input")}</span>
              <h3 className="font-bold text-base text-white">{t("pipeline.profileLocation")}</h3>
            </div>
          </div>
          <Badge tone="official">Profile Active</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">{t("pipeline.locationContext")}</span>
            <p className="text-xl font-bold text-white">{profile.district} District</p>
            <p className="text-xs text-neutral-400">{profile.city}, {profile.state}</p>
            <div className="pt-2 text-[11px] font-mono text-neutral-300 border-t border-neutral-800">
              GPS: {profile.latitude}°N, {profile.longitude}°E
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">{t("pipeline.occupationVector")}</span>
            <p className="text-xl font-bold text-white capitalize">{profile.occupation}</p>
            <p className="wgpt-body-text text-xs text-neutral-400">{profile.activityNotes || "Standard commuter / outdoor profile"}</p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">{t("pipeline.preferences")}</span>
            <p className="text-xl font-bold text-white uppercase font-mono">{profile.language}</p>
            <p className="text-xs text-neutral-400">
              Notifications: Rain ({profile.notificationPreferences.heavyRainfall ? "ON" : "OFF"}), Closures ({profile.notificationPreferences.officialClosures ? "ON" : "OFF"})
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Live Weather + Forecast
  if (activeStep === 2) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <CloudRain className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 02 {t("pipeline.meteorology")}</span>
              <h3 className="font-bold text-base text-white">{t("pipeline.meteorological")}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loadingLive ? (
              <Badge tone="neutral">{t("pipeline.fetching")}</Badge>
            ) : isLiveActive ? (
              <Badge tone="ok">
                <Radio className="h-3 w-3 text-white animate-pulse" />
                LIVE: {liveData?.metadata?.providerName || "Open-Meteo Engine"}
              </Badge>
            ) : (
              <Badge tone="warn">PRESET: Demo Telemetry</Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t("pipeline.temperature")}</span>
              <Thermometer className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.temperatureC}°C</p>
            <span className="text-xs text-neutral-500 font-mono">Feels {activeWeather.feelsLikeC}°C</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t("weather.rain24h")}</span>
              <CloudRain className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.rainfallMm24h} mm</p>
            <span className="text-xs text-neutral-500 font-mono">Humidity: {activeWeather.humidityPercent}%</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t("common.windVelocity")}</span>
              <Wind className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.windSpeedKmh} <span className="text-sm font-normal text-neutral-500">km/h</span></p>
            <span className="text-xs text-neutral-500 font-mono">{t("pipeline.vectorAnalyzed")}</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t("weather.uvIndex")}</span>
              <Sun className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeWeather.uvIndex}</p>
            <span className="text-xs text-neutral-500 font-mono">{t("common.uvRadiation")}</span>
          </div>
        </div>

        {/* Condition Summary */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-white shrink-0" />
              <span className="font-semibold text-white uppercase tracking-wider">{t("pipeline.condition")}</span>
            <span className="text-neutral-300 font-medium">{activeWeather.conditionDescription}</span>
          </div>
          <span className="text-neutral-500 font-mono">Updated: {activeWeather.updatedAt}</span>
        </div>

        {/* Hourly Forecast Stream */}
        {liveData?.hourlyForecast && liveData.hourlyForecast.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">{t("pipeline.forecastStream")}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {liveData.hourlyForecast.map((hour, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-center space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 block">{hour.time}</span>
                  <span className="text-sm font-bold text-white block font-mono">{hour.tempC}°C</span>
                  <span className="text-[10px] text-neutral-400 block font-mono">{hour.popPercent}% rain</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // STEP 3: AI Risk & Impact Analysis
  if (activeStep === 3) {
    const severityTone =
      riskAnalysis.severity === "severe" || riskAnalysis.severity === "high"
        ? "danger"
        : riskAnalysis.severity === "elevated"
        ? "warn"
        : "ok";

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 03 {t("pipeline.intelligence")}</span>
              <h3 className="font-bold text-base text-white">{t("pipeline.riskAnalysis")}</h3>
            </div>
          </div>
          <Badge tone={severityTone}>
            Severity: {riskAnalysis.severity.toUpperCase()} ({riskAnalysis.overallScore}/100)
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Overall Risk Score Gauge */}
          <div className="space-y-4">
            <RiskMeter
              score={riskAnalysis.overallScore}
              label={`${profile.occupation.toUpperCase()} Risk Score`}
              reason={riskAnalysis.explanation}
            />

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">{t("pipeline.primaryHazard")}</span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-white shrink-0" />
                {riskAnalysis.primaryHazard}
              </p>
              <p className="wgpt-body-text text-xs text-neutral-300">{riskAnalysis.explanation}</p>
            </div>
          </div>

          {/* Right: Occupation Vulnerability Impact & Sub-Scores */}
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Impact ({profile.occupation})
                </span>
                <span className="text-[10px] font-mono text-neutral-500">{t("pipeline.deterministic")}</span>
              </div>
              <p className="wgpt-body-text text-xs text-neutral-300">
                {riskAnalysis.occupationImpact}
              </p>
            </div>

            {/* Sub-scores breakdown */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">{t("pipeline.subScores")}</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 flex justify-between items-center">
                  <span className="text-neutral-400">{t("weather.rain24h")}:</span>
                  <span className="font-bold text-white font-mono">{riskAnalysis.subScores.rainRisk}/100</span>
                </div>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 flex justify-between items-center">
                  <span className="text-neutral-400">{t("risk.heat")}:</span>
                  <span className="font-bold text-white font-mono">{riskAnalysis.subScores.heatRisk}/100</span>
                </div>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 flex justify-between items-center">
                  <span className="text-neutral-400">{t("common.windVelocity")}:</span>
                  <span className="font-bold text-white font-mono">{riskAnalysis.subScores.windRisk}/100</span>
                </div>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 flex justify-between items-center">
                  <span className="text-neutral-400">{t("risk.solar")}:</span>
                  <span className="font-bold text-white font-mono">{riskAnalysis.subScores.uvRisk}/100</span>
                </div>
              </div>
            </div>

            {/* Recommended Precautions List */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">{t("pipeline.precautions")}</span>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {riskAnalysis.recommendedPrecautions.map((prec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
                    <span>{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: District-Level Intelligence
  if (activeStep === 4) {
    const districtTone =
      districtIntel.overallRiskLevel === "severe" || districtIntel.overallRiskLevel === "high"
        ? "danger"
        : districtIntel.overallRiskLevel === "elevated"
        ? "warn"
        : "ok";

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 04 {t("pipeline.meteorology")}</span>
              <h3 className="font-bold text-base text-white">
                {t("pipeline.districtIntel")} ({districtIntel.districtName}, {districtIntel.state})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={districtTone}>
              {t("pipeline.districtRisk")} {districtIntel.overallRiskLevel.toUpperCase()} ({districtIntel.districtRiskScore}/100)
            </Badge>
            <Badge tone={districtIntel.isLive ? "ok" : "warn"}>
              {districtIntel.dataSource}
            </Badge>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3 text-xs font-mono">
            <span className="text-white font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-neutral-400" />
              {t("pipeline.dominantHazard")} {districtIntel.dominantHazard}
            </span>
            <span className="text-neutral-500">Updated: {districtIntel.lastUpdated}</span>
          </div>

          <p className="wgpt-body-text text-xs text-neutral-300 font-medium">
            {districtIntel.expectedLocalImpact}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] border-t border-neutral-800">
            <span className="text-neutral-400 font-semibold uppercase font-mono">{t("pipeline.vulnerableGroups")}</span>
            {(districtIntel.vulnerableOccupations || []).map((group) => (
              <span key={group} className="rounded-full bg-neutral-900 border border-neutral-700 px-2.5 py-0.5 text-neutral-200">
                {group}
              </span>
            ))}
          </div>
        </div>

        {/* Affected Areas / Subdivisions Grid */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              {t("pipeline.subdivision")}
            </h4>
            <span className="text-[10px] font-mono text-neutral-500">{t("pipeline.activeAlerts")} {districtIntel.activeOfficialAlertsCount}</span>
          </div>

          <div className="space-y-2.5">
            {districtIntel.affectedAreas.map((area) => (
              <div
                key={area.name}
                className="flex flex-col gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-bold text-sm text-white">{area.name}</span>
                  <span className="ml-2 text-xs text-neutral-400 font-mono">({area.subdivision})</span>
                  <p className="mt-0.5 text-xs text-neutral-300">{area.disruptionLevel}</p>
                </div>
                <Badge tone={area.waterloggingRisk === "severe" || area.waterloggingRisk === "high" ? "danger" : area.waterloggingRisk === "elevated" ? "warn" : "ok"}>
                  {t("pipeline.districtRisk")} {area.waterloggingRisk.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Helpline Contacts */}
        <div className="flex flex-wrap gap-5 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
          <span>{t("pipeline.helpline")} <strong className="text-white">{districtIntel.emergencyContacts.helpline}</strong></span>
          <span>{t("pipeline.controlRoom")} <strong className="text-white">{districtIntel.emergencyContacts.controlRoom}</strong></span>
        </div>
      </div>
    );
  }

  // STEP 5: Official Alerts / Closures + Verification
  if (activeStep === 5) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 05 {t("pipeline.groundTruth")}</span>
              <h3 className="font-bold text-base text-white">{t("pipeline.groundTruth")}</h3>
            </div>
          </div>
          {verificationReport ? (
            <VerificationBadge
              status={verificationReport.status}
              sourceName={verificationReport.issuingAuthority}
            />
          ) : (
            <Badge tone="ok">{t("pipeline.noEmergencies")}</Badge>
          )}
        </div>

        {primaryAlert && verificationReport && groundedSummary ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 font-semibold block uppercase">
                    Issuing Authority: {verificationReport.issuingAuthority}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Bulletin ID: {primaryAlert.id} · Issued: {primaryAlert.issuedAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={primaryAlert.severity === "emergency" || primaryAlert.severity === "warning" ? "danger" : "warn"}>
                    {primaryAlert.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Title & Official Raw Press Announcement */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">{primaryAlert.title}</h4>
                <div className="rounded-xl bg-neutral-900 p-4 font-mono text-xs text-neutral-300 border border-neutral-800 leading-relaxed">
                  <span className="text-white font-semibold uppercase">{t("pipeline.officialRelease")} </span>
                  {primaryAlert.rawAnnouncement}
                </div>
                {primaryAlert.officialRefUrl && (
                  <div className="pt-1 text-xs">
                    <a
                      href={primaryAlert.officialRefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white font-mono transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{primaryAlert.officialRefUrl}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Grounded AI Translation & Multilingual Summary */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="h-4 w-4" />
                    <span>{t("pipeline.groundedTranslation")}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">{t("pipeline.englishTamil")}</span>
                </div>
                <p className="wgpt-body-text text-sm font-medium text-neutral-100">
                  {groundedSummary.en}
                </p>
                {groundedSummary.ta && (
                  <div className="pt-2 border-t border-neutral-800">
                    <span className="text-[11px] font-mono text-neutral-400 font-semibold block mb-1">
                      {t("profile.language")}:
                    </span>
                    <p className="wgpt-body-text text-xs text-neutral-300">
                      {groundedSummary.ta}
                    </p>
                  </div>
                )}
              </div>

              {/* Deterministic Verification Rule Audit */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-white" />
                    {t("pipeline.verificationAudit")}
                  </span>
                  <Badge tone={verificationReport.isVerifiedOfficial ? "ok" : "danger"}>
                    {verificationReport.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  {verificationReport.checks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5"
                    >
                      {chk.passed ? (
                        <Check className="h-4 w-4 text-white shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-white block">{chk.checkName}</span>
                        <span className="text-[11px] text-neutral-400 block">{chk.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center text-sm text-neutral-400">
            No official government closure alerts declared for {profile.district} District.
          </div>
        )}
      </div>
    );
  }

  // STEP 6: Personalized Recommendation
  if (activeStep === 6) {
    const groundingIcons: Record<string, React.ReactNode> = {
      verified_official_alert: <ShieldCheck className="h-3.5 w-3.5 text-white shrink-0" />,
      live_weather: <Radio className="h-3.5 w-3.5 text-neutral-300 shrink-0" />,
      ai_risk_analysis: <Cpu className="h-3.5 w-3.5 text-neutral-300 shrink-0" />,
      district_intelligence: <Building2 className="h-3.5 w-3.5 text-neutral-300 shrink-0" />,
      demo_fallback: <Info className="h-3.5 w-3.5 text-neutral-500 shrink-0" />,
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 06 {t("pipeline.dispatch")}</span>
              <h3 className="font-bold text-base text-white">{t("pipeline.personalized")}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="official">Target: {profile.occupation.toUpperCase()}</Badge>
            <Badge tone="neutral">
              <Zap className="h-3 w-3 text-white" />
              {phase6Recommendation.severity.toUpperCase()}
            </Badge>
            <Badge tone={phase6Recommendation.isLive ? "ok" : "warn"}>
              {phase6Recommendation.isLive ? "LIVE" : "PRESET"}
            </Badge>
          </div>
        </div>

        {/* Primary Action Directive */}
        <div className="rounded-2xl border border-neutral-700 bg-neutral-950 p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">{t("pipeline.primaryDirective")}</span>
          </div>
          <h3 className="text-lg font-bold text-white leading-snug">
            {phase6Recommendation.primaryDirective.en}
          </h3>
          {phase6Recommendation.primaryDirective.ta && (
            <div className="pt-2 border-t border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-400 font-semibold block mb-1">Tamil (தமிழ்):</span>
              <p className="wgpt-body-text text-sm text-neutral-300">
                {phase6Recommendation.primaryDirective.ta}
              </p>
            </div>
          )}
        </div>

        {/* Supporting Safety Actions */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-sm">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 text-white" />
            {t("pipeline.safetyActions")}
          </h4>
          <ul className="space-y-2 text-sm text-neutral-200">
            {phase6Recommendation.safetyActions.en.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span>{action}</span>
              </li>
            ))}
          </ul>

          {phase6Recommendation.safetyActions.ta && phase6Recommendation.safetyActions.ta.length > 0 && (
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 font-semibold">{t("profile.language")}:</span>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {phase6Recommendation.safetyActions.ta.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Official Alert Context (if alert-driven) */}
        {phase6Recommendation.isOfficialAlertDriven && phase6Recommendation.officialAlertContext && (
          <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-xs text-neutral-200 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">{phase6Recommendation.officialAlertContext.en}</span>
              {phase6Recommendation.officialAlertContext.ta && (
                <span className="text-neutral-400 block mt-1">{phase6Recommendation.officialAlertContext.ta}</span>
              )}
            </div>
          </div>
        )}

        {/* Why This Recommendation? */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-2.5">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <AlertTriangle className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">{t("pipeline.whyRecommendation")}</span>
          </div>
          <p className="wgpt-body-text text-xs text-neutral-300">
            {phase6Recommendation.reasoning.en}
          </p>
          {phase6Recommendation.reasoning.ta && (
            <div className="pt-2 border-t border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400">{t("profile.language")}:</span>
              <p className="wgpt-body-text text-xs text-neutral-400 mt-0.5">
                {phase6Recommendation.reasoning.ta}
              </p>
            </div>
          )}
        </div>

        {/* Grounding / Source Chain */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 font-mono">
              <Layers className="h-4 w-4 text-white" />
              {t("pipeline.groundingChain")}
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {phase6Recommendation.groundingSources.length} {t("pipeline.streams")}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            {phase6Recommendation.groundingSources.map((src, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-xl bg-neutral-900 border border-neutral-800 p-2.5"
              >
                {groundingIcons[src.type] || <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
                <div>
                  <span className="font-bold text-white block">{src.label}</span>
                  <span className="text-[11px] text-neutral-400 block">{src.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 7: Right User -> Right Notification Dispatch
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-white">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 07 {t("pipeline.dispatch")}</span>
            <h3 className="font-bold text-base text-white">{t("pipeline.notificationRouting")}</h3>
          </div>
        </div>
        <Badge tone="official">{t("pipeline.rightNotification")}</Badge>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-bold text-xs">
            ✓
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              {t("pipeline.dispatchConfirmed", { name: persona.name })}
            </h4>
            <p className="text-xs text-neutral-400">{t("pipeline.filtering")}</p>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between text-neutral-400 font-mono gap-2">
            <span>{t("pipeline.payload")} &quot;{recommendation.headline.en.slice(0, 50)}...&quot;</span>
            <span>{t("pipeline.targetDistrict")} {profile.district}</span>
          </div>
          <p className="wgpt-body-text text-neutral-300 pt-2 border-t border-neutral-800">{notificationReason}</p>
        </div>
      </div>
    </div>
  );
}
