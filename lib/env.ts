import "server-only";

import type { IntegrationId, IntegrationStatus } from "@/types/health";

const INTEGRATION_ENV: Record<IntegrationId, readonly string[]> = {
  supabase: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ],
  weather: ["WEATHER_API_KEY", "WEATHER_API_BASE_URL"],
  official_alerts: ["OFFICIAL_ALERTS_INGEST_KEY"],
  llm: ["LLM_API_KEY"],
  mapbox: ["NEXT_PUBLIC_MAPBOX_TOKEN"],
  notifications: ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"],
  voice: ["STT_API_KEY", "TTS_API_KEY"],
};

function isSet(name: string): boolean {
  const value = process.env[name];
  return Boolean(value && value.trim().length > 0);
}

export function getIntegrationStatuses(): IntegrationStatus[] {
  return (Object.keys(INTEGRATION_ENV) as IntegrationId[]).map((id) => {
    // Open-Meteo live provider runs in zero-config mode when WEATHER_API_KEY is not set
    if (id === "weather") {
      const configured = true; // Open-Meteo zero-config provider is active by default
      return {
        id,
        configured,
        status: "configured",
      };
    }

    // Supabase requires at least URL and anon key for basic auth functionality
    if (id === "supabase") {
      const urlSet = isSet("NEXT_PUBLIC_SUPABASE_URL");
      const anonKeySet = isSet("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      const configured = urlSet && anonKeySet;
      return {
        id,
        configured,
        status: configured ? "configured" : "not_configured",
      };
    }

    const keys = INTEGRATION_ENV[id];
    const configured = keys.every(isSet);
    return {
      id,
      configured,
      status: configured ? "configured" : "not_configured",
    };
  });
}

export function getHealthPayload() {
  const integrations = getIntegrationStatuses();
  const supabaseConfigured = integrations.find(i => i.id === "supabase")?.configured || false;
  
  return {
    ok: true as const,
    service: "WeatherGPT",
    problemCode: "SIH26068",
    phase: supabaseConfigured ? 2 : 1,
    timestamp: new Date().toISOString(),
    integrations,
    notes: [
      supabaseConfigured 
        ? "Phase 2 Authentication & Database Service is operational via Supabase."
        : "Phase 1 Demo Mode - Authentication and database features require Supabase configuration.",
      "Phase 2 Live Weather & Forecast Service is operational via Open-Meteo High-Res Engine.",
      "Optional key-based weather providers (WeatherAPI/OpenWeatherMap) can be configured via WEATHER_API_KEY.",
      "The WeatherGPT AI Assistant uses the server-side LLM_API_KEY only when configured; voice remains reserved for a later phase.",
      "Secret values are never returned.",
    ],
  };
}
