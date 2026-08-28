export const INTEGRATION_IDS = [
  "supabase",
  "weather",
  "official_alerts",
  "llm",
  "mapbox",
  "notifications",
  "voice",
] as const;

export type IntegrationId = (typeof INTEGRATION_IDS)[number];

export type IntegrationStatus = {
  id: IntegrationId;
  configured: boolean;
  status: "configured" | "not_configured";
};
