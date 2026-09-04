/**
 * Cleans markdown formatting, links, and special symbols from text
 * so that SpeechSynthesis speaks naturally without reading syntax aloud.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  return (
    rawText
      // Remove URLs
      .replace(/https?:\/\/\S+/g, "")
      // Remove Markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove bold/italic markers (**text**, *text*, __text__, _text_)
      .replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, "$1")
      // Remove headers (# Header)
      .replace(/^#{1,6}\s+/gm, "")
      // Remove code blocks and inline code (`code`)
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Remove blockquotes (> quote)
      .replace(/^>\s+/gm, "")
      // Remove bullet markers (*, -, +)
      .replace(/^[\s]*[-*+]\s+/gm, "")
      // Remove numbered list markers (1. text)
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Remove emojis or special symbols that might pronounce awkwardly
      .replace(/[•·—–]/g, " ")
      // Collapse multiple whitespace/newlines
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Detects the requested Indian language and selects its voice code.
 * to select the appropriate TTS voice and STT language code.
 */
export function getLanguageCode(
  preferredLanguage?: string,
  text?: string
): { sttLang: string; ttsLang: string } {
  // If user profile explicitly prefers Tamil
  if (preferredLanguage === "ta") {
    return { sttLang: "ta-IN", ttsLang: "ta-IN" };
  }

  const languageCodes: Record<string, string> = {
    en: "en-IN", hi: "hi-IN", te: "te-IN", ml: "ml-IN", kn: "kn-IN",
    ur: "ur-IN", mr: "mr-IN", bn: "bn-IN", or: "od-IN",
  };
  if (preferredLanguage && languageCodes[preferredLanguage]) {
    return { sttLang: languageCodes[preferredLanguage], ttsLang: languageCodes[preferredLanguage] };
  }

  // If text contains Tamil Unicode block
  if (text && /[\u0B80-\u0BFF]/.test(text)) {
    return { sttLang: "ta-IN", ttsLang: "ta-IN" };
  }

  // Default to Indian English (en-IN) for natural WeatherGPT regional experience
  return { sttLang: "en-IN", ttsLang: "en-IN" };
}
