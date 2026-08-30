import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";

export async function POST(request: Request) {
  const apiKey = process.env.SARVAM_API_KEY;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const requestedLang = (formData.get("language_code") as string | null) || "unknown";

    if (!file) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Audio file is required for transcription." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        message: "Sarvam API key is not configured.",
      });
    }

    // Map language parameter to Sarvam's expected format
    let targetLanguageCode = requestedLang;
    if (requestedLang === "ta" || requestedLang === "ta-IN") {
      targetLanguageCode = "ta-IN";
    } else if (requestedLang === "en" || requestedLang === "en-IN") {
      targetLanguageCode = "en-IN";
    } else if (requestedLang === "hi" || requestedLang === "hi-IN") {
      targetLanguageCode = "hi-IN";
    } else {
      targetLanguageCode = "unknown";
    }

    const sarvamFormData = new FormData();
    sarvamFormData.append("file", file, "audio.wav");
    sarvamFormData.append("model", process.env.SARVAM_STT_MODEL || "saaras:v3");
    if (targetLanguageCode && targetLanguageCode !== "unknown") {
      sarvamFormData.append("language_code", targetLanguageCode);
    }
    sarvamFormData.append("with_diacritics", "false");

    const sarvamResponse = await fetch(SARVAM_STT_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey.trim(),
      },
      body: sarvamFormData,
    });

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text().catch(() => "");
      console.error("[WeatherGPT Voice] Sarvam STT failed:", {
        status: sarvamResponse.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          fallback: true,
          error: "SARVAM_STT_FAILED",
          message: "Sarvam transcription service is temporarily unavailable.",
        },
        { status: 502 }
      );
    }

    const result = await sarvamResponse.json();
    const transcript = result?.transcript?.trim();

    if (!transcript) {
      return NextResponse.json(
        {
          fallback: false,
          transcript: "",
          message: "No speech recognized.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      fallback: false,
      transcript,
      language_code: result?.language_code || targetLanguageCode,
    });
  } catch (error) {
    console.error("[WeatherGPT Voice] STT Route error:", error);
    return NextResponse.json(
      {
        fallback: true,
        error: "STT_ERROR",
        message: "Error processing audio transcription.",
      },
      { status: 500 }
    );
  }
}
