import type { UserProfile, WeatherData, OccupationKey } from "@/types";
import type { RiskAnalysisResult } from "@/types/risk";
import type { DistrictIntelligence } from "@/types/district";
import type { OfficialAlert } from "@/types/alerts";
import type { AlertVerificationReport } from "@/types/alerts-normalized";
import type {
  RecommendationSeverity,
  GroundingSource,
  PersonalizedRecommendationResult,
} from "@/types/recommendation-engine";

// ---------------------------------------------------------------------------
// Phase 6 — Deterministic Personalized Recommendation Engine
// ---------------------------------------------------------------------------

/**
 * Determines recommendation severity via strict priority cascade.
 *
 * Priority order (first match wins):
 * 1. Verified official emergency alert → EMERGENCY
 * 2. Verified official warning alert  → SEVERE
 * 3. District risk ≥ 80              → SEVERE
 * 4. Personal risk ≥ 70              → HIGH
 * 5. Personal risk ≥ 40              → MODERATE
 * 6. Normal conditions               → LOW
 */
function computeSeverity(
  riskScore: number,
  districtRiskScore: number,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[]
): { severity: RecommendationSeverity; isOfficialAlertDriven: boolean } {
  // Priority 1 & 2: Verified official alerts
  const verifiedEmergency = verifiedAlerts.find(
    (v) =>
      v.report.isVerifiedOfficial && v.alert.severity === "emergency"
  );
  if (verifiedEmergency) {
    return { severity: "emergency", isOfficialAlertDriven: true };
  }

  const verifiedWarning = verifiedAlerts.find(
    (v) =>
      v.report.isVerifiedOfficial && v.alert.severity === "warning"
  );
  if (verifiedWarning) {
    return { severity: "severe", isOfficialAlertDriven: true };
  }

  // Priority 3: Severe district risk
  if (districtRiskScore >= 80) {
    return { severity: "severe", isOfficialAlertDriven: false };
  }

  // Priority 4: High personal risk
  if (riskScore >= 70) {
    return { severity: "high", isOfficialAlertDriven: false };
  }

  // Priority 5: Elevated personal risk
  if (riskScore >= 40) {
    return { severity: "moderate", isOfficialAlertDriven: false };
  }

  // Priority 6: Normal conditions
  return { severity: "low", isOfficialAlertDriven: false };
}

// ---------------------------------------------------------------------------
// Occupation-Specific Directive & Action Generators
// ---------------------------------------------------------------------------

function generateStudentDirective(
  weather: WeatherData,
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[],
  isOfficialAlertDriven: boolean
): { directive: { en: string; ta: string }; actions: { en: string[]; ta: string[] } } {
  const closureAlert = verifiedAlerts.find(
    (v) =>
      v.report.isVerifiedOfficial &&
      v.alert.closureDeclared !== "none"
  );

  if (closureAlert) {
    return {
      directive: {
        en: `Do NOT commute to campus. Official ${closureAlert.alert.closureDeclared === "schools_and_colleges" ? "school & college" : closureAlert.alert.closureDeclared === "all_schools" ? "school" : "college"} closure is active for ${district.districtName}.`,
        ta: `வகுப்புகளுக்குச் செல்ல வேண்டாம். ${district.districtName} மாவட்டத்தில் அதிகாரப்பூர்வ விடுமுறை அறிவிக்கப்பட்டுள்ளது.`,
      },
      actions: {
        en: [
          `Stay indoors — classes are officially suspended for ${district.districtName} educational institutions today.`,
          `${district.affectedAreas.length > 0 ? district.affectedAreas.map((a) => a.name).join(", ") + " roads are reported disrupted." : "Multiple roads are reported waterlogged or disrupted."}`,
          "Keep mobile devices charged in case of localized power outages.",
          "Monitor official District Collectorate announcements for resumption updates.",
        ],
        ta: [
          `வீட்டிலேயே இருங்கள் — ${district.districtName} மாவட்டத்தில் உள்ள கல்வி நிறுவனங்களுக்கு இன்று விடுமுறை.`,
          "கைபேசி சார்ஜ் செய்து வைக்கவும், மின் தடை ஏற்படலாம்.",
          "மாவட்ட ஆட்சியர் அறிவிப்புகளை தொடர்ந்து கவனிக்கவும்.",
        ],
      },
    };
  }

  // No closure — generate weather-based directive
  if (isOfficialAlertDriven || risk.overallScore >= 70) {
    return {
      directive: {
        en: `Exercise extreme caution during campus commute. ${risk.primaryHazard} conditions are active in ${district.districtName}.`,
        ta: `${district.districtName} மாவட்டத்தில் ${risk.primaryHazard} நிலை உள்ளது. கல்லூரிப் பயணத்தில் மிகுந்த எச்சரிக்கையாக இருக்கவும்.`,
      },
      actions: {
        en: [
          `Current temperature is ${weather.temperatureC}°C with ${weather.rainfallMm24h}mm rainfall — plan indoor study sessions.`,
          "Avoid low-lying subway crossings and flood-prone campus routes.",
          "Carry essential supplies and a rain-proof bag for electronics.",
        ],
        ta: [
          `தற்போதைய வெப்பநிலை ${weather.temperatureC}°C, மழை ${weather.rainfallMm24h}mm — உட்புற படிப்பு திட்டமிடவும்.`,
          "தாழ்வான சாலைகள் மற்றும் வெள்ளப் பாதிப்புக்குள்ளாகும் பகுதிகளைத் தவிர்க்கவும்.",
        ],
      },
    };
  }

  return {
    directive: {
      en: `Normal commute conditions in ${district.districtName}. Stay weather-aware during outdoor transit.`,
      ta: `${district.districtName} மாவட்டத்தில் இயல்பான பயண நிலை. வெளியில் செல்லும்போது வானிலையை கவனிக்கவும்.`,
    },
    actions: {
      en: [
        `Temperature: ${weather.temperatureC}°C, UV Index: ${weather.uvIndex} — carry sun protection if UV is elevated.`,
        "Check local transport schedules for any weather-related delays.",
      ],
      ta: [
        `வெப்பநிலை: ${weather.temperatureC}°C — தேவைப்பட்டால் குடை எடுத்துச் செல்லவும்.`,
        "போக்குவரத்து தாமதங்களை அவ்வப்போது சரிபார்க்கவும்.",
      ],
    },
  };
}

function generateFarmerDirective(
  weather: WeatherData,
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[],
  isOfficialAlertDriven: boolean
): { directive: { en: string; ta: string }; actions: { en: string[]; ta: string[] } } {
  const isHeatHazard = weather.temperatureC >= 37 || weather.uvIndex >= 9;
  const isRainHazard = weather.rainfallMm24h >= 50;
  const isWindHazard = weather.windSpeedKmh >= 40;

  // Official alert driven
  if (isOfficialAlertDriven) {
    const primaryAlert = verifiedAlerts.find((v) => v.report.isVerifiedOfficial);
    const alertTitle = primaryAlert?.alert.title || "Official weather advisory";
    return {
      directive: {
        en: `Comply with official advisory: ${alertTitle}. Protect crops and livestock immediately.`,
        ta: `அதிகாரப்பூர்வ அறிவுறுத்தலைப் பின்பற்றவும். பயிர்கள் மற்றும் கால்நடைகளை உடனடியாகப் பாதுகாக்கவும்.`,
      },
      actions: {
        en: [
          `Official advisory active for ${district.districtName} — restrict outdoor field labor during advisory window.`,
          "Apply protective mulch and secure irrigation channels before conditions worsen.",
          "Move livestock to covered shelters with adequate water supply.",
          `Wind speed: ${weather.windSpeedKmh} km/h — secure loose structures and shade nets.`,
        ],
        ta: [
          `${district.districtName} மாவட்டத்திற்கான அதிகாரப்பூர்வ எச்சரிக்கை — வெளிப்புற வேலையைத் தவிர்க்கவும்.`,
          "பாசனக் கால்வாய்களைப் பாதுகாக்கவும், மல்ச் போடவும்.",
          "கால்நடைகளை நிழலான இடத்திற்கு மாற்றவும்.",
        ],
      },
    };
  }

  // Heat hazard primary
  if (isHeatHazard) {
    return {
      directive: {
        en: `Protect crops with early morning drip irrigation; avoid field labor between 12 PM – 3:30 PM due to ${weather.temperatureC}°C heat and UV Index ${weather.uvIndex}.`,
        ta: `காலை வேளையில் சொட்டு நீர் பாசனம் செய்யவும்; ${weather.temperatureC}°C வெப்பம் காரணமாக மதியம் 12–3:30 மணி வரை வயல்வெளி வேலையைத் தவிர்க்கவும்.`,
      },
      actions: {
        en: [
          `Irrigate before sunrise to minimize soil evaporation — temperature will peak at ${weather.feelsLikeC}°C.`,
          "Provide shaded water troughs for livestock; apply organic mulch over exposed crop roots.",
          `Shift heavy field labor to after 4 PM — UV Index is dangerously high at ${weather.uvIndex}.`,
          "Carry ORS and adequate water when operating machinery in open fields.",
        ],
        ta: [
          `சூரிய உதயத்திற்கு முன் பாசனம் செய்யவும் — வெப்பநிலை ${weather.feelsLikeC}°C வரை உயரும்.`,
          "கால்நடைகளுக்கு நிழல் மற்றும் நீர் வசதி செய்து தரவும்.",
          "மாலை 4 மணிக்குப் பிறகு கடினமான வேலை செய்யவும்.",
        ],
      },
    };
  }

  // Rain hazard
  if (isRainHazard) {
    return {
      directive: {
        en: `Heavy rainfall alert: ${weather.rainfallMm24h}mm recorded. Protect standing crops and clear drainage channels in ${district.districtName}.`,
        ta: `கனமழை எச்சரிக்கை: ${weather.rainfallMm24h}mm மழை. ${district.districtName} மாவட்டத்தில் பயிர்களைப் பாதுகாக்கவும்.`,
      },
      actions: {
        en: [
          "Clear field drainage channels to prevent waterlogging damage to root systems.",
          "Postpone fertilizer and pesticide application until rainfall subsides.",
          `Wind speed at ${weather.windSpeedKmh} km/h — secure shade nets and temporary structures.`,
        ],
        ta: [
          "வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும்.",
          "மழை குறையும் வரை உரம் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை ஒத்திவைக்கவும்.",
        ],
      },
    };
  }

  // Wind hazard
  if (isWindHazard) {
    return {
      directive: {
        en: `High wind conditions (${weather.windSpeedKmh} km/h) in ${district.districtName}. Secure farm structures and delay spraying activities.`,
        ta: `${district.districtName} மாவட்டத்தில் பலத்த காற்று (${weather.windSpeedKmh} கிமீ/மணி). பண்ணை கட்டமைப்புகளைப் பாதுகாக்கவும்.`,
      },
      actions: {
        en: [
          "Secure shade nets, polyhouses, and temporary roofing materials.",
          "Delay pesticide/herbicide spraying — wind will cause chemical drift.",
          "Keep livestock sheltered until wind speed drops below 30 km/h.",
        ],
        ta: [
          "நிழல் வலைகள் மற்றும் தற்காலிக கூரைகளை பாதுகாக்கவும்.",
          "காற்று குறையும் வரை பூச்சிக்கொல்லி தெளிக்க வேண்டாம்.",
        ],
      },
    };
  }

  // Normal conditions
  return {
    directive: {
      en: `Normal agricultural conditions in ${district.districtName}. Maintain regular field schedules with standard precautions.`,
      ta: `${district.districtName} மாவட்டத்தில் இயல்பான விவசாய நிலை. வழக்கமான வயல்வெளி வேலையைத் தொடரவும்.`,
    },
    actions: {
      en: [
        `Temperature: ${weather.temperatureC}°C, Rainfall: ${weather.rainfallMm24h}mm — favorable conditions for scheduled activities.`,
        "Monitor upcoming forecast for any sudden weather changes.",
      ],
      ta: [
        `வெப்பநிலை: ${weather.temperatureC}°C, மழை: ${weather.rainfallMm24h}mm — இயல்பான நிலை.`,
        "வானிலை மாற்றங்களை தொடர்ந்து கவனிக்கவும்.",
      ],
    },
  };
}

function generateConstructionDirective(
  weather: WeatherData,
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[],
  isOfficialAlertDriven: boolean
): { directive: { en: string; ta: string }; actions: { en: string[]; ta: string[] } } {
  const isWindHazard = weather.windSpeedKmh >= 40;
  const isHeatHazard = weather.temperatureC >= 37 || weather.uvIndex >= 9;
  const isRainHazard = weather.rainfallMm24h >= 50;

  // Official alert driven
  if (isOfficialAlertDriven) {
    const primaryAlert = verifiedAlerts.find((v) => v.report.isVerifiedOfficial);
    return {
      directive: {
        en: `Halt all high-elevation scaffolding & crane work immediately. Official safety directive active for ${district.districtName}.`,
        ta: `${district.districtName} மாவட்டத்தில் அதிகாரப்பூர்வ பாதுகாப்பு உத்தரவு. உடனடியாக உயரமான கட்டுமானப் பணிகளை நிறுத்தவும்.`,
      },
      actions: {
        en: [
          `Official directive: ${primaryAlert?.alert.title || "Construction safety halt ordered"}.`,
          "Dismantle unsecured metal sheets and lower overhead crane booms immediately.",
          "Ensure all site workers take shelter inside solid masonry structures.",
          `Wind speed: ${weather.windSpeedKmh} km/h — exceeds safe threshold for elevated work.`,
        ],
        ta: [
          "தற்காலிக கூரைகள் மற்றும் கிரேன்களை உடனடியாகப் பாதுகாக்கவும்.",
          "அனைத்து ஊழியர்களையும் பாதுகாப்பான கட்டிடத்திற்குள் மாற்றவும்.",
          `காற்று வேகம்: ${weather.windSpeedKmh} கிமீ/மணி — உயர வேலைக்கு பாதுகாப்பான வரம்பை மீறுகிறது.`,
        ],
      },
    };
  }

  // Wind hazard
  if (isWindHazard) {
    return {
      directive: {
        en: `Suspend high-altitude work due to ${weather.windSpeedKmh} km/h wind gusts in ${district.districtName}. Secure all loose materials.`,
        ta: `${weather.windSpeedKmh} கிமீ/மணி வேகக் காற்று. ${district.districtName} மாவட்டத்தில் உயரமான வேலைகளை நிறுத்தவும்.`,
      },
      actions: {
        en: [
          "Lower crane booms and secure scaffolding connections on all active sites.",
          "Beware of flying debris and loose roofing sheets in coastal areas.",
          `Rainfall: ${weather.rainfallMm24h}mm — wet surfaces increase fall risk on scaffolding.`,
        ],
        ta: [
          "கிரேன்களை தாழ்த்தி, சாரக்கட்டு இணைப்புகளைப் பாதுகாக்கவும்.",
          "ஈரமான தளங்களில் விழும் ஆபத்து உள்ளது — எச்சரிக்கையாக இருங்கள்.",
        ],
      },
    };
  }

  // Heat hazard
  if (isHeatHazard) {
    return {
      directive: {
        en: `Avoid prolonged outdoor construction during peak heat (${weather.temperatureC}°C, UV ${weather.uvIndex}). Schedule breaks every 45 minutes.`,
        ta: `உச்ச வெப்பத்தில் (${weather.temperatureC}°C) நீண்ட நேரம் வெளிப்புற வேலை செய்ய வேண்டாம். ஒவ்வொரு 45 நிமிடங்களுக்கும் ஓய்வு எடுக்கவும்.`,
      },
      actions: {
        en: [
          "Provide shaded rest areas and ORS/water stations at all work zones.",
          `Feels-like temperature: ${weather.feelsLikeC}°C — high heat exhaustion risk for outdoor labor.`,
          "Schedule concrete pouring and heavy lifting for early morning or late afternoon.",
        ],
        ta: [
          "அனைத்து வேலை இடங்களிலும் நிழல் ஓய்விடம் மற்றும் நீர் வசதி அளிக்கவும்.",
          "காலை அல்லது மாலை நேரத்தில் கடினமான வேலைகளைத் திட்டமிடவும்.",
        ],
      },
    };
  }

  // Rain hazard
  if (isRainHazard) {
    return {
      directive: {
        en: `Heavy rainfall (${weather.rainfallMm24h}mm) in ${district.districtName}. Suspend excavation and foundation work until conditions improve.`,
        ta: `${district.districtName} மாவட்டத்தில் கனமழை (${weather.rainfallMm24h}mm). அகழ்வாராய்ச்சி மற்றும் அடிப்படை வேலைகளை நிறுத்தவும்.`,
      },
      actions: {
        en: [
          "Dewater excavation pits and protect exposed foundation reinforcement from rust.",
          "Avoid electrical work in wet conditions — electrocution hazard elevated.",
          "Ensure site drainage pumps are operational.",
        ],
        ta: [
          "அகழ்வாராய்ச்சிக் குழிகளில் தேங்கிய நீரை அகற்றவும்.",
          "ஈரமான சூழலில் மின் வேலை செய்ய வேண்டாம்.",
        ],
      },
    };
  }

  // Normal conditions
  return {
    directive: {
      en: `Normal construction conditions in ${district.districtName}. Standard safety protocols apply.`,
      ta: `${district.districtName} மாவட்டத்தில் இயல்பான கட்டுமான நிலை. வழக்கமான பாதுகாப்பு நடைமுறைகளைப் பின்பற்றவும்.`,
    },
    actions: {
      en: [
        `Weather: ${weather.temperatureC}°C, Wind: ${weather.windSpeedKmh} km/h — within safe operating limits.`,
        "Maintain standard PPE compliance and hydration schedules.",
      ],
      ta: [
        `வானிலை: ${weather.temperatureC}°C, காற்று: ${weather.windSpeedKmh} கிமீ/மணி — பாதுகாப்பான வரம்பில்.`,
        "வழக்கமான பாதுகாப்பு உபகரணங்களைப் பயன்படுத்தவும்.",
      ],
    },
  };
}

function generateGenericDirective(
  weather: WeatherData,
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  occupation: OccupationKey,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[],
  isOfficialAlertDriven: boolean
): { directive: { en: string; ta: string }; actions: { en: string[]; ta: string[] } } {
  if (isOfficialAlertDriven) {
    const primaryAlert = verifiedAlerts.find((v) => v.report.isVerifiedOfficial);
    return {
      directive: {
        en: `Official weather advisory active for ${district.districtName}. Exercise caution and follow official instructions.`,
        ta: `${district.districtName} மாவட்டத்திற்கான அதிகாரப்பூர்வ எச்சரிக்கை. உத்தியோகபூர்வ அறிவுறுத்தல்களைப் பின்பற்றவும்.`,
      },
      actions: {
        en: [
          `Official advisory: ${primaryAlert?.alert.title || "Weather advisory in effect"}.`,
          "Avoid unnecessary outdoor travel and stay informed through official channels.",
          "Keep emergency supplies and charged devices ready.",
        ],
        ta: [
          "தேவையற்ற வெளிப்புறப் பயணங்களைத் தவிர்க்கவும்.",
          "அவசர பொருட்களை தயாராக வைக்கவும்.",
        ],
      },
    };
  }

  if (risk.overallScore >= 60) {
    return {
      directive: {
        en: `${risk.primaryHazard} conditions in ${district.districtName}. Limit outdoor exposure and stay weather-aware.`,
        ta: `${district.districtName} மாவட்டத்தில் ${risk.primaryHazard} நிலை. வெளிப்புற நடவடிக்கைகளைக் குறைக்கவும்.`,
      },
      actions: {
        en: [
          `Current: ${weather.temperatureC}°C, Rainfall: ${weather.rainfallMm24h}mm, Wind: ${weather.windSpeedKmh} km/h.`,
          "Avoid waterlogged roads and low-lying areas during transit.",
          "Carry adequate hydration and rain protection as appropriate.",
        ],
        ta: [
          `வெப்பநிலை: ${weather.temperatureC}°C, மழை: ${weather.rainfallMm24h}mm.`,
          "வெள்ளநீர் தேங்கிய சாலைகளைத் தவிர்க்கவும்.",
        ],
      },
    };
  }

  return {
    directive: {
      en: `Normal weather conditions in ${district.districtName}. No specific precautions required for ${occupation} activities.`,
      ta: `${district.districtName} மாவட்டத்தில் இயல்பான வானிலை. ${occupation} நடவடிக்கைகளுக்கு சிறப்பு முன்னெச்சரிக்கை தேவையில்லை.`,
    },
    actions: {
      en: [
        `Weather: ${weather.temperatureC}°C, UV: ${weather.uvIndex} — standard conditions.`,
        "Continue regular activities with standard weather awareness.",
      ],
      ta: [
        `வானிலை: ${weather.temperatureC}°C — இயல்பான நிலை.`,
        "வழக்கமான நடவடிக்கைகளைத் தொடரவும்.",
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Grounding Chain Builder
// ---------------------------------------------------------------------------

function buildGroundingChain(
  isOfficialAlertDriven: boolean,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[],
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  isLive: boolean
): GroundingSource[] {
  const sources: GroundingSource[] = [];

  // Verified official alert sources
  const verifiedOfficials = verifiedAlerts.filter((v) => v.report.isVerifiedOfficial);
  if (verifiedOfficials.length > 0) {
    sources.push({
      type: "verified_official_alert",
      label: `Verified Official Alert (${verifiedOfficials[0].report.issuingAuthority})`,
      detail: verifiedOfficials[0].alert.title,
    });
  }

  // Live weather
  if (isLive) {
    sources.push({
      type: "live_weather",
      label: "Live Weather Telemetry",
      detail: `Open-Meteo High-Res Engine — ${district.districtName}`,
    });
  } else {
    sources.push({
      type: "demo_fallback",
      label: "Demo Persona Data",
      detail: `Phase 1 simulation — ${district.districtName}`,
    });
  }

  // AI risk analysis
  sources.push({
    type: "ai_risk_analysis",
    label: `AI Risk Score: ${risk.overallScore}/100 (${risk.severity.toUpperCase()})`,
    detail: `Primary Hazard: ${risk.primaryHazard} — Occupation: ${risk.occupation}`,
  });

  // District intelligence
  sources.push({
    type: "district_intelligence",
    label: `District Intelligence: ${district.districtName}`,
    detail: `Risk: ${district.districtRiskScore ?? 0}/100 — Hazard: ${district.dominantHazard || district.primaryHazard}`,
  });

  return sources;
}

// ---------------------------------------------------------------------------
// Reasoning Generator
// ---------------------------------------------------------------------------

function buildReasoning(
  severity: RecommendationSeverity,
  isOfficialAlertDriven: boolean,
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  weather: WeatherData,
  occupation: OccupationKey,
  verifiedAlerts: { alert: OfficialAlert; report: AlertVerificationReport }[]
): { en: string; ta: string } {
  if (isOfficialAlertDriven) {
    const alert = verifiedAlerts.find((v) => v.report.isVerifiedOfficial);
    return {
      en: `This recommendation is driven by a VERIFIED OFFICIAL alert from ${alert?.report.issuingAuthority || "Official Authority"} (${alert?.alert.severity.toUpperCase()} severity). The official directive has been combined with live weather data (${weather.temperatureC}°C, ${weather.rainfallMm24h}mm rain, ${weather.windSpeedKmh} km/h wind) and your occupation-specific vulnerability as a ${occupation} to generate a targeted safety action.`,
      ta: `இந்த பரிந்துரை ${alert?.report.issuingAuthority || "அதிகாரப்பூர்வ அமைப்பு"} வெளியிட்ட சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ எச்சரிக்கையின் அடிப்படையில் உருவாக்கப்பட்டது. நேரடி வானிலை தரவு மற்றும் ${occupation} தொழில் பாதிப்பு ஆகியவற்றுடன் இணைக்கப்பட்டுள்ளது.`,
    };
  }

  if (severity === "severe" || severity === "high") {
    return {
      en: `${district.districtName} is experiencing ${risk.primaryHazard} conditions. Your personal risk score is ${risk.overallScore}/100 (${risk.severity.toUpperCase()}) based on current weather (${weather.temperatureC}°C, ${weather.rainfallMm24h}mm rain, wind ${weather.windSpeedKmh} km/h) and your occupation vulnerability as a ${occupation}. District risk is ${district.districtRiskScore ?? 0}/100.`,
      ta: `${district.districtName} மாவட்டத்தில் ${risk.primaryHazard} நிலை நிலவுகிறது. உங்கள் தனிப்பட்ட ஆபத்து மதிப்பெண் ${risk.overallScore}/100 (${risk.severity.toUpperCase()}).`,
    };
  }

  return {
    en: `Weather conditions in ${district.districtName} are currently at ${risk.severity.toUpperCase()} level (score: ${risk.overallScore}/100). Temperature: ${weather.temperatureC}°C, Rainfall: ${weather.rainfallMm24h}mm, Wind: ${weather.windSpeedKmh} km/h. Recommendations are calibrated for ${occupation} activities.`,
    ta: `${district.districtName} மாவட்ட வானிலை ${risk.severity.toUpperCase()} நிலையில் உள்ளது (மதிப்பெண்: ${risk.overallScore}/100). ${occupation} நடவடிக்கைகளுக்காக பரிந்துரைகள் வழங்கப்படுகின்றன.`,
  };
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Generates a personalized, occupation-aware recommendation by combining
 * all upstream Phase 01–05 data through a deterministic priority cascade.
 *
 * This is a pure function with no side effects, no API calls, and no randomness.
 */
export function generatePersonalizedRecommendation(
  profile: UserProfile,
  weather: WeatherData,
  risk: RiskAnalysisResult,
  district: DistrictIntelligence,
  alerts: OfficialAlert[],
  verificationReports: AlertVerificationReport[],
  isLive: boolean
): PersonalizedRecommendationResult {
  // Pair alerts with their verification reports
  const pairedAlerts = alerts.map((alert, idx) => ({
    alert,
    report: verificationReports[idx] || {
      alertId: alert.id,
      status: "unverified" as const,
      isVerifiedOfficial: false,
      issuingAuthority: alert.sourceName,
      checks: [],
      verifiedAt: new Date().toISOString(),
    },
  }));

  const districtRiskScore = district.districtRiskScore ?? 0;

  // Compute severity via priority cascade
  const { severity, isOfficialAlertDriven } = computeSeverity(
    risk.overallScore,
    districtRiskScore,
    pairedAlerts
  );

  // Generate occupation-specific directive and actions
  let result: { directive: { en: string; ta: string }; actions: { en: string[]; ta: string[] } };

  switch (profile.occupation) {
    case "student":
      result = generateStudentDirective(weather, risk, district, pairedAlerts, isOfficialAlertDriven);
      break;
    case "farmer":
      result = generateFarmerDirective(weather, risk, district, pairedAlerts, isOfficialAlertDriven);
      break;
    case "construction":
      result = generateConstructionDirective(weather, risk, district, pairedAlerts, isOfficialAlertDriven);
      break;
    default:
      result = generateGenericDirective(weather, risk, district, profile.occupation, pairedAlerts, isOfficialAlertDriven);
      break;
  }

  // Build grounding chain
  const groundingSources = buildGroundingChain(
    isOfficialAlertDriven,
    pairedAlerts,
    risk,
    district,
    isLive
  );

  // Build reasoning
  const reasoning = buildReasoning(
    severity,
    isOfficialAlertDriven,
    risk,
    district,
    weather,
    profile.occupation,
    pairedAlerts
  );

  // Official alert context
  let officialAlertContext: { en: string; ta?: string } | undefined;
  if (isOfficialAlertDriven) {
    const verifiedAlert = pairedAlerts.find((v) => v.report.isVerifiedOfficial);
    if (verifiedAlert) {
      officialAlertContext = {
        en: `Verified Source: ${verifiedAlert.report.issuingAuthority} — "${verifiedAlert.alert.title}"`,
        ta: verifiedAlert.alert.aiSummary.ta || undefined,
      };
    }
  }

  return {
    id: `rec_p6_${profile.district.toLowerCase().replace(/\s+/g, "_")}_${profile.occupation}`,
    occupation: profile.occupation,
    district: profile.district,
    severity,
    riskScore: risk.overallScore,
    primaryHazard: risk.primaryHazard,
    primaryDirective: result.directive,
    safetyActions: result.actions,
    reasoning,
    isOfficialAlertDriven,
    officialAlertContext,
    groundingSources,
    isLive,
    dataSource: isLive ? "Live Weather + Verified Alerts" : "Phase 1 Demo Persona Simulation",
    upstreamRiskBand: risk.severity,
    generatedAt: new Date().toISOString(),
  };
}
