import { DISTRICT_COORDINATES } from "./districtCoordinates";

/**
 * Client-side reverse geocoder.
 * Maps lat/lon coordinates to the nearest known Tamil Nadu district
 * using Haversine distance. No external API calls.
 */
export function reverseGeocodeToDistrict(
  lat: number,
  lon: number
): { district: string; distancKm: number } | null {
  let closest: { district: string; distancKm: number } | null = null;

  for (const [name, coord] of Object.entries(DISTRICT_COORDINATES)) {
    const d = haversineKm(lat, lon, coord.lat, coord.lon);
    if (!closest || d < closest.distancKm) {
      closest = { district: name, distancKm: d };
    }
  }

  // Only match if within ~100km of a known district center
  if (closest && closest.distancKm <= 100) {
    return closest;
  }

  return null;
}

/** Haversine formula to compute distance between two lat/lon points in km. */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
