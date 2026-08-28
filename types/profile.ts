import type { OCCUPATION_KEYS, SUPPORTED_LANGUAGES } from "@/lib/constants";

export type OccupationKey = (typeof OCCUPATION_KEYS)[number];
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export type LocationSource = "gps" | "manual";

export type NotificationPreference = {
  heavyRainfall: boolean;
  officialClosures: boolean;
  heatwavesAndDrought: boolean;
  travelDisruptions: boolean;
  agriculturalImpact: boolean;
};

export type UserProfile = {
  id: string;
  state: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  locationSource: LocationSource;
  occupation: OccupationKey;
  language: LanguageCode;
  activityNotes?: string;
  notificationPreferences: NotificationPreference;
};

/** Shape reserved for onboarding form state. */
export type UserProfileDraft = {
  stateId: string | null;
  districtId: string | null;
  cityId: string | null;
  latitude: number | null;
  longitude: number | null;
  locationSource: LocationSource | null;
  occupationKey: OccupationKey | null;
  language: LanguageCode;
  notificationPreferences: NotificationPreference;
};
