import type {
  DistrictIntelligence,
  WeatherData,
  RiskAnalysisResult,
  AffectedArea,
} from "@/types";
import { getSeverityBand } from "@/types/risk";

/** Known District Preset Details for SIH Test Districts */
const KNOWN_DISTRICT_PRESETS: Record<
  string,
  {
    districtId: string;
    state: string;
    helpline: string;
    controlRoom: string;
    baseSubdivisions: Array<{ name: string; subdivision: string }>;
  }
> = {
  Chennai: {
    districtId: "dist_tn_chennai",
    state: "Tamil Nadu",
    helpline: "1077 (District Control)",
    controlRoom: "044-25619206 (GCC Flood Cell)",
    baseSubdivisions: [
      { name: "Velachery & Madipakkam", subdivision: "South Chennai" },
      { name: "Guindy Industrial Area", subdivision: "Central Chennai" },
      { name: "T. Nagar / Kodambakkam", subdivision: "Central Chennai" },
    ],
  },
  Coimbatore: {
    districtId: "dist_tn_coimbatore",
    state: "Tamil Nadu",
    helpline: "1077 (Collectorate)",
    controlRoom: "0422-2301114 (Disaster Management Cell)",
    baseSubdivisions: [
      { name: "Mettupalayam & Foothill Belt", subdivision: "North Coimbatore" },
      { name: "Pollachi Agricultural Sector", subdivision: "South Coimbatore" },
      { name: "Gandhipuram & City Center", subdivision: "Urban Central" },
    ],
  },
  Cuddalore: {
    districtId: "dist_tn_cuddalore",
    state: "Tamil Nadu",
    helpline: "1077 (Collectorate Control)",
    controlRoom: "04142-220700 (Coastal Alert Cell)",
    baseSubdivisions: [
      { name: "Chidambaram & Coastal Delta", subdivision: "East Cuddalore" },
      { name: "Cuddalore Old Town & Port", subdivision: "Coastal Central" },
      { name: "Neyveli Industrial Zone", subdivision: "Inland West" },
    ],
  },
  Madurai: {
    districtId: "dist_tn_madurai",
    state: "Tamil Nadu",
    helpline: "1077 (District Collectorate)",
    controlRoom: "0452-2546100 (Disaster Cell)",
    baseSubdivisions: [
      { name: "Meenakshi Temple Zone", subdivision: "Urban Core" },
      { name: "Melur Agricultural Belt", subdivision: "East Madurai" },
      { name: "Usilampatti Sector", subdivision: "West Madurai" },
    ],
  },
};

/**
 * Calculates District-Level Risk Score (0-100) based on weather signals.
 */
function computeDistrictScore(weather: WeatherData): number {
  const rain24h = Math.max(0, weather.rainfallMm24h || 0);
  const feelsLike = weather.feelsLikeC || weather.temperatureC || 28;
  const windKmh = Math.max(0, weather.windSpeedKmh || 0);
  const uv = Math.max(0, weather.uvIndex || 0);

  let rainScore = 0;
  if (rain24h > 0) {
    if (rain24h <= 15) rainScore = (rain24h / 15) * 30;
    else if (rain24h <= 40) rainScore = 30 + ((rain24h - 15) / 25) * 35;
    else rainScore = Math.min(100, 65 + ((rain24h - 40) / 40) * 35);
  }

  let heatScore = 0;
  if (feelsLike >= 32) {
    if (feelsLike <= 37) heatScore = ((feelsLike - 32) / 5) * 45;
    else heatScore = Math.min(100, 45 + ((feelsLike - 37) / 5) * 55);
  }

  let windScore = 0;
  if (windKmh > 15) {
    windScore = Math.min(100, ((windKmh - 15) / 35) * 80);
  }

  let uvScore = 0;
  if (uv >= 6) {
    uvScore = Math.min(100, ((uv - 5) / 5) * 75);
  }

  return Math.min(100, Math.round(Math.max(rainScore, heatScore, windScore, uvScore)));
}

/**
 * Deterministically generates District-Level Intelligence for any district.
 */
export function calculateDistrictIntelligence(
  districtName: string,
  weather: WeatherData,
  riskResult?: RiskAnalysisResult,
  fallbackDistrict?: DistrictIntelligence,
  isLive: boolean = true,
  dataSource: string = "Open-Meteo High-Res Engine"
): DistrictIntelligence {
  const preset = KNOWN_DISTRICT_PRESETS[districtName] || {
    districtId: `dist_tn_${districtName.toLowerCase()}`,
    state: weather.state || "Tamil Nadu",
    helpline: "1077 (District Control)",
    controlRoom: "044-25619206 (Emergency Cell)",
    baseSubdivisions: [
      { name: `${districtName} Central Sector`, subdivision: "Central Zone" },
      { name: `${districtName} North Sector`, subdivision: "North Zone" },
      { name: `${districtName} South Sector`, subdivision: "South Zone" },
    ],
  };

  const calculatedScore = computeDistrictScore(weather);
  const districtRiskScore = riskResult
    ? Math.max(calculatedScore, riskResult.overallScore)
    : calculatedScore;

  const overallRiskLevel = getSeverityBand(districtRiskScore);

  // Dominant Hazard Detection
  let dominantHazard = "General Meteorological Stability";
  const rain24h = weather.rainfallMm24h || 0;
  const feelsLike = weather.feelsLikeC || weather.temperatureC || 28;
  const windKmh = weather.windSpeedKmh || 0;
  const uv = weather.uvIndex || 0;

  if (rain24h >= 25 || weather.conditionCategory === "heavy_rain" || weather.conditionCategory === "thunderstorm") {
    dominantHazard = "Heavy Rain & Urban Inundation Risk";
  } else if (feelsLike >= 36 || weather.conditionCategory === "extreme_heat") {
    dominantHazard = "Severe Heatwave & Hyperthermia";
  } else if (windKmh >= 35 || weather.conditionCategory === "windy") {
    dominantHazard = "High Wind Gusts & Gale Warnings";
  } else if (uv >= 8) {
    dominantHazard = "Extreme Solar UV Exposure";
  }

  // Determine Vulnerable Occupations
  const vulnerableOccupations: string[] = [];
  if (dominantHazard.includes("Rain")) {
    vulnerableOccupations.push("Student / Academic", "Delivery Worker", "Daily Commuter");
  } else if (dominantHazard.includes("Heat") || dominantHazard.includes("UV")) {
    vulnerableOccupations.push("Farmer / Agriculture", "Outdoor / Construction Worker");
  } else if (dominantHazard.includes("Wind")) {
    vulnerableOccupations.push("Fisher / Coastal", "Driver / Transport", "Scaffolding Worker");
  } else {
    vulnerableOccupations.push("Outdoor Workers", "General Commuters");
  }

  // Generate Sub-area Disruption Levels
  const affectedAreas: AffectedArea[] = preset.baseSubdivisions.map((sub, index) => {
    let areaRisk = overallRiskLevel;
    let disruption = "Normal activity; minor weather watch.";

    if (overallRiskLevel === "severe" || overallRiskLevel === "high") {
      if (index === 0) {
        areaRisk = "severe";
        disruption = dominantHazard.includes("Rain")
          ? "Submerged access roads; local transit diversions."
          : "Severe thermal stress alert; restricted outdoor operations.";
      } else if (index === 1) {
        areaRisk = "high";
        disruption = "Slow moving traffic & heavy surface runoff.";
      } else {
        areaRisk = "elevated";
        disruption = "Moderate disruption; caution advised.";
      }
    } else if (overallRiskLevel === "elevated") {
      areaRisk = index === 0 ? "high" : "moderate";
      disruption = "Localized surface accumulation; exercise caution.";
    }

    return {
      name: sub.name,
      subdivision: sub.subdivision,
      waterloggingRisk: areaRisk,
      disruptionLevel: disruption,
    };
  });

  // Expected Local Impact Statement
  let expectedLocalImpact = `${districtName} District is observing ${weather.conditionDescription} with temperature at ${weather.temperatureC}°C and precipitation at ${weather.rainfallMm24h}mm. Overall district risk is index ${districtRiskScore}/100 (${overallRiskLevel.toUpperCase()}).`;

  if (districtRiskScore >= 70) {
    expectedLocalImpact += " Local administrative flood cells and emergency teams are on active monitoring duty.";
  } else if (districtRiskScore >= 40) {
    expectedLocalImpact += " Commuters and outdoor workers should stay updated on local weather advisories.";
  }

  return {
    districtId: preset.districtId,
    districtName,
    state: preset.state,
    districtRiskScore,
    overallRiskLevel,
    dominantHazard,
    primaryHazard: dominantHazard, // Backward compatibility
    currentWeatherSummary: `${weather.temperatureC}°C · ${weather.conditionDescription} · Rain: ${weather.rainfallMm24h}mm`,
    affectedAreas: fallbackDistrict?.affectedAreas || affectedAreas,
    vulnerableOccupations,
    expectedLocalImpact,
    confidence: 0.95,
    dataSource: isLive ? dataSource : "Phase 1 Persona Simulation Engine",
    isLive,
    activeOfficialAlertsCount: fallbackDistrict?.activeOfficialAlertsCount || (districtRiskScore >= 70 ? 2 : 0),
    emergencyContacts: fallbackDistrict?.emergencyContacts || {
      helpline: preset.helpline,
      controlRoom: preset.controlRoom,
    },
    lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}
