import "server-only";

export * from "./analyzeRisk";

export const RISK_MODULE_PHASE_3 = {
  phase: 3,
  status: "active",
  features: ["deterministic_scoring", "occupation_aware_weighting", "severity_banding"],
} as const;
