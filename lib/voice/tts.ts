"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import { cleanTextForSpeech, getLanguageCode } from "./utils";

function checkSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof Audio !== "undefined" || "speechSynthesis" in window;
}

function subscribeNoop() {
  return () => {};
}

export type UseSpeechSynthesisOptions = {
  defaultLang?: string;
  rate?: number;
  pitch?: number;
  onEnd?: (messageId?: string) => void;
  onError?: (error: string) => void;
};

export function useSpeechSynthesis({
  defaultLang = "en-IN",
  rate = 1.0,
  pitch = 1.0,
  onEnd,
  onError,
}: UseSpeechSynthesisOptions = {}) {
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    checkSpeechSynthesisSupported,
    () => false
  );

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Load available browser voices as fallback
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const updateVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      } catch {
        // Ignore
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      try {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignore
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    // 1. Stop Sarvam HTMLAudio playback
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch {
        // Ignore
      }
      audioPlayerRef.current = null;
    }

    // 2. Stop browser speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const speakWithBrowserSynthesis = useCallback(
    (
      cleanText: string,
      messageId: string,
      targetLang: string,
      customRate?: number,
      customPitch?: number
    ) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = customRate ?? rate;
      utterance.pitch = customPitch ?? pitch;

      if (voices.length > 0) {
        const primary = targetLang.toLowerCase().split("-")[0];

        let matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() === targetLang.toLowerCase() ||
            v.lang.toLowerCase().replace("_", "-") === targetLang.toLowerCase()
        );

        if (!matchedVoice) {
          matchedVoice = voices.find((v) =>
            v.lang.toLowerCase().startsWith(primary)
          );
        }

        if (!matchedVoice) {
          if (primary === "ta") {
            matchedVoice = voices.find((v) => /tamil/i.test(v.name));
          } else if (primary === "en") {
            matchedVoice = voices.find((v) =>
              /india|indian|ravi|heera|english/i.test(v.name)
            );
          }
        }

        if (!matchedVoice) {
          matchedVoice = voices.find((v) => v.default) || voices[0];
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        onEndRef.current?.(messageId);
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("[WeatherGPT TTS] Browser speech synthesis error:", e.error);
        }
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, voices]
  );

  const speak = useCallback(
    async (
      text: string,
      options?: {
        messageId?: string;
        lang?: string;
        rate?: number;
        pitch?: number;
      }
    ) => {
      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) return;

      // Stop any existing speech
      stop();

      const messageId = options?.messageId || "current";
      const { ttsLang } = getLanguageCode(options?.lang || defaultLang, text);
      const targetLang = options?.lang || ttsLang;

      setIsSpeaking(true);
      setSpeakingMessageId(messageId);

      // Attempt Sarvam AI neural TTS first
      try {
        const response = await fetch("/api/voice/speak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            language_code: targetLang,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          if (!data.fallback && typeof data.audio === "string" && data.audio.length > 0) {
            const audioUri = `data:${data.format || "audio/wav"};base64,${data.audio}`;
            const player = new Audio(audioUri);
            audioPlayerRef.current = player;

            player.onended = () => {
              setIsSpeaking(false);
              setSpeakingMessageId(null);
              audioPlayerRef.current = null;
              onEndRef.current?.(messageId);
            };

            player.onerror = () => {
              console.warn("[WeatherGPT TTS] Audio player error, falling back to browser voice.");
              audioPlayerRef.current = null;
              speakWithBrowserSynthesis(
                cleanText,
                messageId,
                targetLang,
                options?.rate,
                options?.pitch
              );
            };

            await player.play();
            return;
          }
        }
      } catch (sarvamErr) {
        console.warn("[WeatherGPT TTS] Sarvam fetch failed, falling back to local speech synthesis:", sarvamErr);
      }

      // Fallback: Browser Web SpeechSynthesis
      speakWithBrowserSynthesis(
        cleanText,
        messageId,
        targetLang,
        options?.rate,
        options?.pitch
      );
    },
    [defaultLang, stop, speakWithBrowserSynthesis]
  );

  const toggle = useCallback(
    (
      text: string,
      options?: {
        messageId?: string;
        lang?: string;
        rate?: number;
        pitch?: number;
      }
    ) => {
      const messageId = options?.messageId || "current";

      if (isSpeaking && speakingMessageId === messageId) {
        stop();
      } else {
        void speak(text, options);
      }
    },
    [isSpeaking, speakingMessageId, stop, speak]
  );

  return {
    isSupported,
    isSpeaking,
    speakingMessageId,
    speak,
    stop,
    toggle,
  };
}
