"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/* -------------------------------------------------------------------------
 * Minimal Web Speech API typings — these interfaces are not part of the
 * standard TypeScript DOM lib, so we declare just the surface we use.
 * ---------------------------------------------------------------------- */
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/** Map raw Web Speech error codes to friendly, user-facing copy. */
function friendlyError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow it in your browser to search by voice.";
    case "no-speech":
      return "We didn't catch that. Try speaking again.";
    case "audio-capture":
      return "No microphone was found on this device.";
    case "network":
      return "Voice search couldn't reach the speech service. Check your connection, or try Google Chrome (some browsers like Brave don't support it).";
    case "aborted":
      return "";
    default:
      return "Voice search hit a snag. Please try again.";
  }
}

export interface UseSpeechRecognition {
  isListening: boolean;
  /** Final recognized text (set once the utterance completes). */
  transcript: string;
  /** Live, in-progress text while the user is still speaking. */
  interim: string;
  /** false when the browser has no Web Speech API. */
  isSupported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * Encapsulates browser voice recognition. Configured per spec:
 * continuous=false, interimResults=true, lang="en-US". Never throws — every
 * failure surfaces via `error` / `isSupported`.
 */
// Support never changes at runtime, so a no-op subscription is enough. Returns
// false on the server so SSR and first client render agree (no hydration flash
// that crashes), then resolves to the real value after hydration.
const noopSubscribe = () => () => {};

export function useSpeechRecognition(): UseSpeechRecognition {
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => getCtor() !== null,
    () => false,
  );
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mountedRef = useRef(true);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The cloud speech service occasionally drops a request; retry a couple of
  // times before surfacing a network error (won't rescue browsers that lack
  // the speech backend entirely, e.g. Brave — those keep erroring and give up).
  const MAX_NETWORK_RETRIES = 2;

  // Build the recognition instance once; wire handlers.
  useEffect(() => {
    mountedRef.current = true;
    const Ctor = getCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += text;
        else interimText += text;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        retriesRef.current = 0; // a good result clears the retry budget
        setTranscript(finalText.trim());
        setInterim("");
      }
    };

    recognition.onerror = (event) => {
      // Transient network blip: silently retry a couple of times.
      if (event.error === "network" && retriesRef.current < MAX_NETWORK_RETRIES) {
        retriesRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          try {
            recognition.start();
          } catch {
            /* already running — ignore */
          }
        }, 400);
        return;
      }
      const message = friendlyError(event.error);
      if (message) setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* nothing to clean up */
      }
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Voice search isn't supported in this browser.");
      return;
    }
    retriesRef.current = 0;
    setTranscript("");
    setInterim("");
    setError(null);
    try {
      recognition.start();
    } catch {
      // start() throws if called while already active — safe to ignore.
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, interim, isSupported, error, start, stop };
}
