"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";

// Browser SpeechRecognition interface definitions
interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    item(index: number): {
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
    [index: number]: {
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void)
    | null;
  onresult:
    | ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void)
    | null;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function checkAudioInputSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") ||
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
  );
}

function subscribeNoop() {
  return () => {};
}

export type UseSpeechRecognitionOptions = {
  lang?: string;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
};

export function useSpeechRecognition({
  lang = "en-IN",
  onInterimResult,
  onFinalResult,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    checkAudioInputSupported,
    () => false
  );

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const lastRecognizedTextRef = useRef<string>("");

  const onInterimResultRef = useRef(onInterimResult);
  const onFinalResultRef = useRef(onFinalResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onInterimResultRef.current = onInterimResult;
  }, [onInterimResult]);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Clean up streams & speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const processAudioWithSarvam = async (audioBlob: Blob, languageCode: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "user_speech.wav");
      formData.append("language_code", languageCode);

      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data && !data.fallback && typeof data.transcript === "string" && data.transcript.trim()) {
        return data.transcript.trim();
      }
      return null;
    } catch {
      return null;
    }
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    setIsProcessing(true);

    // Stop live browser SpeechRecognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    // Stop MediaRecorder and trigger Sarvam STT transcription
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Fallback to last recognized text
        setIsProcessing(false);
        if (lastRecognizedTextRef.current.trim()) {
          onFinalResultRef.current?.(lastRecognizedTextRef.current.trim());
        }
      }
    } else {
      setIsProcessing(false);
      if (lastRecognizedTextRef.current.trim()) {
        onFinalResultRef.current?.(lastRecognizedTextRef.current.trim());
      }
    }
  }, []);

  const startListening = useCallback(
    async (overrideLang?: string) => {
      if (typeof window === "undefined") return;

      const activeLang = overrideLang || lang;
      setError(null);
      setTranscript("");
      lastRecognizedTextRef.current = "";
      audioChunksRef.current = [];

      try {
        // 1. Request microphone access for Sarvam audio recording
        let stream: MediaStream | null = null;
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
          } catch (micErr) {
            const errName = micErr instanceof Error ? micErr.name : "";
            if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
              const msg = "Microphone access was denied. Please allow microphone permission in your browser.";
              setError(msg);
              onErrorRef.current?.(msg);
              return;
            }
          }
        }

        // Initialize MediaRecorder for Sarvam STT
        if (stream && typeof MediaRecorder !== "undefined") {
          try {
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
              ? "audio/webm;codecs=opus"
              : MediaRecorder.isTypeSupported("audio/webm")
              ? "audio/webm"
              : "";

            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };

            recorder.onstop = async () => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
              }

              const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });

              // Send to Sarvam STT endpoint
              if (audioBlob.size > 500) {
                const sarvamText = await processAudioWithSarvam(audioBlob, activeLang);
                setIsProcessing(false);

                if (sarvamText) {
                  setTranscript(sarvamText);
                  onFinalResultRef.current?.(sarvamText);
                  return;
                }
              }

              // If Sarvam fallback or empty audio, use live browser transcript
              setIsProcessing(false);
              const fallbackText = lastRecognizedTextRef.current.trim();
              if (fallbackText) {
                onFinalResultRef.current?.(fallbackText);
              }
            };

            recorder.start(100);
            setIsListening(true);
          } catch (recErr) {
            console.warn("[WeatherGPT STT] MediaRecorder init failed:", recErr);
          }
        }

        // 2. Parallel Browser SpeechRecognition for instant live interim feedback
        const SpeechRecognitionClass =
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognitionClass) {
          try {
            const recognition = new SpeechRecognitionClass();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;
            recognition.lang = activeLang;

            recognition.onstart = () => {
              setIsListening(true);
            };

            recognition.onresult = (event: ISpeechRecognitionEvent) => {
              let currentInterim = "";
              let finalTranscript = "";

              for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                if (result.isFinal) {
                  finalTranscript += result[0].transcript;
                } else {
                  currentInterim += result[0].transcript;
                }
              }

              const combined = (finalTranscript || currentInterim).trim();
              if (combined) {
                lastRecognizedTextRef.current = combined;
                setTranscript(combined);
                onInterimResultRef.current?.(combined);
              }
            };

            recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
              if (event.error !== "aborted" && event.error !== "no-speech") {
                console.warn("[WeatherGPT STT] WebSpeech event error:", event.error);
              }
            };

            recognition.onend = () => {
              // Handled by stopListening
            };

            recognitionRef.current = recognition;
            recognition.start();
          } catch (srErr) {
            console.warn("[WeatherGPT STT] WebSpeech start failed:", srErr);
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to initialize microphone.";
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
        setIsListening(false);
        setIsProcessing(false);
      }
    },
    [lang]
  );

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
    lastRecognizedTextRef.current = "";
    audioChunksRef.current = [];
  }, []);

  return {
    isSupported,
    isListening,
    isProcessing,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
