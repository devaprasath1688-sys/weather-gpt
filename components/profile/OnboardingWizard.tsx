"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  CloudRain,
  Sun,
  Wind,
  Zap,
  ShieldCheck,
  Building,
  GraduationCap,
  Tractor,
  HardHat,
  Truck,
  Bike,
  Building2,
  Users,
  Crosshair,
  Loader2,
  Waves,
  HeartPulse,
} from "lucide-react";
import {
  DISTRICT_OPTIONS,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import { useGeolocation, reverseGeocodeToDistrict } from "@/lib/geo";
import type { OccupationKey, LanguageCode, NotificationPreference } from "@/types";

type OnboardingState = {
  // Step 1: Location
  district: string;
  locationSource: "gps" | "manual";
  // Step 2: Occupation
  occupation: OccupationKey;
  // Step 3: Risk Concerns
  riskConcerns: string[];
  // Step 4: Language
  language: LanguageCode;
  // Step 5: Notification Level
  notificationLevel: "important" | "all" | "none";
  notificationPreferences: NotificationPreference;
  // Step 6: Account Credentials
  fullName: string;
  email: string;
  password: string;
};

const OCCUPATION_OPTIONS: Array<{
  key: OccupationKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    key: "student",
    label: "Student",
    icon: <GraduationCap className="h-5 w-5 text-neutral-300" />,
    description: "School & college closures, examination and transit alerts",
  },
  {
    key: "farmer",
    label: "Farmer",
    icon: <Tractor className="h-5 w-5 text-neutral-300" />,
    description: "Rainfall timing, heat stress, crop and harvesting advisories",
  },
  {
    key: "delivery",
    label: "Delivery / Gig Worker",
    icon: <Bike className="h-5 w-5 text-neutral-300" />,
    description: "Waterlogged routes, flash downpours, thermal exposure",
  },
  {
    key: "construction",
    label: "Outdoor Worker",
    icon: <HardHat className="h-5 w-5 text-neutral-300" />,
    description: "High winds, scaffold safety, outdoor heat thresholds",
  },
  {
    key: "driver",
    label: "Driver / Transport",
    icon: <Truck className="h-5 w-5 text-neutral-300" />,
    description: "Roadway inundation, poor visibility, route diversions",
  },
  {
    key: "fisher",
    label: "Healthcare",
    icon: <HeartPulse className="h-5 w-5 text-neutral-300" />,
    description: "Hospital accessibility, flood vulnerability, emergency response",
  },
  {
    key: "office",
    label: "Office / Professional",
    icon: <Building2 className="h-5 w-5 text-neutral-300" />,
    description: "Commute disruptions, transit delay alerts, urban inundation",
  },
  {
    key: "other",
    label: "Other / Citizen",
    icon: <Users className="h-5 w-5 text-neutral-300" />,
    description: "Neighborhood alerts and official collectorate notifications",
  },
];

const WEATHER_RISK_OPTIONS = [
  {
    id: "heavy_rain",
    label: "Heavy Rain",
    description: "Intense downpours and precipitation spikes",
    icon: <CloudRain className="h-5 w-5 text-neutral-300" />,
  },
  {
    id: "flooding",
    label: "Flooding",
    description: "Urban waterlogging, drainage overflows, and road blockages",
    icon: <Waves className="h-5 w-5 text-neutral-300" />,
  },
  {
    id: "high_wind",
    label: "Strong Wind",
    description: "Gale gusts, tree hazards, and structural wind warnings",
    icon: <Wind className="h-5 w-5 text-neutral-300" />,
  },
  {
    id: "extreme_heat",
    label: "Extreme Heat",
    description: "Heatwaves, peak solar index, and dehydration watches",
    icon: <Sun className="h-5 w-5 text-neutral-300" />,
  },
  {
    id: "lightning",
    label: "Lightning",
    description: "Thunderstorms, electrical activity, and immediate squalls",
    icon: <Zap className="h-5 w-5 text-neutral-300" />,
  },
  {
    id: "cyclone",
    label: "Cyclone / Severe Weather",
    description: "Depressions, coastal surges, and disaster alerts",
    icon: <ShieldCheck className="h-5 w-5 text-neutral-300" />,
  },
];

const NOTIFICATION_LEVELS = [
  {
    id: "important" as const,
    title: "Important Alerts Only",
    description: "Emergency warnings, school/college closures, and severe weather declarations only.",
    badge: "Recommended",
  },
  {
    id: "all" as const,
    title: "All Relevant Alerts",
    description: "Daily personalized weather updates, commute advisories, and all severe alerts.",
    badge: "Comprehensive",
  },
  {
    id: "none" as const,
    title: "No Notifications",
    description: "Check weather only when opening the app. No proactive alerts will be sent.",
    badge: "Silent",
  },
];

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  "Location",
  "Occupation",
  "Weather Risks",
  "Language",
  "Notifications",
  "Review & Complete",
];

export function OnboardingWizard() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { permissionState, requestLocation } = useGeolocation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingState>({
    district: "Chennai",
    locationSource: "manual",
    occupation: "student",
    riskConcerns: ["heavy_rain", "flooding", "extreme_heat"],
    language: "en",
    notificationLevel: "important",
    notificationPreferences: {
      heavyRainfall: true,
      officialClosures: true,
      heatwavesAndDrought: true,
      travelDisruptions: true,
      agriculturalImpact: false,
    },
    fullName: "",
    email: "",
    password: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Handle GPS location trigger
  const handleUseGPS = () => {
    requestLocation();
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const match = reverseGeocodeToDistrict(pos.coords.latitude, pos.coords.longitude);
          if (match) {
            setFormData((prev) => ({
              ...prev,
              district: match.district,
              locationSource: "gps",
            }));
          }
        },
        () => {
          // Fallback to manual district if GPS is denied or unavailable
        }
      );
    }
  };

  // Toggle risk concern
  const handleToggleConcern = (id: string) => {
    setFormData((prev) => {
      const exists = prev.riskConcerns.includes(id);
      const updated = exists
        ? prev.riskConcerns.filter((item) => item !== id)
        : [...prev.riskConcerns, id];
      return { ...prev, riskConcerns: updated };
    });
  };

  // Set notification level
  const handleSelectNotificationLevel = (level: "important" | "all" | "none") => {
    let prefs: NotificationPreference;
    if (level === "none") {
      prefs = {
        heavyRainfall: false,
        officialClosures: false,
        heatwavesAndDrought: false,
        travelDisruptions: false,
        agriculturalImpact: false,
      };
    } else if (level === "important") {
      prefs = {
        heavyRainfall: true,
        officialClosures: true,
        heatwavesAndDrought: true,
        travelDisruptions: false,
        agriculturalImpact: false,
      };
    } else {
      prefs = {
        heavyRainfall: true,
        officialClosures: true,
        heatwavesAndDrought: true,
        travelDisruptions: true,
        agriculturalImpact: true,
      };
    }

    setFormData((prev) => ({
      ...prev,
      notificationLevel: level,
      notificationPreferences: prefs,
    }));
  };

  // Validate step before proceeding
  const validateStep = (step: number): boolean => {
    setValidationError(null);

    if (step === 1) {
      if (!formData.district) {
        setValidationError("Please select your district.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.occupation) {
        setValidationError("Please select your occupation.");
        return false;
      }
    } else if (step === 3) {
      if (formData.riskConcerns.length === 0) {
        setValidationError("Please select at least one weather concern.");
        return false;
      }
    } else if (step === 4) {
      if (!formData.language) {
        setValidationError("Please select a language.");
        return false;
      }
    } else if (step === 6) {
      if (!formData.fullName.trim()) {
        setValidationError("Please enter your full name.");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setValidationError("Please enter a valid email address.");
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        setValidationError("Password must be at least 6 characters long.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        district: formData.district,
        occupation: formData.occupation,
        language: formData.language,
        risk_concerns: formData.riskConcerns,
      });

      if (result.error) {
        setValidationError(result.error.message);
        setIsSubmitting(false);
        return;
      }

      // Persist profile in database if auth user ID returned
      const data = result.data as { user?: { id?: string } } | undefined;
      if (data?.user?.id) {
        try {
          await fetch("/api/auth/create-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: formData.email,
              district: formData.district,
              occupation: formData.occupation,
              language: formData.language,
              notificationPreferences: formData.notificationPreferences,
            }),
          });
        } catch {
          // Graceful fallback for offline demo testing
        }
      }

      setIsComplete(true);
      setTimeout(() => {
        router.push("/#overview");
      }, 700);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "An error occurred during registration.");
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <Card variant="glassStrong" className="space-y-6 text-center py-16">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-md">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Setup Complete</h2>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            Your intelligence profile for <strong className="text-white">{formData.district}</strong> is ready.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 font-mono">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Entering WeatherGPT Dashboard...</span>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push("/")}
            className="text-xs px-5 py-2"
          >
            Launch Dashboard Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Minimal Elegant Progress Bar: 01 ━━━ 02 ━━━ 03 ━━━ 04 ━━━ 05 ━━━ 06 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          {STEP_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isCurrent = stepNum === currentStep;
            const isPassed = stepNum < currentStep;

            return (
              <React.Fragment key={title}>
                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isCurrent
                        ? "text-white"
                        : isPassed
                        ? "text-neutral-400"
                        : "text-neutral-600"
                    }`}
                  >
                    0{stepNum}
                  </span>
                  <span
                    className={`hidden sm:block text-[10px] tracking-tight mt-0.5 ${
                      isCurrent
                        ? "text-white font-semibold"
                        : isPassed
                        ? "text-neutral-400"
                        : "text-neutral-600"
                    }`}
                  >
                    {title}
                  </span>
                </div>
                {idx < TOTAL_STEPS - 1 && (
                  <div
                    className={`flex-1 mx-2 h-0.5 transition-colors ${
                      isPassed ? "bg-white" : "bg-neutral-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-xs text-neutral-200 flex items-start gap-2.5">
          <span className="text-white font-bold">!</span>
          <p className="flex-1">{validationError}</p>
        </div>
      )}

      {/* STEP 1: LOCATION */}
      {currentStep === 1 && (
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Step 01
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Where are you located?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Select your district to receive localized radar telemetry and verified alerts.
            </p>
          </div>

          <div className="space-y-4">
            {/* GPS Location Option */}
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={permissionState === "requesting"}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                formData.locationSource === "gps"
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-neutral-900 border-neutral-800 text-white hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.locationSource === "gps" ? "bg-neutral-200 text-black" : "bg-neutral-800 text-white"}`}>
                  <Crosshair className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Use My Current Location</div>
                  <div className={`text-xs ${formData.locationSource === "gps" ? "text-neutral-700" : "text-neutral-400"}`}>
                    Auto-detect district via GPS
                  </div>
                </div>
              </div>
              {permissionState === "requesting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formData.locationSource === "gps" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-xs text-neutral-400 font-mono">GPS</span>
              )}
            </button>

            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2">
              Or Select District
            </div>

            {/* District Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DISTRICT_OPTIONS.map((d) => {
                const isSelected = formData.district === d && formData.locationSource === "manual";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, district: d, locationSource: "manual" })
                    }
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-white text-black border-white shadow-sm"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    <Building className="h-4 w-4 mb-1.5 opacity-60" />
                    <span>{d}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: OCCUPATION */}
      {currentStep === 2 && (
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Step 02
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">What best describes you?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              WeatherGPT tailors personal risk weights to your daily operational routine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {OCCUPATION_OPTIONS.map((occ) => {
              const isSelected = formData.occupation === occ.key;
              return (
                <button
                  key={occ.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, occupation: occ.key })}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${isSelected ? "bg-neutral-200 text-black" : "bg-neutral-800 text-white"}`}>
                    {occ.icon}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="text-sm font-semibold">{occ.label}</div>
                    <div className={`text-xs ${isSelected ? "text-neutral-700" : "text-neutral-400"}`}>
                      {occ.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 3: WEATHER RISKS */}
      {currentStep === 3 && (
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Step 03
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Which weather risks matter to you?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Select all conditions that disrupt your safety, transit, or work.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {WEATHER_RISK_OPTIONS.map((item) => {
              const isSelected = formData.riskConcerns.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleConcern(item.id)}
                  className={`flex items-start justify-between p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${isSelected ? "bg-neutral-200 text-black" : "bg-neutral-800 text-white"}`}>
                      {item.icon}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className={`text-xs ${isSelected ? "text-neutral-700" : "text-neutral-400"}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded border mt-1 flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-black border-black text-white" : "border-neutral-700 bg-neutral-800"
                  }`}>
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 4: PREFERRED LANGUAGE */}
      {currentStep === 4 && (
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Step 04
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">What language should WeatherGPT use?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Voice summaries and directives will be presented in your chosen language.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = formData.language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: lang.code as LanguageCode })}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-white text-black border-white shadow-sm scale-[1.02]"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <div className="text-xl font-bold mb-1">{lang.label}</div>
                  <div className={`text-xs font-mono ${isSelected ? "text-neutral-600" : "text-neutral-500"}`}>
                    {lang.code.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 5: NOTIFICATIONS */}
      {currentStep === 5 && (
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Step 05
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">How should WeatherGPT alert you?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Choose how proactively WeatherGPT should deliver severe announcements.
            </p>
          </div>

          <div className="space-y-3">
            {NOTIFICATION_LEVELS.map((lvl) => {
              const isSelected = formData.notificationLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleSelectNotificationLevel(lvl.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{lvl.title}</span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-neutral-200 text-black border-neutral-300 font-bold"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}>
                        {lvl.badge}
                      </span>
                    </div>
                    <div className={`text-xs ${isSelected ? "text-neutral-700" : "text-neutral-400"}`}>
                      {lvl.description}
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-black border-black" : "border-neutral-700"
                  }`}>
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 6: FINAL REVIEW & ACCOUNT */}
      {currentStep === 6 && (
        <Card variant="glassStrong" className="space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Step 06
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">You’re all set.</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Review your configuration and finalize your account credentials to launch.
            </p>
          </div>

          {/* Compact Profile Snapshot */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-2">
              Profile Summary
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Location</span>
                <span className="font-semibold text-white">{formData.district}</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Occupation</span>
                <span className="font-semibold text-white capitalize">{formData.occupation}</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Language</span>
                <span className="font-semibold text-white uppercase">{formData.language}</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Alerts</span>
                <span className="font-semibold text-white capitalize">{formData.notificationLevel}</span>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-neutral-300">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors focus:border-white focus:outline-none"
                placeholder="Deva Prasath"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-neutral-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors focus:border-white focus:outline-none"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-neutral-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors focus:border-white focus:outline-none"
                placeholder="At least 6 characters"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Completing Setup..." : "Complete Setup & Launch Dashboard"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </Card>
      )}

      {/* Navigation Buttons (Back & Continue) */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < TOTAL_STEPS && (
          <Button
            type="button"
            onClick={handleNext}
            variant="primary"
            className="px-6 py-2.5 text-xs"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sign In Prompt */}
      <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-white hover:underline transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
