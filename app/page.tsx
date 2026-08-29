"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  X,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  User,
  AlertCircle,
} from "lucide-react";

type AssistantContext = {
  profile?: {
    district?: string;
    state?: string;
    occupation?: string;
    language?: string;
  };
  weather?: {
    temperatureC?: number;
    feelsLikeC?: number;
    humidityPercent?: number;
    windSpeedKmh?: number;
    rainfallMm24h?: number;
    uvIndex?: number;
    conditionDescription?: string;
    updatedAt?: string;
  };
  forecast?: unknown[];
  risk?: {
    overallScore?: number;
    severity?: string;
    primaryHazard?: string;
    explanation?: string;
    recommendedPrecautions?: string[];
    occupationImpact?: string;
  };
  recommendation?: {
    severity?: string;
    primaryDirective?: string;
    safetyActions?: string[];
  };
  verifiedAlerts?: Array<{
    title?: string;
    sourceName?: string;
    severity?: string;
    officialRefUrl?: string;
    effectiveFrom?: string;
    effectiveUntil?: string;
  }>;
};

type WeatherAssistantProps = {
  context: AssistantContext;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

const QUICK_QUESTIONS = [
  "What is my weather now?",
  "Will it rain today?",
  "What is my risk level?",
  "Is it safe to travel?",
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function extractAssistantMessage(data: unknown): string {
  if (typeof data === "string") {
    return data.trim();
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  const obj = data as Record<string, unknown>;

  const possibleKeys = [
    "message",
    "text",
    "answer",
    "response",
    "reply",
    "content",
  ];

  for (const key of possibleKeys) {
    const value = obj[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  // Handle common nested response formats.
  const nestedKeys = ["data", "result", "output"];

  for (const key of nestedKeys) {
    const nested = obj[key];

    if (nested && typeof nested === "object") {
      const nestedMessage = extractAssistantMessage(nested);

      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  // Gemini-style candidate response fallback.
  const candidates = obj.candidates;

  if (Array.isArray(candidates) && candidates.length > 0) {
    const first = candidates[0];

    if (first && typeof first === "object") {
      const candidate = first as Record<string, unknown>;
      const content = candidate.content;

      if (content && typeof content === "object") {
        const contentObj = content as Record<string, unknown>;
        const parts = contentObj.parts;

        if (Array.isArray(parts)) {
          const text = parts
            .map((part) => {
              if (part && typeof part === "object") {
                const p = part as Record<string, unknown>;
                return typeof p.text === "string" ? p.text : "";
              }

              return "";
            })
            .filter(Boolean)
            .join("\n")
            .trim();

          if (text) {
            return text;
          }
        }
      }
    }
  }

  return "";
}

function formatTime(timestamp: number) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

export function WeatherAssistant({
  context,
}: WeatherAssistantProps) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "assistant",
      content:
        "Hello! I’m your WeatherGPT assistant. How can I help you with the weather, risk, alerts, or travel conditions?",
      createdAt: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const locationLabel = useMemo(() => {
    const district = context?.profile?.district || "your area";
    const state = context?.profile?.state || "Tamil Nadu";

    return `${district}, ${state}`;
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  const sendMessage = async (rawMessage?: string) => {
    const message = (rawMessage ?? input).trim();

    if (!message || isLoading) {
      return;
    }

    setInput("");
    setError("");

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: message,
      createdAt: Date.now(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      body: JSON.stringify({
  messages: [...messages, userMessage].map((msg) => ({
    role: msg.role,
    content: msg.content,
  })),
  context,
}),
      });

      let data: unknown = null;

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log("[WeatherGPT Assistant] API status:", response.status);
      console.log("[WeatherGPT Assistant] API response:", data);

      if (!response.ok) {
        let serverError = "";

        if (data && typeof data === "object") {
          const obj = data as Record<string, unknown>;

          if (typeof obj.details === "string") {
            serverError = obj.details;
          } else if (typeof obj.error === "string") {
            serverError = obj.error;
          } else if (typeof obj.message === "string") {
            serverError = obj.message;
          }
        }

        throw new Error(
          serverError ||
            `Assistant request failed with status ${response.status}.`
        );
      }

      const assistantText = extractAssistantMessage(data);

      if (!assistantText) {
        console.error(
          "[WeatherGPT Assistant] Could not find message in response:",
          data
        );

        throw new Error(
          "The AI returned an empty response. Check the /api/assistant response."
        );
      }

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: assistantText,
        createdAt: Date.now(),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(
        "[WeatherGPT Assistant] Request failed:",
        err
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to connect to the AI assistant.";

      setError(errorMessage);

      setMessages((previous) => [
        ...previous,
        {
          id: makeId(),
          role: "assistant",
          content:
            "Sorry, I couldn't get a response from the AI assistant right now. Please try again.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: makeId(),
        role: "assistant",
        content:
          "Chat cleared. Ask me anything about your current weather, risk, alerts, or travel conditions.",
        createdAt: Date.now(),
      },
    ]);

    setError("");
    setInput("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open WeatherGPT Assistant"
        className="
          fixed
          bottom-5
          right-5
          z-[100]
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          border
          border-sky-400/40
          bg-sky-500
          text-white
          shadow-[0_0_30px_rgba(14,165,233,0.45)]
          transition
          hover:scale-105
          hover:bg-sky-400
        "
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <aside
      className="
        fixed
        bottom-5
        right-5
        z-[100]
        flex
        h-[575px]
        w-[390px]
        max-w-[calc(100vw-24px)]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[#1d3c61]
        bg-[#07111e]
        shadow-[0_20px_70px_rgba(0,0,0,0.55)]
        backdrop-blur-xl
      "
    >
      {/* ========================================================= */}
      {/* HEADER                                                     */}
      {/* ========================================================= */}
      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-[#193450]
          bg-[#0a1628]
          px-4
          py-3.5
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-sky-500
              text-white
              shadow-[0_0_20px_rgba(14,165,233,0.35)]
            "
          >
            <Bot className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-extrabold text-white">
                WeatherGPT Assistant
              </h2>

              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-sky-300">
                AI
              </span>
            </div>

            <p className="text-[10px] text-slate-400">
              Context-aware weather guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearChat}
            title="Clear chat"
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-white/5
              hover:text-slate-200
            "
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            title="Close assistant"
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONTEXT BAR                                                */}
      {/* ========================================================= */}
      <div
        className="
          flex
          shrink-0
          items-center
          gap-2
          border-b
          border-[#142a47]
          bg-[#07111e]
          px-4
          py-2
          text-[9px]
          font-mono
          text-slate-400
        "
      >
        <Sparkles className="h-3 w-3 text-sky-400" />

        <span className="truncate">
          {locationLabel}
        </span>

        <span className="text-slate-600">•</span>

        <span className="capitalize">
          {context?.profile?.occupation || "user"}
        </span>
      </div>

      {/* ========================================================= */}
      {/* MESSAGES                                                   */}
      {/* ========================================================= */}
      <div
        className="
          min-h-0
          flex-1
          space-y-3
          overflow-y-auto
          px-3
          py-4
          scrollbar-thin
        "
      >
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[88%] items-end gap-2 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      isUser
                        ? "bg-slate-700 text-slate-200"
                        : "bg-sky-500/15 text-sky-400"
                    }
                  `}
                >
                  {isUser ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>

                <div
                  className={`
                    rounded-2xl
                    px-3.5
                    py-2.5
                    text-xs
                    leading-relaxed
                    ${
                      isUser
                        ? "rounded-br-md bg-sky-500 text-white"
                        : "rounded-bl-md border border-[#203c5d] bg-[#0d1b2c] text-slate-200"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  <div
                    className={`mt-1.5 text-[8px] ${
                      isUser
                        ? "text-sky-100/70"
                        : "text-slate-500"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ======================================================= */}
        {/* THINKING INDICATOR                                      */}
        {/* ======================================================= */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[88%] items-end gap-2">
              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-sky-500/15
                  text-sky-400
                "
              >
                <Bot className="h-3.5 w-3.5" />
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  rounded-bl-md
                  border
                  border-[#203c5d]
                  bg-[#0d1b2c]
                  px-3.5
                  py-2.5
                "
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />

                <span className="text-xs text-slate-400">
                  Thinking...
                </span>

                <div className="flex gap-1">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-sky-400" />
                  <span
                    className="h-1 w-1 animate-pulse rounded-full bg-sky-400"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-1 w-1 animate-pulse rounded-full bg-sky-400"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================= */}
      {/* ERROR                                                     */}
      {/* ========================================================= */}
      {error && (
        <div
          className="
            mx-3
            mb-2
            flex
            shrink-0
            items-start
            gap-2
            rounded-xl
            border
            border-amber-500/30
            bg-amber-500/10
            px-3
            py-2
            text-[10px]
            text-amber-200
          "
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />

          <span className="leading-relaxed">
            {error}
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK QUESTIONS                                           */}
      {/* ========================================================= */}
      <div
        className="
          shrink-0
          border-t
          border-[#142a47]
          bg-[#07111e]
          px-3
          pt-2.5
        "
      >
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isLoading}
              onClick={() => void sendMessage(question)}
              className="
                shrink-0
                rounded-full
                border
                border-[#234464]
                bg-[#0a1628]
                px-2.5
                py-1.5
                text-[9px]
                font-medium
                text-slate-300
                transition
                hover:border-sky-500/50
                hover:bg-sky-500/10
                hover:text-sky-200
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {question}
            </button>
          ))}
        </div>

        {/* ======================================================= */}
        {/* INPUT                                                    */}
        {/* ======================================================= */}
        <form
          onSubmit={handleSubmit}
          className="
            mb-3
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-[#1b3858]
            bg-[#0a1628]
            p-1.5
            transition
            focus-within:border-sky-500/50
            focus-within:shadow-[0_0_20px_rgba(14,165,233,0.08)]
          "
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading}
            placeholder="Ask WeatherGPT..."
            autoComplete="off"
            className="
              min-w-0
              flex-1
              bg-transparent
              px-2
              py-2
              text-xs
              text-white
              outline-none
              placeholder:text-slate-600
              disabled:cursor-not-allowed
            "
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-sky-500
              text-white
              transition
              hover:bg-sky-400
              disabled:cursor-not-allowed
              disabled:bg-slate-700
              disabled:text-slate-500
            "
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        <div className="pb-2 text-center">
          <span className="text-[8px] font-mono text-slate-600">
            Grounded in current WeatherGPT context
          </span>
        </div>
      </div>
    </aside>
  );
}

export default WeatherAssistant;