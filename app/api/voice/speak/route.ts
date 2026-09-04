import { NextResponse } from "next/server";
import { cleanTextForSpeech } from "@/lib/voice/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

export async function POST(request: Request) {
  const apiKey = process.env.SARVAM_API_KEY;

  try {
    const body = await request.json();
    const rawText = typeof body?.text === "string" ? body.text : "";
    const requestedLang = typeof body?.language_code === "string" ? body.language_code : "";

    const textToSpeak = cleanTextForSpeech(rawText);

    if (!textToSpeak) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Text to speak cannot be empty." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        message: "Sarvam API key not configured. Using client speech synthesis.",
      });
    }

    // Determine Sarvam target language code
    let targetLanguageCode = "en-IN";
    const languageCodes: Record<string, string> = {
      en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", ml: "ml-IN",
      kn: "kn-IN", ur: "ur-IN", mr: "mr-IN", bn: "bn-IN", or: "od-IN",
    };
    targetLanguageCode = languageCodes[requestedLang] || requestedLang || "en-IN";
    if (!Object.values(languageCodes).includes(targetLanguageCode) && !/[\u0B80-\u0BFF]/.test(textToSpeak)) {
      targetLanguageCode = "en-IN";
    }
    if (/[\u0B80-\u0BFF]/.test(textToSpeak)) targetLanguageCode = "ta-IN";

    const speaker = process.env.SARVAM_SPEAKER || "kavitha";
    const ttsModel = process.env.SARVAM_TTS_MODEL || "bulbul:v3";

    const sarvamPayload = {
      inputs: [textToSpeak.slice(0, 500)], // Max 500 characters per utterance chunk
      target_language_code: targetLanguageCode,
      speaker,
      pace: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: ttsModel,
    };

    const sarvamResponse = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sarvamPayload),
    });

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text().catch(() => "");
      console.error("[WeatherGPT Voice] Sarvam TTS failed:", {
        status: sarvamResponse.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          fallback: true,
          error: "SARVAM_TTS_FAILED",
          message: "Sarvam TTS generation failed. Falling back to local speech synthesis.",
        },
        { status: 502 }
      );
    }

    const result = await sarvamResponse.json();
    const base64Audio = result?.audios?.[0];

    if (!base64Audio) {
      return NextResponse.json({
        fallback: true,
        message: "No audio generated from Sarvam TTS.",
      });
    }

    return NextResponse.json({
      fallback: false,
      audio: base64Audio,
      format: "audio/wav",
      language_code: targetLanguageCode,
    });
  } catch (error) {
    console.error("[WeatherGPT Voice] TTS Route error:", error);
    return NextResponse.json(
      {
        fallback: true,
        error: "TTS_ERROR",
        message: "Error processing text-to-speech request.",
      },
      { status: 500 }
    );
  }
}
