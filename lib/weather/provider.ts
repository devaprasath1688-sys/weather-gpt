import "server-only";

import type { WeatherNormalizedPayload, WeatherQuery } from "@/types";
import { fetchOpenMeteoWeather } from "./open-meteo";
import { MOCK_PERSONAS } from "@/lib/demo-data";

/** Standard District Coordinate Mapping for Tamil Nadu & Indian Districts */
const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
  Chennai: { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  Tiruvallur: { lat: 13.1439, lon: 79.9086, state: "Tamil Nadu" },
  Chengalpattu: { lat: 12.6819, lon: 79.9888, state: "Tamil Nadu" },
  Kanchipuram: { lat: 12.8342, lon: 79.7036, state: "Tamil Nadu" },
  Coimbatore: { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
  Cuddalore: { lat: 11.748, lon: 79.7714, state: "Tamil Nadu" },
  Madurai: { lat: 9.9252, lon: 78.1198, state: "Tamil Nadu" },
  Kanyakumari: { lat: 8.0883, lon: 77.5385, state: "Tamil Nadu" },
  Tiruchirappalli: { lat: 10.7905, lon: 78.7047, state: "Tamil Nadu" },
  Salem: { lat: 11.6643, lon: 78.146, state: "Tamil Nadu" },
  Thanjavur: { lat: 10.787, lon: 79.1378, state: "Tamil Nadu" },
};

/**
 * Normalizes persona key to Phase 1 persona mock fallback.
 */
function getPersonaFallback(districtName: string): WeatherNormalizedPayload {
  const persona =
    Object.values(MOCK_PERSONAS).find(
      (p) => p.profile.district.toLowerCase() === districtName.toLowerCase()
    ) || MOCK_PERSONAS.chennai_student;

  const currentHour = new Date();
  currentHour.setMinutes(0, 0, 0);

  return {
    metadata: {
      providerId: "mock_demo",
      providerName: "Phase 1 Demo Persona Simulation Engine",
      isLive: false,
      attribution: "WeatherGPT SIH Phase 1 Demo Persona",
      cachedAt: new Date().toISOString(),
    },
    current: persona.weather,
    hourlyForecast: Array.from({ length: 6 }, (_, offset) => {
      const forecastTime = new Date(currentHour);
      forecastTime.setHours(forecastTime.getHours() + offset);

      return {
        time: forecastTime.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: true,
        }),
        tempC: persona.weather.temperatureC - Math.min(offset, 2),
        popPercent: Math.max(50, 80 - offset * 5),
        rainfallMm: Math.max(0, 12 - offset * 2),
        condition: persona.weather.conditionCategory,
      };
    }),
    dailyForecast: [
      { date: "Today", dayLabel: "Today", tempMaxC: persona.weather.temperatureC + 2, tempMinC: persona.weather.temperatureC - 3, popPercent: 85, condition: persona.weather.conditionCategory },
      { date: "Tomorrow", dayLabel: "Tomorrow", tempMaxC: persona.weather.temperatureC + 1, tempMinC: persona.weather.temperatureC - 4, popPercent: 60, condition: persona.weather.conditionCategory },
      { date: "Day 3", dayLabel: "Day 3", tempMaxC: persona.weather.temperatureC, tempMinC: persona.weather.temperatureC - 5, popPercent: 40, condition: "partly_cloudy" },
    ],
    rawCoordinates: {
      latitude: persona.profile.latitude,
      longitude: persona.profile.longitude,
    },
  };
}

/**
 * Main Server-Side Weather Provider Handler.
 * Executes live meteorological queries with automatic district coordinate resolution
 * and fallback to Phase 1 demo mode if network is offline or unconfigured.
 */
export async function getLiveOrFallbackWeather(
  query: WeatherQuery
): Promise<WeatherNormalizedPayload> {
  const district = query.district || "Chennai";

  // If explicit demo mode requested, return Phase 1 persona mock payload directly
  if (query.mode === "demo") {
    return getPersonaFallback(district);
  }

  // Resolve coordinates
  let lat = query.latitude;
  let lon = query.longitude;
  let stateName = query.state || "Tamil Nadu";

  if (lat === undefined || lon === undefined) {
    const coords = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES.Chennai;
    lat = coords.lat;
    lon = coords.lon;
    stateName = coords.state;
  }

  try {
    // Attempt live fetch from Open-Meteo
    return await fetchOpenMeteoWeather(lat, lon, district, stateName);
  } catch (err) {
    // Graceful fallback to Phase 1 mock telemetry if live API times out or fails
    console.warn(`[WeatherGPT Live Weather Warning] Falling back to Phase 1 mock data for ${district}:`, err);
    return getPersonaFallback(district);
  }
}
