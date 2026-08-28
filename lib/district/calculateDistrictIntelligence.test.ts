import { calculateDistrictIntelligence } from "./calculateDistrictIntelligence";
import type { WeatherData } from "@/types";

/**
 * Basic Validation Test Suite for Phase 4 District-Level Intelligence Engine.
 */
export function runDistrictEngineValidation() {
  const mockChennaiWeather: WeatherData = {
    locationName: "Guindy, Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    temperatureC: 27,
    feelsLikeC: 31,
    humidityPercent: 94,
    windSpeedKmh: 42,
    rainfallMm24h: 118.5,
    uvIndex: 2,
    conditionCategory: "heavy_rain",
    conditionDescription: "Torrential downpour & coastal storm surge",
    updatedAt: "10:00 AM",
  };

  const chennaiIntel = calculateDistrictIntelligence("Chennai", mockChennaiWeather);

  // Assertion: High rain weather should trigger Heavy Rain dominant hazard & severe risk
  const chennaiValid =
    (chennaiIntel.dominantHazard || "").includes("Rain") &&
    (chennaiIntel.districtRiskScore || 0) >= 70;

  const mockCoimbatoreWeather: WeatherData = {
    locationName: "Gandhipuram, Coimbatore",
    district: "Coimbatore",
    state: "Tamil Nadu",
    temperatureC: 41,
    feelsLikeC: 46,
    humidityPercent: 40,
    windSpeedKmh: 12,
    rainfallMm24h: 0,
    uvIndex: 9,
    conditionCategory: "extreme_heat",
    conditionDescription: "Extreme thermal stress & heatwave",
    updatedAt: "02:00 PM",
  };

  const coimbatoreIntel = calculateDistrictIntelligence("Coimbatore", mockCoimbatoreWeather);

  const coimbatoreValid =
    (coimbatoreIntel.dominantHazard || "").includes("Heat") &&
    (coimbatoreIntel.districtRiskScore || 0) >= 70;

  return {
    chennaiValid,
    coimbatoreValid,
    chennaiIntel,
    coimbatoreIntel,
  };
}
