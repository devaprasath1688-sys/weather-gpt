import type { RiskSeverityBand } from "./risk";

export type RiskCategoryLevel = "low" | "moderate" | "elevated" | "high" | "severe";

export type AffectedArea = {
  name: string;
  subdivision: string;
  waterloggingRisk: RiskCategoryLevel;
  disruptionLevel: string;
};

export type DistrictIntelligence = {
  districtId: string;
  districtName: string;
  state: string;
  districtRiskScore?: number; // 0 - 100
  overallRiskLevel: RiskSeverityBand;
  dominantHazard?: string;
  primaryHazard: string; // Preserved backward compatibility
  currentWeatherSummary?: string;
  affectedAreas: AffectedArea[];
  vulnerableOccupations?: string[];
  expectedLocalImpact?: string;
  confidence?: number; // 0.0 - 1.0
  dataSource?: string;
  isLive?: boolean;
  activeOfficialAlertsCount: number;
  emergencyContacts: {
    helpline: string;
    controlRoom: string;
  };
  lastUpdated: string;
};
