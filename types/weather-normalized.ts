import type { WeatherData, HourlyForecast, DailyForecast } from "./weather";

export type WeatherProviderId =
  | "open-meteo"
  | "weatherapi"
  | "openopenweathermap"
  | "mock_demo";

export type WeatherProviderMetadata = {
  providerId: WeatherProviderId;
  providerName: string;
  isLive: boolean;
  attribution: string;
  cachedAt: string;
};

export type WeatherNormalizedPayload = {
  metadata: WeatherProviderMetadata;
  current: WeatherData;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  rawCoordinates: {
    latitude: number;
    longitude: number;
  };
};

export type WeatherQuery = {
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  mode?: "live" | "demo";
};
