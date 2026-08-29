import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  buildAssistantInstructions,
  detectAssistantLanguageStyle,
  type AssistantMessage,
  type WeatherAssistantContext,
} from "@/lib/ai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AssistantChatRequest } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_HISTORY_MESSAGES = 8;

function isAssistantMessage(value: unknown): value is AssistantMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Record<string, unknown>;

  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  );
}

function isContext(value: unknown): value is WeatherAssistantContext {
  if (!value || typeof value !== "object") return false;

  const context = value as Record<string, unknown>;

  return Boolean(
    context.profile &&
      context.weather &&
      context.forecast &&
      context.risk &&
      context.recommendation &&
      context.verifiedAlerts
  );
}

export async function POST(request: Request) {
  // Gemini API key must remain server-side.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI_SERVICE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  // Keep existing authentication behaviour.
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
  }

  let body: AssistantChatRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  // Keep only valid messages and limit conversation history.
  const messages = Array.isArray(body.messages)
    ? body.messages.filter(isAssistantMessage).slice(-MAX_HISTORY_MESSAGES)
    : [];
if (!messages.length || !isContext(body.context)) {
  return NextResponse.json(
    {
      error: "INVALID_REQUEST",
      details: {
        messagesValid: messages.length > 0,
        contextValid: isContext(body.context),
        hasContext: Boolean(body.context),
        contextKeys:
          body.context && typeof body.context === "object"
            ? Object.keys(body.context)
            : [],
      },
    },
    { status: 400 }
  );
}

  // Find the latest user message for language detection.
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!latestUserMessage) {
    return NextResponse.json(
      { error: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
    });

    // Detect English / Tamil / Tanglish from the latest user message.
    const languageStyle = detectAssistantLanguageStyle(
      latestUserMessage.content
    );

    // Preserve the existing WeatherGPT context and instructions.
    const systemInstructions = buildAssistantInstructions(
      body.context,
      languageStyle
    );

    // Convert existing chat history to Gemini format.
    const conversation = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.7-flash",

      contents: conversation,

      config: {
        systemInstruction: systemInstructions,

        // Keep responses concise for the assistant UI.
        maxOutputTokens: 500,

        // Slightly deterministic responses for weather guidance.
      
      },
    });

    const message = response.text?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "INVALID_AI_RESPONSE" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message,
    });
 } catch (error) {
  console.error("[WeatherGPT Assistant] Gemini request failed:", error);

  return NextResponse.json(
    {
      error: "AI_SERVICE_UNAVAILABLE",
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 502 }
  );
}
}