export const APP_NAME = "WeatherGPT";
export const SIH_PROBLEM_CODE = "SIH26068";
export const CURRENT_PHASE = 7;

export const TRUST_LINE =
  "Official authorities make decisions. AI does not invent or declare government closures.";

export const PRODUCT_FLOW = [
  "User Profile / Location",
  "Live Weather + Forecast",
  "AI Risk & Impact Analysis",
  "District-Level Intelligence",
  "Official Alerts / Closures + Verification",
  "Personalized Recommendation",
  "Right User → Right Notification",
] as const;

export const CORE_DIFFERENTIATORS = [
  "Occupation and activity-based weather risk",
  "District-specific intelligence",
  "Official school, college, and emergency alerts",
  "Official alert verification",
  "Personalized travel and weather recommendations",
  "Multilingual voice interaction",
  "Location-based notifications",
  "Personal weather-risk score",
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
] as const;

export const DISTRICT_OPTIONS = [
  "Chennai",
  "Chengalpattu",
  "Kanchipuram",
  "Tiruvallur",
  "Coimbatore",
  "Cuddalore",
  "Madurai",
  "Kanyakumari",
  "Tiruchirappalli",
  "Salem",
  "Thanjavur",
] as const;

export const OCCUPATION_KEYS = [
  "student",
  "farmer",
  "driver",
  "delivery",
  "construction",
  "fisher",
  "office",
  "other",
] as const;
