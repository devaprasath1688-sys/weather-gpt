import { analyzeWeatherRisk } from "./analyzeRisk";
import type { WeatherData } from "@/types";

/**
 * Basic Validation Test Suite for Phase 3 Occupation-Aware Risk Engine.
 */
export function runRiskEngineValidation() {
  const mockHeavyRainWeather: WeatherData = {
    locationName: "Chennai, Tamil Nadu",
    district: "Chennai",
    state: "Tamil Nadu",
    temperatureC: 27,
    feelsLikeC: 30,
    humidityPercent: 92,
    windSpeedKmh: 28,
    rainfallMm24h: 85,
    uvIndex: 2,
    conditionCategory: "heavy_rain",
    conditionDescription: "Torrential downpour & heavy showers",
    updatedAt: "10:00 AM",
  };

  const studentRisk = analyzeWeatherRisk(mockHeavyRainWeather, "student");
  const officeRisk = analyzeWeatherRisk(mockHeavyRainWeather, "office");

  // Assertion: Student should have higher risk for heavy rain due to commute vulnerability
  const studentValid = studentRisk.overallScore >= officeRisk.overallScore;

  const mockHeatwaveWeather: WeatherData = {
    locationName: "Coimbatore, Tamil Nadu",
    district: "Coimbatore",
    state: "Tamil Nadu",
    temperatureC: 41,
    feelsLikeC: 46,
    humidityPercent: 45,
    windSpeedKmh: 12,
    rainfallMm24h: 0,
    uvIndex: 9,
    conditionCategory: "extreme_heat",
    conditionDescription: "Extreme thermal stress & high solar radiation",
    updatedAt: "02:00 PM",
  };

  const farmerRisk = analyzeWeatherRisk(mockHeatwaveWeather, "farmer");
  const constructionRisk = analyzeWeatherRisk(mockHeatwaveWeather, "construction");

  const heatValid = farmerRisk.severity === "severe" && constructionRisk.severity === "severe";

  return {
    studentValid,
    heatValid,
    studentRisk,
    farmerRisk,
    constructionRisk,
  };
}
