import type { OccupationKey } from "./profile";

export type ActionPriority = "urgent" | "recommended" | "info";

export type PersonalizedRecommendation = {
  id: string;
  occupation: OccupationKey;
  district: string;
  riskScore: number;
  priority: ActionPriority;
  headline: {
    en: string;
    hi?: string;
    ta?: string;
  };
  keyActions: {
    en: string[];
    hi?: string[];
    ta?: string[];
  };
  travelAdvice: {
    en: string;
    hi?: string;
    ta?: string;
  };
  officialClosureNotice?: {
    en: string;
    hi?: string;
    ta?: string;
  };
  generatedAt: string;
};
