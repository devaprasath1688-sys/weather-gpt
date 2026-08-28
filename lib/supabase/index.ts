export * from "./client";
export * from "./service";

export const SUPABASE_MODULE = {
  phase: 2,
  status: "active",
  features: ["authentication", "user_profiles", "database_connection"],
} as const;
