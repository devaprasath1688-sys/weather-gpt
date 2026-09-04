"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Bot, X, Trash2, Send, Loader as Loader2, Sparkles, User, CircleAlert as AlertCircle, Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";
import {
  useSpeechRecognition,
  useSpeechSynthesis,
  getLanguageCode,
} from "@/lib/voice";
import { useLanguage } from "@/contexts/language-context";

export type AssistantContext = {
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
  hourlyForecast?: Array<{
    time: string;
    tempC: number;
    popPercent: number;
    rainfallMm: number;
    condition: string;
  }>;
  dailyForecast?: Array<{
    date: string;
    dayLabel: string;
    tempMaxC: number;
    tempMinC: number;
    popPercent: number;
    condition: string;
  }>;
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
    primaryDirectiveTa?: string;
    safetyActions?: string[];
    safetyActionsTa?: string[];
  };
  verifiedAlerts?: Array<{
    title?: string;
    sourceName?: string;
    severity?: string;
    officialRefUrl?: string;
    effectiveFrom?: string;
    effectiveUntil?: string;
  }>;
  districtInfo?: {
    districtName?: string;
    helpline?: string;
    controlRoom?: string;
    floodZones?: string[];
  };
};

export type WeatherAssistantProps = {
  context: AssistantContext;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

let messageCounter = 0;
function createMessageId(prefix: "usr" | "ast") {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
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

  // Candidate response fallback.
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
  if (!timestamp) return "Just now";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

export function WeatherAssistant({ context }: WeatherAssistantProps) {
  const { t, language } = useLanguage();
  const quickQuestions = [t("assistant.q1"), t("assistant.q2"), t("assistant.q3"), t("assistant.q4")];
  const initialMessages: ChatMessage[] = [{
    id: "initial-assistant-msg",
    role: "assistant",
    content: t("assistant.greeting"),
    createdAt: 0,
  }];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoTtsEnabled, setAutoTtsEnabled] = useState(false);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  const [voiceLangMode, setVoiceLangMode] = useState<"auto" | "ta" | "en">("auto");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const locationLabel = useMemo(() => {
    const district = context?.profile?.district || "your area";
    const state = context?.profile?.state || "Tamil Nadu";

    return `${district}, ${state}`;
  }, [context]);

  // Determine active STT & default TTS language
  const activeSttLang = useMemo(() => {
    if (voiceLangMode === "ta") return "ta-IN";
    if (voiceLangMode === "en") return "en-IN";
    return getLanguageCode(context?.profile?.language || language).sttLang;
  }, [voiceLangMode, context?.profile?.language, language]);

  const defaultTtsLang = useMemo(() => {
    return activeSttLang;
  }, [activeSttLang]);

  // Text-to-Speech Hook
  const {
    isSupported: ttsSupported,
    isSpeaking,
    speakingMessageId,
    speak,
    stop: stopSpeaking,
    toggle: toggleSpeaking,
  } = useSpeechSynthesis({
    defaultLang: defaultTtsLang,
    onError: (err) => {
      console.warn("[WeatherGPT TTS]:", err);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (rawMessage?: string, isVoiceTriggered: boolean = false) => {
      const message = (rawMessage ?? input).trim();

      if (!message || isLoading) {
        return;
      }

      // Stop any ongoing TTS before sending a new prompt
      stopSpeaking();

      setInput("");
      setError("");
      setWasVoiceInput(isVoiceTriggered);

      const now = Date.now();
      const userMessage: ChatMessage = {
        id: createMessageId("usr"),
        role: "user",
        content: message,
        createdAt: now,
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

        if (!response.ok) {
          let serverError = "";

          if (data && typeof data === "object") {
            const obj = data as Record<string, unknown>;

            if (typeof obj.message === "string") {
              serverError = obj.message;
            } else if (typeof obj.error === "string") {
              serverError = obj.error;
            } else if (typeof obj.details === "string") {
              serverError = obj.details;
            }
          }

          throw new Error(
            serverError ||
              `Assistant request failed with status ${response.status}.`
          );
        }

        const assistantText = extractAssistantMessage(data);

        if (!assistantText) {
          throw new Error(
            "The AI returned an empty response. Check the /api/assistant response."
          );
        }

        const assistantMsgId = createMessageId("ast");
        const assistantMessage: ChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: assistantText,
          createdAt: Date.now(),
        };

        setMessages((previous) => [...previous, assistantMessage]);

        // Auto-read response if user enabled Auto-TTS or triggered this query via voice
        if (autoTtsEnabled || isVoiceTriggered) {
          const { ttsLang } = getLanguageCode(language, assistantText);
          speak(assistantText, {
            messageId: assistantMsgId,
            lang: ttsLang,
          });
        }
      } catch (err) {
        console.error("[WeatherGPT Assistant] Request failed:", err);

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unable to connect to the AI assistant.";

        setError(errorMessage);

        setMessages((previous) => [
          ...previous,
          {
            id: createMessageId("ast"),
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
    },
    [input, isLoading, messages, context, stopSpeaking, autoTtsEnabled, speak, language]
  );

  // Speech-to-Text Hook with automatic dispatch on final recognition
  const {
    isSupported: sttSupported,
    isListening,
    isProcessing: isSttProcessing,
    transcript: sttTranscript,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: activeSttLang,
    onInterimResult: (recognizedText) => {
      setInput(recognizedText);
    },
    onFinalResult: (recognizedText) => {
      setInput(recognizedText);
      void sendMessage(recognizedText, true);
    },
    onError: (errMessage) => {
      setError(errMessage);
    },
  });

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setError("");
      resetTranscript();
      stopSpeaking();
      startListening(activeSttLang);
    }
  };

  const clearChat = useCallback(() => {
    stopSpeaking();
    stopListening();
    setMessages(initialMessages);
    setError("");
    setInput("");
  }, [stopSpeaking, stopListening, initialMessages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(undefined, false);
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    const { ttsLang } = getLanguageCode(language, msg.content);
    toggleSpeaking(msg.content, {
      messageId: msg.id,
      lang: ttsLang,
    });
  };  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("assistant.open")}
        className="
          fixed
          bottom-6
          right-6
          z-[100]
          group
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-sky-400/40
          bg-gradient-to-br
          from-sky-500
          to-blue-600
          text-slate-950
          shadow-[0_0_30px_rgba(56,189,248,0.45)]
          transition-all
          duration-300
          hover:scale-110
          hover:shadow-[0_0_40px_rgba(56,189,248,0.6)]
        "
      >
        <Sparkles className="h-6 w-6 fill-current transition-transform duration-300 group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-400 border-2 border-[#040810]" />
        </span>
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
        h-[600px]
        w-[410px]
        max-w-[calc(100vw-24px)]
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-[#1e3f68]
        bg-[#07111e]/95
        shadow-[0_25px_80px_rgba(2,6,23,0.95)]
        backdrop-blur-2xl
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
          border-[#142a47]
          bg-[#0a1628]/95
          px-4
          py-3.5
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-sky-500
              text-slate-950
              font-bold
              shadow-[0_0_15px_rgba(56,189,248,0.5)]
            "
          >
            <Sparkles className="h-4 w-4 fill-current" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-sm font-extrabold text-white">
                Weather<span className="text-sky-400">GPT</span> AI
              </h2>

              <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-sky-300">
                Voice · STT/TTS
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Ground truth climate intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Auto-TTS Audio Toggle */}
          {ttsSupported && (
            <button
              type="button"
              onClick={() => setAutoTtsEnabled((prev) => !prev)}
              title={
                autoTtsEnabled
                  ? t("assistant.autoOn")
                  : t("assistant.autoOff")
              }
              className={`
                rounded-lg p-1.5 transition
                ${
                  autoTtsEnabled
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }
              `}
            >
              {autoTtsEnabled ? (
                <Volume2 className="h-4 w-4 text-sky-400" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={clearChat}
            title={t("assistant.clear")}
            className="
              rounded-lg
              p-1.5
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
            onClick={() => {
              stopSpeaking();
              stopListening();
              setOpen(false);
            }}
            title={t("assistant.close")}
            className="
              rounded-lg
              p-1.5
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
      {/* CONTEXT & LANGUAGE BAR                                     */}
      {/* ========================================================= */}
      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-[#142a47]
          bg-[#07111e]
          px-3.5
          py-2
          text-[9px]
          font-mono
          text-slate-400
        "
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate text-slate-300 font-semibold">{locationLabel}</span>
          <span className="text-slate-600">•</span>
          <span className="capitalize truncate text-sky-300">
            {context?.profile?.occupation || "user"}
          </span>
        </div>

        {/* Language Selection Pill */}
        <div className="flex items-center gap-1 shrink-0 bg-[#0a1628] p-0.5 rounded-lg border border-[#1b3858]">
          <Globe className="h-2.5 w-2.5 text-slate-400 ml-1" />
          <button
            type="button"
            onClick={() => setVoiceLangMode("auto")}
            title={t("assistant.autoOff")}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition ${
              voiceLangMode === "auto"
                ? "bg-sky-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => setVoiceLangMode("en")}
            title={t("assistant.speakEnglish")}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition ${
              voiceLangMode === "en"
                ? "bg-sky-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setVoiceLangMode("ta")}
            title={t("assistant.speakTamil")}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition ${
              voiceLangMode === "ta"
                ? "bg-sky-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MESSAGES CONTAINER                                         */}
      {/* ========================================================= */}
      <div
        className="
          min-h-0
          flex-1
          space-y-3.5
          overflow-y-auto
          px-3.5
          py-4
          scrollbar-thin
        "
      >
        {messages.map((message) => {
          const isUser = message.role === "user";
          const isThisSpeaking = isSpeaking && speakingMessageId === message.id;

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
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
                        ? "bg-[#142a47] text-sky-300"
                        : "bg-sky-500/20 border border-sky-500/30 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
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
                    px-4
                    py-3
                    text-xs
                    leading-relaxed
                    shadow-md
                    ${
                      isUser
                        ? "rounded-br-sm bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.25)]"
                        : "rounded-bl-sm border border-[#193657] bg-[#0a1628] text-slate-100 backdrop-blur-sm"
                    }
                  `}
                >
                  <p className="wgpt-body-text whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  <div
                    className={`mt-2 flex items-center justify-between gap-2 text-[9px] font-mono ${
                      isUser ? "text-sky-100/70" : "text-slate-500"
                    }`}
                  >
                    <span>{formatTime(message.createdAt)}</span>

                    {/* Per-message TTS Audio Speaker Button */}
                    {!isUser && ttsSupported && (
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(message)}
                        title={
                          isThisSpeaking
                            ? t("assistant.stopSpeaking")
                            : t("assistant.listenResponse")
                        }
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          px-2
                          py-0.5
                          bg-[#07111e]
                          border
                          border-[#142a47]
                          text-slate-400
                          transition
                          hover:text-sky-300
                          hover:border-sky-500/40
                        "
                      >
                        {isThisSpeaking ? (
                          <span className="inline-flex items-center gap-1.5 text-sky-300 font-bold font-mono">
                            <div className="flex items-center gap-0.5 h-3">
                              <span className="w-0.5 bg-sky-400 rounded-full animate-sound-wave-1" />
                              <span className="w-0.5 bg-sky-300 rounded-full animate-sound-wave-2" />
                              <span className="w-0.5 bg-sky-400 rounded-full animate-sound-wave-3" />
                            </div>
                            <span>{t("assistant.speaking")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Volume2 className="h-3 w-3" />
                            <span>{t("assistant.listen")}</span>
                          </span>
                        )}
                      </button>
                    )}
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
                  bg-sky-500/20
                  border
                  border-sky-500/30
                  text-sky-400
                "
              >
                <Bot className="h-3.5 w-3.5" />
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2.5
                  rounded-2xl
                  rounded-bl-sm
                  border
                  border-[#193657]
                  bg-[#0a1628]
                  px-4
                  py-3
                "
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />

                <span className="wgpt-body-text text-xs text-slate-300 font-medium">
                  {wasVoiceInput ? t("assistant.analyzing") : t("assistant.thinking")}
                </span>

                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400"
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
      {/* ACTIVE LISTENING / VOICE WAVEFORM VISUALIZER             */}
      {/* ========================================================= */}
      {isListening && (
        <div
          className="
            mx-3
            mb-2
            rounded-2xl
            border
            border-sky-500/40
            bg-gradient-to-r
            from-sky-950/70
            via-[#07111e]
            to-sky-950/70
            p-3
            text-xs
            shadow-[0_0_25px_rgba(56,189,248,0.2)]
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Pulsing Audio Orb */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 animate-voice-orb text-slate-950">
                <Mic className="h-4 w-4 fill-current" />
              </div>

              {/* Dynamic Equalizer Bars */}
              <div className="flex items-center gap-1 h-5">
                <span className="w-1 bg-sky-400 rounded-full animate-sound-wave-1" />
                <span className="w-1 bg-sky-300 rounded-full animate-sound-wave-2" />
                <span className="w-1 bg-sky-400 rounded-full animate-sound-wave-3" />
                <span className="w-1 bg-sky-500 rounded-full animate-sound-wave-4" />
                <span className="w-1 bg-sky-300 rounded-full animate-sound-wave-2" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">
                  {voiceLangMode === "ta" ? "Sarvam தமிழ் Voice STT" : "Sarvam Voice STT"}
                </span>
                <span className="font-semibold text-white text-xs truncate block">
                  {sttTranscript
                    ? `&quot;${sttTranscript}&quot;`
                    : voiceLangMode === "ta"
                    ? "தமிழில் பேசுங்கள்..."
                    : t("assistant.listening")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={stopListening}
              className="shrink-0 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-1.5 text-[11px] font-bold text-slate-950 shadow-md transition-all"
            >
              {t("assistant.done")}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ERROR / WARNING BANNER                                     */}
      {/* ========================================================= */}
      {(error || sttError) && (
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

          <span className="wgpt-body-text">{error || sttError}</span>
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
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isLoading || isListening}
              onClick={() => void sendMessage(question, false)}
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
        {/* INPUT & VOICE CONTROLS                                    */}
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
            disabled={isLoading || isListening}
            placeholder={
              isListening ? `${t("assistant.listen")}...` : `${t("assistant.send")}...`
            }
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

          {/* Voice Input Microphone Button */}
          {sttSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={isLoading}
              title={
                isListening
                  ? "Listening... Click to stop"
                  : `Speak in ${voiceLangMode === "ta" ? "Tamil" : "English/Tanglish"}`
              }
              aria-label={isListening ? t("assistant.close") : t("assistant.listen")}
              className={`
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                transition
                ${
                  isListening
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                    : isSttProcessing
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-sky-300"
                }
              `}
            >
              {isSttProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
              ) : isListening ? (
                <MicOff className="h-4 w-4 text-red-400" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isListening}
            aria-label={t("assistant.send")}
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
            {t("assistant.voiceGrounded")}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default WeatherAssistant;