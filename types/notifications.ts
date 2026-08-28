import type { AlertSeverity } from "./alerts";
import type { OccupationKey } from "./profile";

export type NotificationChannel = "web_push" | "sms" | "app_banner";

export type NotificationPayload = {
  id: string;
  recipientUserId: string;
  targetDistrict: string;
  targetOccupation: OccupationKey;
  severity: AlertSeverity;
  title: string;
  body: string;
  reasonForTargeting: string; // Explains why this user received this specific notification
  actionUrl?: string;
  dispatchedAt: string;
};
