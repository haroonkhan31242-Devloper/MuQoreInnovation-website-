import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowUp,
  Check,
  Copy,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ChatMarkdown } from './ChatMarkdown';
import { useSpeechRecognition, useSpeechSynthesis, type VoiceLang } from './useVoice';
import { EASE_OUT } from '../ui/Reveal';

const SUGGESTIONS = [
  { text: 'What services does MuQore offer?', rtl: false },
  { text: 'What is artificial intelligence?', rtl: false },
  { text: 'Website aur mobile app mein kya farq hai?', rtl: false },
  { text: 'آپ سے رابطہ کیسے کریں؟', rtl: true },
];

export const MuQoreChatModal: React.FC = () => {
  const { isOpen, closeChat, messages, sendMessage, retryLast, isLoading, error, clearMessages, mode, language } = useChat();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>('en-US');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const tts = useSpeechSynthesis();
  const stt = useSpeechRecognition((text) => {
    sendMessage(text);
    setInput('');
  });

  // Follow the conversation's language for the microphone by default
  useEffect(() => {
    setVoiceLang(language === 'urdu' ? 'ur-PK' : 'en-US');
  }, [language]);

  // Keep the newest message in view
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && isOpen) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, isOpen, error]);

  // Focus, Escape, and mobile scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', onKey);
    const mobile = window.matchMedia('(max-width: 639px)').matches;
    const prevOverflow = document.body.style.overflow;
    if (mobile) document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      tts.stopSpeaking();
      stt.stop();
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, closeChat]);

  // Auto-grow the textarea
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input, stt.interim]);

  const send = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard may be blocked; nothing else to do
    }
  };

  const toggleMic = () => {
    if (stt.listening) stt.stop();
    else {
      tts.stopSpeaking();
      stt.start(voiceLang);
    }
  };

  const showSuggestions = messages.length <= 1 && !isLoading;
  const inputIsRtl = /[؀-ۿ]/.test(input || stt.interim);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby="chat-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.38, ease: EASE_OUT }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-x-0 bottom-0 z-[61] flex h-[min(88dvh,720px)] flex-col overflow-hidden rounded-t-3xl border border-line bg-bg-elevated shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[420px] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#22d3ee,#2563eb)] text-white">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 id="chat-title" className="truncate text-base font-semibold text-fg font-sans tracking-normal">
                    MuQore AI
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${mode === 'live' ? 'bg-emerald-500' : mode === 'limited' ? 'bg-amber-500' : 'bg-fg-subtle'}`}
                      aria-hidden="true"
                    />
                    {mode === 'live' ? 'Online · English & اردو' : mode === 'limited' ? 'Live AI not connected · company info only' : 'Connecting…'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearMessages}
                  className="btn-ghost flex h-10 w-10 items-center justify-center rounded-xl"
                  aria-label="Start a new conversation"
                  title="New conversation"
                >
                  <RotateCcw className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="btn-ghost flex h-10 w-10 items-center justify-center rounded-xl"
                  aria-label="Close assistant"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      dir={m.isRTL ? 'rtl' : 'ltr'}
                      lang={m.isRTL ? 'ur' : undefined}
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed ${
                        isUser
                          ? 'rounded-ee-md bg-[linear-gradient(135deg,#0891b2,#2563eb)] text-white'
                          : 'rounded-es-md border border-line bg-surface text-fg'
                      } ${m.isRTL ? 'urdu text-right' : ''}`}
                    >
                      {isUser ? <p className="whitespace-pre-wrap">{m.content}</p> : <ChatMarkdown content={m.content} onNavigate={closeChat} />}
                    </div>
                    <div className={`mt-1.5 flex items-center gap-1 px-1 text-xs text-fg-subtle ${isUser ? 'flex-row-reverse' : ''}`}>
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <>
                          <button
                            type="button"
                            onClick={() => copy(m.id, m.content)}
                            className="ml-1 rounded-md p-1.5 transition-colors hover:bg-surface-2 hover:text-fg"
                            aria-label={copiedId === m.id ? 'Copied' : 'Copy reply'}
                          >
                            {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                          </button>
                          {tts.supported && (
                            <button
                              type="button"
                              onClick={() => tts.speak(m.id, m.content, !!m.isRTL)}
                              disabled={!tts.canSpeak(!!m.isRTL)}
                              className="rounded-md p-1.5 transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={tts.speakingId === m.id ? 'Stop reading aloud' : 'Read reply aloud'}
                              title={!tts.canSpeak(!!m.isRTL) ? 'No Urdu voice is installed on this device' : undefined}
                            >
                              {tts.speakingId === m.id ? <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> : <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start" role="status">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-es-md border border-line bg-surface px-4 py-3.5">
                    {[0, 0.15, 0.3].map((d) => (
                      <span key={d} className="typing-dot h-2 w-2 rounded-full bg-accent" style={{ animationDelay: `${d}s` }} />
                    ))}
                    <span className="sr-only">MuQore AI is typing</span>
                  </div>
                </motion.div>
              )}

              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p>{error}</p>
                    <button type="button" onClick={retryLast} className="mt-2 font-semibold underline underline-offset-2">
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {showSuggestions && (
                <div className="pt-1">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Try asking</p>
                  <div className="flex flex-col items-start gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.text}
                        type="button"
                        dir={s.rtl ? 'rtl' : 'ltr'}
                        onClick={() => sendMessage(s.text)}
                        className={`rounded-xl border border-line bg-surface px-3.5 py-2 text-left text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg ${s.rtl ? 'urdu text-right !text-[0.95rem] !leading-[1.9]' : ''}`}
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-line p-3 sm:p-4">
              {stt.error && (
                <p role="alert" className="mb-2 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <MicOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {stt.error}
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface p-1.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]"
              >
                {stt.supported && (
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => setVoiceLang((l) => (l === 'en-US' ? 'ur-PK' : 'en-US'))}
                      disabled={stt.listening}
                      className="h-10 rounded-xl px-2 text-xs font-bold text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-50"
                      aria-label={`Voice language: ${voiceLang === 'en-US' ? 'English' : 'Urdu'}. Switch to ${voiceLang === 'en-US' ? 'Urdu' : 'English'}`}
                      title="Voice input language"
                    >
                      {voiceLang === 'en-US' ? 'EN' : 'اردو'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMic}
                      disabled={isLoading}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${
                        stt.listening ? 'bg-red-500 text-white' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                      }`}
                      aria-label={stt.listening ? 'Stop voice input' : 'Speak your question'}
                      aria-pressed={stt.listening}
                    >
                      {stt.listening && <span className="mic-ring absolute inset-0 rounded-xl bg-red-500" aria-hidden="true" />}
                      <Mic className="relative h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                  </div>
                )}
                <label htmlFor="chat-input" className="sr-only">
                  Message MuQore AI
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={stt.listening ? stt.interim : input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  readOnly={stt.listening}
                  dir={inputIsRtl ? 'rtl' : 'auto'}
                  placeholder={stt.listening ? 'Listening…' : 'Ask anything…'}
                  className={`max-h-[140px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-fg placeholder:text-fg-subtle focus:outline-none sm:text-[0.9375rem] ${
                    inputIsRtl ? 'urdu !leading-[1.8]' : ''
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || stt.listening}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#4fe0f5,#22d3ee)] text-[#04131a] transition-opacity disabled:opacity-35"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </form>
              <p className="mt-2 px-1 text-center text-[0.75rem] text-fg-subtle">
                AI answers can be wrong. For quotes and commitments, contact our team.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
