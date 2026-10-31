import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser-native voice features via the Web Speech API (no paid services).
 *
 * - Speech-to-text: SpeechRecognition / webkitSpeechRecognition. Available in
 *   Chrome, Edge and Safari; not in Firefox. Chrome sends audio to Google's
 *   recognition service, so it needs an internet connection.
 * - Text-to-speech: speechSynthesis. Widely supported, but which languages can
 *   be spoken depends on the voices installed on the visitor's device.
 */

export type VoiceLang = 'en-US' | 'ur-PK';

type RecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

const getRecognitionCtor = (): RecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const RECOGNITION_ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser settings to use voice input.',
  'service-not-allowed': 'Voice input is blocked in this browser. Please type your question instead.',
  'audio-capture': 'No microphone was found. Check that one is connected.',
  network: 'Voice recognition needs an internet connection. Please type your question instead.',
  'language-not-supported': 'Voice input for this language is not supported in this browser.',
};

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const Ctor = getRecognitionCtor();
  const supported = !!Ctor;
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const stop = useCallback(() => recRef.current?.stop(), []);

  const start = useCallback(
    (lang: VoiceLang) => {
      if (!Ctor) return;
      recRef.current?.abort();
      setError(null);
      setInterim('');

      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      let finalText = '';
      rec.onresult = (e: any) => {
        let live = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t;
          else live += t;
        }
        setInterim((finalText + live).trim());
      };
      rec.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        setError(RECOGNITION_ERRORS[e.error] ?? 'Voice input stopped unexpectedly. Please try again.');
      };
      rec.onend = () => {
        setListening(false);
        setInterim('');
        recRef.current = null;
        if (finalText.trim()) onFinalRef.current(finalText.trim());
      };

      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setError('Voice input could not start. Please try again.');
      }
    },
    [Ctor]
  );

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, interim, error, start, stop, clearError: () => setError(null) };
}

/** Removes Markdown so the speech engine doesn't read symbols aloud. */
const toSpeakable = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .trim();

export function useSpeechSynthesis() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const urduVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ur'));
  const englishVoice =
    voices.find((v) => v.lang === 'en-US' && /natural|online|google/i.test(v.name)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en'));

  const canSpeak = (rtl: boolean) => supported && (rtl ? !!urduVoice : true);

  const speak = useCallback(
    (id: string, text: string, rtl: boolean) => {
      if (!supported) return;
      const synth = window.speechSynthesis;
      if (speakingId === id) {
        synth.cancel();
        setSpeakingId(null);
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(toSpeakable(text));
      const voice = rtl ? urduVoice : englishVoice;
      if (voice) u.voice = voice;
      u.lang = rtl ? 'ur-PK' : voice?.lang || 'en-US';
      u.rate = 1;
      u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      synth.speak(u);
    },
    [supported, speakingId, urduVoice, englishVoice]
  );

  const stopSpeaking = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  return { supported, speak, stopSpeaking, speakingId, canSpeak, hasUrduVoice: !!urduVoice };
}
