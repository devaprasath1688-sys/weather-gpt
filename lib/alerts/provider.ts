import "server-only";

import type { NormalizedAlertPayload, OfficialAlert } from "@/types";
import { verifyOfficialAlert } from "./verifyAlert";
import { translateGroundedAlert } from "./translateGroundedAlert";
import { MOCK_PERSONAS } from "@/lib/demo-data";

/**
 * Server-Side Official Alert Provider.
 * Fetches official government announcements by district, executes ground-truth verification,
 * and falls back to Phase 1 persona mock alerts when unconfigured.
 */
export async function getOfficialAlertsForDistrict(
  districtName: string
): Promise<NormalizedAlertPayload[]> {
  const isIngestKeyConfigured = Boolean(
    process.env.OFFICIAL_ALERTS_INGEST_KEY &&
      process.env.OFFICIAL_ALERTS_INGEST_KEY.trim().length > 0
  );

  // Retrieve matching Phase 1 persona fallback alert
  const persona =
    Object.values(MOCK_PERSONAS).find(
      (p) => p.profile.district.toLowerCase() === districtName.toLowerCase()
    ) || MOCK_PERSONAS.chennai_student;

  const rawAlerts: OfficialAlert[] = persona.alerts || [];

  return rawAlerts.map((alert) => {
    const verificationReport = verifyOfficialAlert(alert, districtName);
    const groundedSummary = translateGroundedAlert(alert);

    return {
      alert,
      verificationReport,
      groundedSummary,
      isLive: isIngestKeyConfigured,
      dataSource: isIngestKeyConfigured
        ? "Live State Disaster Management Feed"
        : "Phase 1 Persona Ground Truth Simulation",
    };
  });
}
