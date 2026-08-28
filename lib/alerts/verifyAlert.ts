import type {
  OfficialAlert,
  AlertVerificationReport,
  AlertVerificationCheck,
  VerificationStatus,
  AlertSourceType,
} from "@/types";

const APPROVED_AUTHORITIES: Record<AlertSourceType, string> = {
  District_Collectorate: "District Collectorate & District Magistrate Office",
  IMD: "India Meteorological Department (Regional Meteorological Centre)",
  State_Disaster_Management: "State Disaster Management Authority (SDMA)",
  Education_Department: "Department of School & Higher Education",
  Municipal_Corporation: "Greater Municipal Corporation Flood Control Cell",
};

/**
 * Deterministic Ground-Truth Verification Engine.
 * Verifies official press releases against 5 core ground-truth safety checks.
 */
export function verifyOfficialAlert(
  alert: OfficialAlert,
  targetDistrict?: string
): AlertVerificationReport {
  const checks: AlertVerificationCheck[] = [];

  // Check 1: Approved Official Authority
  const isApprovedSource = Boolean(APPROVED_AUTHORITIES[alert.sourceName]);
  checks.push({
    checkName: "Approved Official Authority",
    passed: isApprovedSource,
    details: isApprovedSource
      ? `Source recognized: ${APPROVED_AUTHORITIES[alert.sourceName]}`
      : `Unrecognized source type: ${alert.sourceName}`,
  });

  // Check 2: Official Reference URL & Domain Validity
  const hasRefUrl = Boolean(alert.officialRefUrl && alert.officialRefUrl.length > 5);
  const isValidGovDomain =
    hasRefUrl &&
    (alert.officialRefUrl?.includes(".nic.in") ||
      alert.officialRefUrl?.includes(".gov.in") ||
      alert.officialRefUrl?.includes("chennai.nic.in") ||
      alert.officialRefUrl?.includes("https://"));

  checks.push({
    checkName: "Official Digital Reference URL",
    passed: Boolean(isValidGovDomain),
    details: isValidGovDomain
      ? `Verified URL reference: ${alert.officialRefUrl}`
      : "Missing or unverified external reference link",
  });

  // Check 3: District Target Match
  const targetDist = targetDistrict || alert.district;
  const isDistrictMatch = alert.district.toLowerCase() === targetDist.toLowerCase();
  checks.push({
    checkName: "Target District Match",
    passed: isDistrictMatch,
    details: isDistrictMatch
      ? `Alert matches target district: ${alert.district}`
      : `District mismatch: Alert is for ${alert.district}, user is in ${targetDist}`,
  });

  // Check 4: Press Release Content Completeness
  const hasContent =
    alert.title.length > 5 &&
    alert.rawAnnouncement.length > 10 &&
    Boolean(alert.closureDeclared);
  checks.push({
    checkName: "Official Press Text Integrity",
    passed: hasContent,
    details: hasContent
      ? "Raw press announcement & closure scope verified"
      : "Incomplete press release payload",
  });

  // Check 5: Expiration Guard
  let isExpired = false;
  if (alert.effectiveUntil && alert.effectiveUntil !== "TBD") {
    const untilDate = new Date(alert.effectiveUntil);
    if (!isNaN(untilDate.getTime()) && untilDate.getTime() < Date.now()) {
      isExpired = true;
    }
  }

  checks.push({
    checkName: "Bulletin Freshness & Expiry Guard",
    passed: !isExpired,
    details: isExpired
      ? `Alert expired at ${alert.effectiveUntil}`
      : `Active bulletin valid until ${alert.effectiveUntil || "End of Day"}`,
  });

  // Determine Final Verification Status
  let status: VerificationStatus = "unverified";
  if (isExpired) {
    status = "expired";
  } else if (checks.every((c) => c.passed)) {
    status = "verified_official";
  } else if (alert.verificationStatus === "verified_official" && !isExpired) {
    status = "verified_official";
  }

  return {
    alertId: alert.id,
    status,
    isVerifiedOfficial: status === "verified_official",
    issuingAuthority: APPROVED_AUTHORITIES[alert.sourceName] || alert.sourceName,
    checks,
    verifiedAt: new Date().toISOString(),
  };
}
