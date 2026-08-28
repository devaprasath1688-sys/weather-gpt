import type {
  VerificationStatus,
  OfficialAlert,
} from "./alerts";

export type AlertType =
  | "heavy_rainfall"
  | "school_closure"
  | "college_closure"
  | "heatwave_warning"
  | "cyclone_warning"
  | "general_disaster";

export type AlertVerificationCheck = {
  checkName: string;
  passed: boolean;
  details: string;
};

export type AlertVerificationReport = {
  alertId: string;
  status: VerificationStatus;
  isVerifiedOfficial: boolean;
  issuingAuthority: string;
  checks: AlertVerificationCheck[];
  verifiedAt: string;
};

export type NormalizedAlertPayload = {
  alert: OfficialAlert;
  verificationReport: AlertVerificationReport;
  groundedSummary: {
    en: string;
    hi?: string;
    ta?: string;
  };
  isLive: boolean;
  dataSource: string;
};
