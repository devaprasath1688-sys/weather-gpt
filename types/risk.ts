import type { OccupationKey } from "./profile";

export type RiskSeverityBand =
  | "low"
  | "moderate"
  | "elevated"
  | "high"
  | "severe";

export type RiskSubScores = {
  rainRisk: number; // 0 - 100
  heatRisk: number; // 0 - 100
  windRisk: number; // 0 - 100
  uvRisk: number;   // 0 - 100
};

export type RiskAnalysisResult = {
  overallScore: number; // 0 - 100
  severity: RiskSeverityBand;
  primaryHazard: string;
  contributingHazards: string[];
  confidence: number; // 0.0 - 1.0
  explanation: string;
  recommendedPrecautions: string[];
  occupationImpact: string;
  subScores: RiskSubScores;
  occupation: OccupationKey;
  calculatedAt: string;
};

export function getSeverityBand(score: number): RiskSeverityBand {
  if (score <= 20) return "low";
  if (score <= 40) return "moderate";
  if (score <= 60) return "elevated";
  if (score <= 80) return "high";
  return "severe";
}
