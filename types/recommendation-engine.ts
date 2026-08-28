import type { OccupationKey } from "./profile";
import type { RiskSeverityBand } from "./risk";

// ---------------------------------------------------------------------------
// Phase 6 — Personalized Recommendation Engine Types
// ---------------------------------------------------------------------------

export type RecommendationSeverity =
  | "low"
  | "moderate"
  | "high"
  | "severe"
  | "emergency";

export type GroundingSourceType =
  | "verified_official_alert"
  | "live_weather"
  | "ai_risk_analysis"
  | "district_intelligence"
  | "demo_fallback";

export type GroundingSource = {
  type: GroundingSourceType;
  label: string;
  detail: string;
};

export type PersonalizedRecommendationResult = {
  /** Unique recommendation ID */
  id: string;

  /** Target user occupation */
  occupation: OccupationKey;

  /** Target district */
  district: string;

  /** Computed recommendation severity */
  severity: RecommendationSeverity;

  /** Overall risk score this recommendation is based on (0–100) */
  riskScore: number;

  /** Primary hazard driver for the recommendation */
  primaryHazard: string;

  /** Single clear primary action directive */
  primaryDirective: {
    en: string;
    ta?: string;
  };

  /** 2–4 supporting safety actions */
  safetyActions: {
    en: string[];
    ta?: string[];
  };

  /** Concise explanation of why this recommendation was generated */
  reasoning: {
    en: string;
    ta?: string;
  };

  /** Whether this recommendation was driven by a verified official alert */
  isOfficialAlertDriven: boolean;

  /** Official alert summary if applicable */
  officialAlertContext?: {
    en: string;
    ta?: string;
  };

  /** Grounding chain showing data sources that produced this recommendation */
  groundingSources: GroundingSource[];

  /** Whether upstream data is live or demo */
  isLive: boolean;

  /** Data source label */
  dataSource: string;

  /** Risk severity band from upstream Phase 3 */
  upstreamRiskBand: RiskSeverityBand;

  /** Timestamp */
  generatedAt: string;
};
