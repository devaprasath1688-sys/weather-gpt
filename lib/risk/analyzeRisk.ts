import type {
  WeatherData,
  UserProfile,
  OccupationKey,
  RiskAnalysisResult,
  RiskSubScores,
  RiskSeverityBand,
} from "@/types";
import { getSeverityBand } from "@/types/risk";

/**
 * Calculates raw hazard sub-scores from weather signals.
 */
function calculateSubScores(weather: WeatherData): RiskSubScores {
  const rain24h = Math.max(0, weather.rainfallMm24h || 0);
  const feelsLike = weather.feelsLikeC || weather.temperatureC || 28;
  const windKmh = Math.max(0, weather.windSpeedKmh || 0);
  const uv = Math.max(0, weather.uvIndex || 0);

  // 1. Rain Risk Sub-score (0-100)
  let rainRisk = 0;
  if (rain24h > 0) {
    if (rain24h <= 10) rainRisk = (rain24h / 10) * 25;
    else if (rain24h <= 30) rainRisk = 25 + ((rain24h - 10) / 20) * 30;
    else if (rain24h <= 70) rainRisk = 55 + ((rain24h - 30) / 40) * 30;
    else rainRisk = Math.min(100, 85 + ((rain24h - 70) / 50) * 15);
  }
  if (weather.conditionCategory === "heavy_rain") rainRisk = Math.max(rainRisk, 75);
  if (weather.conditionCategory === "thunderstorm") rainRisk = Math.max(rainRisk, 85);

  // 2. Heat Risk Sub-score (0-100)
  let heatRisk = 0;
  if (feelsLike >= 30) {
    if (feelsLike <= 35) heatRisk = ((feelsLike - 30) / 5) * 40;
    else if (feelsLike <= 40) heatRisk = 40 + ((feelsLike - 35) / 5) * 35;
    else heatRisk = Math.min(100, 75 + ((feelsLike - 40) / 5) * 25);
  }
  if (weather.conditionCategory === "extreme_heat") heatRisk = Math.max(heatRisk, 85);

  // 3. Wind Risk Sub-score (0-100)
  let windRisk = 0;
  if (windKmh > 10) {
    if (windKmh <= 25) windRisk = ((windKmh - 10) / 15) * 35;
    else if (windKmh <= 45) windRisk = 35 + ((windKmh - 25) / 20) * 35;
    else windRisk = Math.min(100, 70 + ((windKmh - 45) / 25) * 30);
  }
  if (weather.conditionCategory === "windy") windRisk = Math.max(windRisk, 65);

  // 4. UV Exposure Sub-score (0-100)
  let uvRisk = 0;
  if (uv > 2) {
    if (uv <= 5) uvRisk = ((uv - 2) / 3) * 35;
    else if (uv <= 8) uvRisk = 35 + ((uv - 5) / 3) * 35;
    else uvRisk = Math.min(100, 70 + ((uv - 8) / 4) * 30);
  }

  return {
    rainRisk: Math.round(rainRisk),
    heatRisk: Math.round(heatRisk),
    windRisk: Math.round(windRisk),
    uvRisk: Math.round(uvRisk),
  };
}

/**
 * Returns occupation-specific vulnerability weights.
 */
function getOccupationWeights(occupation: OccupationKey) {
  switch (occupation) {
    case "student":
      return { rain: 1.45, heat: 0.85, wind: 0.9, uv: 0.7 };
    case "farmer":
      return { rain: 1.3, heat: 1.4, wind: 1.2, uv: 1.3 };
    case "construction":
      return { rain: 1.15, heat: 1.5, wind: 1.4, uv: 1.4 };
    case "driver":
    case "delivery":
      return { rain: 1.4, heat: 1.0, wind: 1.3, uv: 0.9 };
    case "fisher":
      return { rain: 1.3, heat: 0.9, wind: 1.6, uv: 1.2 };
    default:
      return { rain: 1.0, heat: 1.0, wind: 1.0, uv: 1.0 };
  }
}

/**
 * Generates human-readable occupation impact statements.
 */
function getOccupationImpactText(
  occupation: OccupationKey,
  primaryHazard: string,
  severity: RiskSeverityBand
): string {
  if (severity === "low") {
    return `Conditions are favorable for normal ${occupation} activities with negligible weather disruption.`;
  }

  switch (occupation) {
    case "student":
      return `Elevated ${primaryHazard.toLowerCase()} threatens campus commute routes, low-lying school paths, and public transit schedules.`;
    case "farmer":
      return `Severe ${primaryHazard.toLowerCase()} risks agricultural soil erosion, crop flooding, or thermal stress on livestock and field crops.`;
    case "construction":
      return `High vulnerability for outdoor worksites: ${primaryHazard.toLowerCase()} risks scaffolding instability, heat exhaustion, and equipment safety hazards.`;
    case "driver":
    case "delivery":
      return `Reduced road traction and flash inundation from ${primaryHazard.toLowerCase()} increase accident risks for two-wheelers and transit vehicles.`;
    case "fisher":
      return `Marine safety advisory: ${primaryHazard.toLowerCase()} creates perilous coastal sea swells and high wind hazards for small craft vessels.`;
    default:
      return `${primaryHazard} may cause moderate travel delays and localized outdoor exposure disruptions.`;
  }
}

/**
 * Generates tailored safety precaution recommendations.
 */
function getRecommendedPrecautions(
  subScores: RiskSubScores,
  occupation: OccupationKey
): string[] {
  const precautions: string[] = [];

  if (subScores.rainRisk >= 40) {
    precautions.push("Avoid commuting through known waterlogged subways and low-lying underpasses.");
    if (occupation === "student") {
      precautions.push("Verify official educational institution closure announcements before departing home.");
    }
  }

  if (subScores.heatRisk >= 40 || subScores.uvRisk >= 50) {
    precautions.push("Maintain continuous hydration with electrolytes and limit direct solar exposure during peak hours (11 AM - 3 PM).");
    if (occupation === "construction" || occupation === "farmer") {
      precautions.push("Schedule heavy physical field operations during early morning or late afternoon hours.");
    }
  }

  if (subScores.windRisk >= 40) {
    precautions.push("Secure loose outdoor equipment and avoid parking vehicles under old tree canopies or temporary hoardings.");
  }

  if (precautions.length === 0) {
    precautions.push("Monitor local meteorological updates and maintain standard safety awareness.");
  }

  return precautions;
}

/**
 * Main Phase 3 AI Risk & Impact Analysis Entry Point.
 * Computes deterministic, occupation-aware weather risk index (0-100).
 */
export function analyzeWeatherRisk(
  weather: WeatherData,
  profileOrOccupation: UserProfile | OccupationKey
): RiskAnalysisResult {
  const occupation =
    typeof profileOrOccupation === "string"
      ? profileOrOccupation
      : profileOrOccupation.occupation;

  const sub = calculateSubScores(weather);
  const weights = getOccupationWeights(occupation);

  // Compute weighted hazard scores
  const weightedRain = sub.rainRisk * weights.rain;
  const weightedHeat = sub.heatRisk * weights.heat;
  const weightedWind = sub.windRisk * weights.wind;
  const weightedUv = sub.uvRisk * weights.uv;

  // Maximum weighted score defines primary risk driver
  const rawScore = Math.max(weightedRain, weightedHeat, weightedWind, weightedUv);
  const overallScore = Math.min(100, Math.round(rawScore));
  const severity = getSeverityBand(overallScore);

  // Identify primary hazard & contributing hazards
  let primaryHazard = "General Atmospheric Stability";
  const contributingHazards: string[] = [];

  if (weightedRain >= Math.max(weightedHeat, weightedWind, weightedUv) && sub.rainRisk > 15) {
    primaryHazard = "Heavy Rainfall & Flash Inundation";
  } else if (weightedHeat >= Math.max(weightedRain, weightedWind, weightedUv) && sub.heatRisk > 15) {
    primaryHazard = "Extreme Heatwave & Thermal Stress";
  } else if (weightedWind >= Math.max(weightedRain, weightedHeat, weightedUv) && sub.windRisk > 15) {
    primaryHazard = "High Wind Gusts & Atmospheric Turbulence";
  } else if (sub.uvRisk >= 50) {
    primaryHazard = "High UV Radiation Exposure";
  }

  if (sub.rainRisk >= 30 && primaryHazard !== "Heavy Rainfall & Flash Inundation") {
    contributingHazards.push("Precipitation Risk");
  }
  if (sub.heatRisk >= 30 && primaryHazard !== "Extreme Heatwave & Thermal Stress") {
    contributingHazards.push("Thermal Stress");
  }
  if (sub.windRisk >= 30 && primaryHazard !== "High Wind Gusts & Atmospheric Turbulence") {
    contributingHazards.push("Wind Gusts");
  }
  if (sub.uvRisk >= 45 && primaryHazard !== "High UV Radiation Exposure") {
    contributingHazards.push("Elevated UV Radiation");
  }

  const occupationImpact = getOccupationImpactText(occupation, primaryHazard, severity);
  const recommendedPrecautions = getRecommendedPrecautions(sub, occupation);

  const explanation = `${weather.district} is experiencing ${weather.conditionDescription}. With temperature at ${weather.temperatureC}°C (feels like ${weather.feelsLikeC}°C), 24h rain at ${weather.rainfallMm24h}mm, and wind speed of ${weather.windSpeedKmh}km/h, calculated risk for ${occupation} profile is ${overallScore}/100 (${severity.toUpperCase()}).`;

  return {
    overallScore,
    severity,
    primaryHazard,
    contributingHazards,
    confidence: 0.95,
    explanation,
    recommendedPrecautions,
    occupationImpact,
    subScores: sub,
    occupation,
    calculatedAt: new Date().toISOString(),
  };
}
