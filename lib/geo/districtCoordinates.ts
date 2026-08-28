/**
 * Shared District Coordinate Registry — Client-Safe
 * Extracted from lib/weather/provider.ts for client-side map use.
 * No secrets, no server-only imports.
 */

export type DistrictCoordinate = {
  lat: number;
  lon: number;
  state: string;
  label: string;
};

export const DISTRICT_COORDINATES: Record<string, DistrictCoordinate> = {
  Chennai: { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu", label: "Chennai" },
  Tiruvallur: { lat: 13.1439, lon: 79.9086, state: "Tamil Nadu", label: "Tiruvallur" },
  Chengalpattu: { lat: 12.6819, lon: 79.9888, state: "Tamil Nadu", label: "Chengalpattu" },
  Kanchipuram: { lat: 12.8342, lon: 79.7036, state: "Tamil Nadu", label: "Kanchipuram" },
  Coimbatore: { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu", label: "Coimbatore" },
  Cuddalore: { lat: 11.748, lon: 79.7714, state: "Tamil Nadu", label: "Cuddalore" },
  Madurai: { lat: 9.9252, lon: 78.1198, state: "Tamil Nadu", label: "Madurai" },
  Kanyakumari: { lat: 8.0883, lon: 77.5385, state: "Tamil Nadu", label: "Kanyakumari" },
  Tiruchirappalli: { lat: 10.7905, lon: 78.7047, state: "Tamil Nadu", label: "Tiruchirappalli" },
  Salem: { lat: 11.6643, lon: 78.146, state: "Tamil Nadu", label: "Salem" },
  Thanjavur: { lat: 10.787, lon: 79.1378, state: "Tamil Nadu", label: "Thanjavur" },
};

/** Default center for Tamil Nadu overview */
export const TAMIL_NADU_CENTER: [number, number] = [11.1271, 78.6569];
export const DEFAULT_ZOOM = 8;
export const DISTRICT_ZOOM = 12;
