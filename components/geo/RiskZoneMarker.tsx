"use client";

import type { AffectedArea } from "@/types";
import type { RiskSeverityBand } from "@/types/risk";

export type RiskZoneData = {
  name: string;
  subdivision: string;
  lat: number;
  lon: number;
  riskLevel: RiskSeverityBand;
  disruptionLevel: string;
};

/** Maps risk severity to monochrome circle contrast + radius */
export function getRiskZoneStyle(level: string): { color: string; fillColor: string; radius: number; fillOpacity: number } {
  switch (level) {
    case "severe":
      return { color: "#18181b", fillColor: "#ffffff", radius: 2200, fillOpacity: 0.4 };
    case "high":
      return { color: "#27272a", fillColor: "#e4e4e7", radius: 1800, fillOpacity: 0.32 };
    case "elevated":
      return { color: "#3f3f46", fillColor: "#d4d4d8", radius: 1500, fillOpacity: 0.25 };
    case "moderate":
      return { color: "#52525b", fillColor: "#a1a1aa", radius: 1200, fillOpacity: 0.2 };
    default:
      return { color: "#71717a", fillColor: "#71717a", radius: 800, fillOpacity: 0.15 };
  }
}

/**
 * Generates approximate subdivision coordinates from a district center.
 */
export function generateSubdivisionCoords(
  districtLat: number,
  districtLon: number,
  areas: AffectedArea[]
): RiskZoneData[] {
  const offsets = [
    { dlat: 0.03, dlon: -0.02 },
    { dlat: -0.02, dlon: 0.03 },
    { dlat: -0.03, dlon: -0.03 },
    { dlat: 0.04, dlon: 0.02 },
    { dlat: 0.0, dlon: -0.04 },
  ];

  return areas.map((area, idx) => {
    const offset = offsets[idx % offsets.length];
    return {
      name: area.name,
      subdivision: area.subdivision,
      lat: districtLat + offset.dlat,
      lon: districtLon + offset.dlon,
      riskLevel: area.waterloggingRisk as RiskSeverityBand,
      disruptionLevel: area.disruptionLevel,
    };
  });
}
