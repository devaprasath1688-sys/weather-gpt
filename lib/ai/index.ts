import "server-only";

import type {
  HourlyForecast,
  OfficialAlert,
  RiskAnalysisResult,
  UserProfile,
  WeatherData,
} from "@/types";

export type AssistantLanguageStyle = "english" | "tamil" | "tanglish" | "mixed";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type WeatherAssistantContext = {
  profile: Pick<UserProfile, "district" | "state" | "occupation" | "language">;
  weather: Pick<
    WeatherData,
    | "temperatureC"
    | "feelsLikeC"
    | "humidityPercent"
    | "windSpeedKmh"
    | "rainfallMm24h"
    | "uvIndex"
    | "conditionDescription"
    | "updatedAt"
  >;
  forecast: Pick<HourlyForecast, "time" | "tempC" | "popPercent" | "rainfallMm" | "condition">[];
  risk: Pick<
    RiskAnalysisResult,
    "overallScore" | "severity" | "primaryHazard" | "explanation" | "recommendedPrecautions" | "occupationImpact"
  >;
  recommendation: {
    severity: string;
    primaryDirective: string;
    safetyActions: string[];
  };
  verifiedAlerts: Pick<
    OfficialAlert,
    "title" | "sourceName" | "severity" | "officialRefUrl" | "effectiveFrom" | "effectiveUntil"
  >[];
};

export const AI_MODULE = {
  phase: 8,
  status: "assistant_ready_when_configured",
} as const;

const TAMIL_SCRIPT = /[\u0B80-\u0BFF]/;
const TANGLISH_WORDS = /\b(enna|epdi|eppadi|innaiku|inniku|iruku|irukka|venum|pannu|mazhai|veiyil|weather|risk|forecast)\b/i;

export function detectAssistantLanguageStyle(message: string): AssistantLanguageStyle {
  const hasTamil = TAMIL_SCRIPT.test(message);
  const hasLatin = /[A-Za-z]/.test(message);

  if (hasTamil && hasLatin) return "mixed";
  if (hasTamil) return "tamil";
  if (TANGLISH_WORDS.test(message)) return "tanglish";
  return "english";
}

export function buildAssistantInstructions(
  context: WeatherAssistantContext,
  languageStyle: AssistantLanguageStyle
): string {
  const languageRule = {
    english: "Reply in English.",
    tamil: "Reply in Tamil script.",
    tanglish: "Reply in natural Tanglish using Latin characters.",
    mixed: "Reply in the same natural mixed Tamil-English style as the user.",
  }[languageStyle];

  return `You are the WeatherGPT Assistant. Help only with the supplied WeatherGPT context. ${languageRule}

Safety and truth rules:
- Clearly distinguish observed weather data, AI interpretation, and verified official information.
- Never invent an official government alert, closure, order, source, or forecast value.
- Only call an item an official alert when it appears in the VERIFIED OFFICIAL ALERTS section below.
- If that section is empty, say that no verified official alert is currently available in the supplied context.
- Be concise, practical, and personalize advice to the user's district and occupation.

WEATHERGPT CONTEXT (data supplied by the application):
${JSON.stringify(context)}`;
}
