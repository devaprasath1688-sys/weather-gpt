import { verifyOfficialAlert } from "./verifyAlert";
import type { OfficialAlert } from "@/types";

/**
 * Basic Validation Test Suite for Phase 5 Official Alert Verification Engine.
 */
export function runAlertVerificationValidation() {
  const validChennaiAlert: OfficialAlert = {
    id: "alt_chn_test_01",
    district: "Chennai",
    state: "Tamil Nadu",
    sourceName: "District_Collectorate",
    officialRefUrl: "https://chennai.nic.in/press-release-rain-holiday",
    title: "Press Release: School & College Holiday Declared",
    rawAnnouncement: "In view of heavy rainfall forecast, holiday declared for all educational institutions in Chennai.",
    severity: "warning",
    verificationStatus: "verified_official",
    closureDeclared: "schools_and_colleges",
    effectiveFrom: "2026-08-25T00:00:00Z",
    effectiveUntil: "2026-12-31T23:59:59Z", // Active future date
    issuedAt: "2026-08-25T06:00:00Z",
    aiSummary: {
      en: "Holiday declared for schools and colleges in Chennai due to heavy rain.",
    },
  };

  const validReport = verifyOfficialAlert(validChennaiAlert, "Chennai");
  const isVerifiedPass = validReport.status === "verified_official" && validReport.isVerifiedOfficial;

  const expiredAlert: OfficialAlert = {
    ...validChennaiAlert,
    id: "alt_chn_test_expired",
    effectiveUntil: "2025-01-01T00:00:00Z", // Past date
  };

  const expiredReport = verifyOfficialAlert(expiredAlert, "Chennai");
  const isExpiredPass = expiredReport.status === "expired" && !expiredReport.isVerifiedOfficial;

  return {
    isVerifiedPass,
    isExpiredPass,
    validReport,
    expiredReport,
  };
}
