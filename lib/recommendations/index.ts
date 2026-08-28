export { generatePersonalizedRecommendation } from "./generateRecommendation";

export const RECOMMENDATIONS_MODULE_PHASE_6 = {
  phase: 6,
  status: "active",
  features: [
    "deterministic_priority_cascade",
    "occupation_aware_directives",
    "verified_alert_priority",
    "multilingual_en_ta",
    "grounding_chain_traceability",
  ],
} as const;
