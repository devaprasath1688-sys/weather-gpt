export type WeatherConditionCategory =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "heavy_rain"
  | "thunderstorm"
  | "extreme_heat"
  | "windy";

export type WeatherData = {
  locationName: string;
  district: string;
  state: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  rainfallMm24h: number;
  uvIndex: number;
  conditionCategory: WeatherConditionCategory;
  conditionDescription: string;
  updatedAt: string;
};

export type HourlyForecast = {
  time: string;
  tempC: number;
  popPercent: number; // Probability of precipitation
  rainfallMm: number;
  condition: WeatherConditionCategory;
};

export type DailyForecast = {
  date: string;
  dayLabel: string;
  tempMaxC: number;
  tempMinC: number;
  popPercent: number;
  condition: WeatherConditionCategory;
};

export type WeatherRiskScore = {
  overallScore: number; // 0 - 100
  rainRiskScore: number;
  heatRiskScore: number;
  windRiskScore: number;
  floodRiskScore: number;
  summaryText: string;
};
