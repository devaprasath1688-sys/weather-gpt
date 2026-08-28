import "server-only";

export * from "./calculateDistrictIntelligence";

export const DISTRICT_MODULE_PHASE_4 = {
  phase: 4,
  status: "active",
  features: [
    "district_risk_scoring",
    "dominant_hazard_detection",
    "affected_area_subdivision_mapping",
    "vulnerable_occupation_grouping",
  ],
} as const;
