"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  LoaderCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import type {
  AssistantChatResponse,
  AssistantMessage,
  WeatherAssistantContext,
} from "@/types";

type WeatherAssistantProps = {
  context: WeatherAssistantContext;
};

const QUICK_ACTIONS = [
  "What is my weather now?",
  "What should I do today?",
  "Any weather risk for me?",
  "Check my forecast",
  "Explain my current risk",
] as const;

function getLocalizedError(message: string): string {
  if (/[\u0B80-\u0BFF]/.test(message)) {
    return "AI சேவை இப்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";
  }

  if (
    /\b(enna|epdi|eppadi|innaiku|inniku|iruku|irukka|venum|pannu|mazhai|veiyil)\b/i.test(
      message
    )
  ) {
    return "AI service ippo available illa. Konjam neram kazhichu meendum try pannunga.";
  }

  return "The AI assistant is unavailable right now. Please try again shortly.";
}

export function WeatherAssistant({
  context,
}: WeatherAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const sendMessage = async (messageText = input) => {
    const content = messageText.trim();

    if (!content || isSending) {
      return;
    }

    const userMessage: AssistantMessage = {
      role: "user",
      content,
    };

    const nextMessages: AssistantMessage[] = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          context,
        }),
      });

      const payload =
        (await response.json()) as AssistantChatResponse & {
          error?: string;
          details?: string;
        };

      if (!response.ok || !payload.message) {
        console.error("[WeatherGPT Assistant]", {
          status: response.status,
          error: payload.error,
          details: payload.details,
        });

        throw new Error(
          payload.error || "AI_SERVICE_UNAVAILABLE"
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.message,
        },
      ]);
    } catch (error) {
      console.error(
        "[WeatherGPT Assistant] Request failed:",
        error
      );

      setError(getLocalizedError(content));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="WeatherGPT AI Assistant"
          className="mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-[#142a47] bg-[#07111e]/95 shadow-2xl backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-[#142a47] bg-[#0a1628]/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                <Bot className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-white">
                  WeatherGPT Assistant
                </h2>

                <p className="text-[10px] font-mono text-sky-300">
                  Context-aware weather guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#0f223d] hover:text-white"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#0f223d] hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#142a47] bg-[#0a1628] p-3 text-xs leading-relaxed text-slate-300">
                  Ask about your current weather, forecast,
                  risk, or today&apos;s recommended actions. I
                  distinguish application data from verified
                  official alerts.
                </div>

                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => sendMessage(action)}
                      disabled={isSending}
                      className="rounded-lg border border-sky-500/25 bg-[#0a1628] px-2.5 py-1.5 text-left text-[11px] font-medium text-sky-200 transition-colors hover:border-sky-400 hover:bg-[#0f223d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-sky-500 text-slate-950"
                      : "border border-[#142a47] bg-[#0a1628] text-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}

            {isSending && (
              <div className="flex w-fit items-center gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] px-3 py-2 text-xs text-slate-300">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-sky-400" />
                Thinking…
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100"
              >
                {error}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-[#142a47] bg-[#07111e] p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-[#142a47] bg-[#0a1628] p-1.5 focus-within:border-sky-500/50">
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Ask WeatherGPT…"
                aria-label="Ask WeatherGPT"
                className="max-h-24 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-slate-950 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {isSending ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500 text-slate-950 shadow-[0_0_22px_rgba(56,189,248,0.45)] transition-transform hover:scale-105 active:scale-95"
        aria-label={
          isOpen
            ? "Minimize WeatherGPT Assistant"
            : "Open WeatherGPT Assistant"
        }
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5 fill-current" />
        )}
      </button>
    </div>
  );
}