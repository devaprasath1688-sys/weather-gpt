import "server-only";

import type {
  HourlyForecast,
  DailyForecast,
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
  forecast?: Pick<HourlyForecast, "time" | "tempC" | "popPercent" | "rainfallMm" | "condition">[];
  hourlyForecast?: Pick<HourlyForecast, "time" | "tempC" | "popPercent" | "rainfallMm" | "condition">[];
  dailyForecast?: Pick<DailyForecast, "date" | "dayLabel" | "tempMaxC" | "tempMinC" | "popPercent" | "condition">[];
  risk: Pick<
    RiskAnalysisResult,
    "overallScore" | "severity" | "primaryHazard" | "explanation" | "recommendedPrecautions" | "occupationImpact"
  >;
  recommendation: {
    severity: string;
    primaryDirective: string;
    primaryDirectiveTa?: string;
    safetyActions: string[];
    safetyActionsTa?: string[];
  };
  verifiedAlerts: Pick<
    OfficialAlert,
    "title" | "sourceName" | "severity" | "officialRefUrl" | "effectiveFrom" | "effectiveUntil"
  >[];
  districtInfo?: {
    districtName: string;
    helpline?: string;
    controlRoom?: string;
    floodZones?: string[];
  };
};

export const AI_MODULE = {
  phase: 8,
  status: "assistant_ready_when_configured",
} as const;

const TAMIL_SCRIPT_REGEX = /[\u0B80-\u0BFF]/;

// Comprehensive phonetics and vocabulary for Romanized Tamil (Tanglish)
const TANGLISH_PATTERNS = [
  // Interrogatives and Question words
  /\b(enna|epdi|eppadi|yen|yengu|engu|yaar|yaaru|edhu|evalavu|evlo|yeppo|eppo|eppodhu)\b/i,
  // Verbs and Verb suffixes
  /\b(varuma|varudha|peyyuma|peiyuma|peyyudha|peiyudha|irukka|iruka|iruku|irukku|irundha|irundhadhu|irupen|solunga|sollunga|kudunga|kaatunga|kaatu|pannunga|panna|pannalama|pogalama|poagalaama|paakalaama|paarkalaama|theriyuma|puriyudha)\b/i,
  // Time and Relative temporal indicators
  /\b(innaiku|inniku|innaki|indru|nalaiku|naalaiku|naalaiki|nalaikki|ippo|ippodhu|appo|appodhu|adutha|munnadi|kaalaila|kaalailayil|saayanthiram|saayankalam|raathiri|iravu)\b/i,
  // Weather, Nature and Climate vocabulary in Tanglish
  /\b(mazhai|malai|veiyil|veyil|kuliru|kulir|kaathu|kaatru|megam|minnal|idi|thoorall|kaathadi|climate)\b/i,
  // Common particles, connectors, qualifiers, and conversational markers
  /\b(romba|rombaave|konjam|nalla|nallaave|paravalla|dhaan|dhaane|dhaana|paathu|kuda|kooda|mattum|vaaippu|vaipu|chance|romba-adhe)\b/i,
  // Common greetings, pronouns and address terms
  /\b(vanakkam|ungala|ungalku|ungalluku|enakku|enaku|namma|namakku|neenga|neengal|thala|bro)\b/i,
];

export function detectAssistantLanguageStyle(message: string): AssistantLanguageStyle {
  if (!message || typeof message !== "string") {
    return "english";
  }

  const clean = message.trim();
  const hasTamil = TAMIL_SCRIPT_REGEX.test(clean);
  const hasLatin = /[A-Za-z]/.test(clean);

  // If text contains Tamil script
  if (hasTamil) {
    // If predominantly Tamil script
    if (!hasLatin) return "tamil";
    // If contains both Tamil script and English words
    return "tamil";
  }

  // If text is written in Latin characters, check for Tanglish words
  if (hasLatin) {
    const isTanglish = TANGLISH_PATTERNS.some((pattern) => pattern.test(clean));
    if (isTanglish) {
      return "tanglish";
    }
  }

  return "english";
}

export function buildAssistantInstructions(
  context: WeatherAssistantContext,
  languageStyle: AssistantLanguageStyle
): string {
  let languageDirective = "";

  if (languageStyle === "tamil") {
    languageDirective = `LANGUAGE: TAMIL SCRIPT (தமிழ்)
- You MUST reply strictly in natural, polite, grammatically correct Tamil using Tamil script (தமிழ் எழுத்துகள்).
- Example: "வணக்கம்! உங்கள் சென்னை மாவட்டத்தில் இன்று வானிலை..."
- Use proper Tamil terminology for weather (வானிலை, வெப்பநிலை, மழைப்பொழிவு, காற்றின் வேகம், புறஊதா கதிர்வீச்சு).
- Do NOT reply in English or Tanglish Latin script.`;
  } else if (languageStyle === "tanglish") {
    languageDirective = `LANGUAGE: TANGLISH (Natural Conversational Tamil in English/Latin Alphabet)
- You MUST reply strictly in natural, fluent, friendly Tanglish using the English/Latin alphabet.
- Example: "Vanakkam! Chennai-la inniku weather romba nalla sunny-ah irukku. Temperature around 32°C irukku, mazhai peyya vaaippu romba kammi (0%)..."
- Do NOT switch to formal English.
- Do NOT write in Tamil script.`;
  } else {
    languageDirective = `LANGUAGE: ENGLISH
- You MUST reply strictly in clear, professional, friendly, natural English.
- Do NOT switch to Tamil or Tanglish unless explicitly requested by the user.`;
  }

  return `You are WeatherGPT Assistant, an expert regional AI weather and safety intelligence assistant for Tamil Nadu.

${languageDirective}

CORE OPERATING PRINCIPLES:
1. DIRECT ANSWER FIRST: Always answer the user's exact question in the very first sentence.
2. GENUINELY USEFUL LENGTH & DEPTH:
   - For simple factual questions (e.g. current temperature, wind speed, or humidity): Provide 2 to 4 informative, helpful sentences.
   - For standard weather questions (e.g. "Will it rain today?", "What is my weather right now?"): Provide 4 to 7 detailed, well-structured sentences covering temperature, rain probability/precipitation, wind, condition, and comfort.
   - For forecast, risk, travel, or outdoor activity questions: Provide 5 to 9 comprehensive sentences analyzing hourly/daily trends, risk factors, and actionable safety precautions tailored to their occupation (${context?.profile?.occupation || "user"}).
3. GROUNDED IN REAL TELEMETRY:
   - Use ONLY the real data supplied in the WEATHERGPT CONTEXT below.
   - Mention specific values when answering: Current Temperature (°C), Feels-Like (°C), Precipitation/Rain Depth (mm), Rain Probability (%), Wind Speed (km/h), UV Index, and Hourly/Daily outlook.
   - If specific information is unavailable in context, clearly state it is unavailable rather than guessing.
4. RAIN & INUNDATION QUERIES:
   - Always state the 24-hour rainfall depth and precipitation probability (PoP %).
   - Check the hourly forecast timeline to tell the user when rain is expected or if conditions remain clear.
5. TEMPERATURE & SUN EXPOSURE QUERIES:
   - State the current temperature and "feels-like" temperature.
   - Mention the UV index and advise on sun protection or hydration if UV ≥ 6 or temperature ≥ 35°C.
6. RISK & TRAVEL SAFETY QUERIES:
   - State the Personal Risk Score (${context?.risk?.overallScore ?? 0}/100) and Severity Level (${context?.risk?.severity || "low"}).
   - Explain why the risk is at that level and provide actionable travel guidance tailored to their occupation.
7. OFFICIAL ALERTS:
   - Clearly state whether any verified official emergency/warning alert from the District Collectorate or IMD is active.
   - Never fabricate or hallucinate government closure orders.
8. CLEAN TEXT FORMATTING:
   - Do NOT use raw markdown formatting symbols like hashtags (#) or asterisks (**) because this output is read in plain chat and spoken aloud via Text-to-Speech.
   - Use clean, natural paragraphs and sentences that sound smooth both visually and when spoken aloud.

SUPPLIED WEATHERGPT CONTEXT:
Location: ${context?.profile?.district || "Unknown District"}, ${context?.profile?.state || "Tamil Nadu"}
Occupation: ${context?.profile?.occupation || "General Public"}
Current Weather: ${JSON.stringify(context?.weather || {})}
Hourly Forecast (Next 24h): ${JSON.stringify(context?.hourlyForecast || context?.forecast || [])}
7-Day Daily Forecast: ${JSON.stringify(context?.dailyForecast || [])}
Risk Analysis: ${JSON.stringify(context?.risk || {})}
Recommendations: ${JSON.stringify(context?.recommendation || {})}
Verified Official Bulletins: ${JSON.stringify(context?.verifiedAlerts || [])}
District Information: ${JSON.stringify(context?.districtInfo || {})}`;
}
