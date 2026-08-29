import "server-only";

import type {
  WeatherConditionCategory,
  WeatherData,
  HourlyForecast,
  DailyForecast,
  WeatherNormalizedPayload,
} from "@/types";

/**
 * Maps WMO Weather Interpretation Codes (0-99) to WeatherGPT categories and descriptions.
 */
function parseWmoCode(code: number): {
  category: WeatherConditionCategory;
  description: string;
} {
  switch (code) {
    case 0:
      return { category: "clear", description: "Clear sky & high solar clarity" };
    case 1:
    case 2:
      return { category: "partly_cloudy", description: "Partly cloudy with scattered sunshine" };
    case 3:
      return { category: "cloudy", description: "Overcast cloud cover" };
    case 45:
    case 48:
      return { category: "cloudy", description: "Dense fog & reduced visibility" };
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
      return { category: "rain", description: "Moderate steady rainfall" };
    case 65:
    case 80:
    case 81:
    case 82:
      return { category: "heavy_rain", description: "Torrential downpour & heavy showers" };
    case 95:
    case 96:
    case 99:
      return { category: "thunderstorm", description: "Severe thunderstorm & electrical lightning" };
    default:
      return { category: "partly_cloudy", description: "Variable atmospheric conditions" };
  }
}

function formatForecastHour(localTimestamp: string): string {
  const hour = Number(localTimestamp.slice(11, 13));
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return localTimestamp;

  return `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`;
}

/**
 * Server-Side Open-Meteo Meteorological Fetcher.
 * Fetches real-time temperature, precipitation, wind, UV index, hourly & daily forecast.
 */
export async function fetchOpenMeteoWeather(
  latitude: number,
  longitude: number,
  districtName: string = "Target Location",
  stateName: string = "Tamil Nadu"
): Promise<WeatherNormalizedPayload> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,uv_index"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,precipitation,weather_code"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum"
  );
  url.searchParams.set("timezone", "auto");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache server-side for 5 mins
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const hourly = data.hourly || {};
    const daily = data.daily || {};

    const wmo = parseWmoCode(current.weather_code ?? 0);
    const tempC = Math.round(current.temperature_2m ?? 28);
    const feelsLikeC = Math.round(current.apparent_temperature ?? tempC);
    const rainfall24h = Math.round((current.precipitation ?? 0) * 10) / 10;
    const windKmh = Math.round(current.wind_speed_10m ?? 12);
    const uv = Math.round(current.uv_index ?? 5);

    // Dynamic temperature risk overrides
    let finalCategory = wmo.category;
    let finalDescription = wmo.description;
    if (tempC >= 38 && finalCategory !== "heavy_rain" && finalCategory !== "thunderstorm") {
      finalCategory = "extreme_heat";
      finalDescription = `Extreme thermal stress (${tempC}°C) & high solar radiation`;
    }

    const currentWeather: WeatherData = {
      locationName: `${districtName}, ${stateName}`,
      district: districtName,
      state: stateName,
      temperatureC: tempC,
      feelsLikeC: feelsLikeC,
      humidityPercent: Math.round(current.relative_humidity_2m ?? 70),
      windSpeedKmh: windKmh,
      rainfallMm24h: rainfall24h,
      uvIndex: uv,
      conditionCategory: finalCategory,
      conditionDescription: finalDescription,
      updatedAt: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Open-Meteo returns timestamps in the requested location's timezone.
    // Start at that location's current hour, then include the next five hours.
    const hourlyList: HourlyForecast[] = [];
    const hourlyTimes = hourly.time || [];
    const currentHourKey = typeof current.time === "string" ? current.time.slice(0, 13) : "";
    const matchingHourIndex = hourlyTimes.findIndex((time: string) => time.slice(0, 13) === currentHourKey);
    const nextAvailableHourIndex = currentHourKey
      ? hourlyTimes.findIndex((time: string) => time.slice(0, 13) > currentHourKey)
      : -1;
    const startIndex = matchingHourIndex >= 0 ? matchingHourIndex : Math.max(nextAvailableHourIndex, 0);

    for (let i = startIndex; i < Math.min(startIndex + 6, hourlyTimes.length); i++) {
      const hWmo = parseWmoCode(hourly.weather_code?.[i] ?? 0);
      hourlyList.push({
        time: formatForecastHour(hourlyTimes[i]),
        tempC: Math.round(hourly.temperature_2m?.[i] ?? tempC),
        popPercent: Math.round(hourly.precipitation_probability?.[i] ?? 20),
        rainfallMm: Math.round((hourly.precipitation?.[i] ?? 0) * 10) / 10,
        condition: hWmo.category,
      });
    }

    // Build daily forecast (next 5 days)
    const dailyList: DailyForecast[] = [];
    const dailyTimes = daily.time || [];
    for (let i = 0; i < Math.min(5, dailyTimes.length); i++) {
      const dDate = new Date(dailyTimes[i]);
      const dayLabel = dDate.toLocaleDateString("en-US", { weekday: "short" });
      const dWmo = parseWmoCode(daily.weather_code?.[i] ?? 0);
      dailyList.push({
        date: dailyTimes[i],
        dayLabel: dayLabel,
        tempMaxC: Math.round(daily.temperature_2m_max?.[i] ?? tempC + 3),
        tempMinC: Math.round(daily.temperature_2m_min?.[i] ?? tempC - 4),
        popPercent: Math.round(daily.precipitation_probability_max?.[i] ?? 30),
        condition: dWmo.category,
      });
    }

    return {
      metadata: {
        providerId: "open-meteo",
        providerName: "Open-Meteo High-Res Meteorological Engine",
        isLive: true,
        attribution: "Open-Meteo Weather API (WMO Normalized)",
        cachedAt: new Date().toISOString(),
      },
      current: currentWeather,
      hourlyForecast: hourlyList,
      dailyForecast: dailyList,
      rawCoordinates: {
        latitude,
        longitude,
      },
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
