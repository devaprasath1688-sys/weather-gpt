import "server-only";

export * from "./verifyAlert";
export * from "./translateGroundedAlert";
export * from "./provider";

export const ALERTS_MODULE_PHASE_5 = {
  phase: 5,
  status: "active",
  features: [
    "official_authority_validation",
    "digital_ref_url_checking",
    "freshness_expiration_guard",
    "grounded_multilingual_translation",
  ],
} as const;
