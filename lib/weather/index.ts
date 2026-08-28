import "server-only";

export * from "./provider";
export * from "./open-meteo";

export const WEATHER_MODULE_PHASE_2 = {
  phase: 2,
  status: "active",
  providers: ["open-meteo", "weatherapi", "mock_demo"],
} as const;
