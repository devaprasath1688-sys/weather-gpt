export type AlertSeverity = "info" | "advisory" | "warning" | "emergency";

export type AlertSourceType =
  | "IMD"
  | "District_Collectorate"
  | "State_Disaster_Management"
  | "Education_Department"
  | "Municipal_Corporation";

export type VerificationStatus = "verified_official" | "pending_review" | "unverified" | "expired";

export type ClosureScope = "all_schools" | "all_colleges" | "schools_and_colleges" | "none";

export type OfficialAlert = {
  id: string;
  district: string;
  state: string;
  sourceName: AlertSourceType;
  officialRefUrl?: string;
  title: string;
  rawAnnouncement: string;
  severity: AlertSeverity;
  verificationStatus: VerificationStatus;
  closureDeclared: ClosureScope;
  effectiveFrom: string;
  effectiveUntil: string;
  issuedAt: string;
  aiSummary: {
    en: string;
    hi?: string;
    ta?: string;
  };
};
