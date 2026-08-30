/**
 * WeatherGPT Voice Module — Phase 11
 * Full Client-Side Speech-to-Text (STT) and Text-to-Speech (TTS) Integration.
 */

export * from "./stt";
export * from "./tts";
export * from "./utils";

export const VOICE_MODULE = {
  phase: 11,
  status: "implemented",
  features: [
    "sarvam_ai_stt",
    "sarvam_ai_tts",
    "browser_speech_recognition_fallback",
    "browser_speech_synthesis_fallback",
    "bilingual_tamil_english_tts",
    "markdown_sanitization",
    "audio_control_per_message",
  ],
} as const;
