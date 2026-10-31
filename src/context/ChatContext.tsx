import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { isRTL, detectLanguage, type ChatLanguage } from '../data/chatbotKnowledge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isRTL?: boolean;
  language?: ChatLanguage;
}

/** `live` = Gemini connected, `limited` = verified knowledge base only, `unknown` = not checked yet */
export type AssistantMode = 'live' | 'limited' | 'unknown';

interface ChatContextType {
  isOpen: boolean;
  openChat: (initialPrompt?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  retryLast: () => void;
  isLoading: boolean;
  error: string | null;
  clearMessages: () => void;
  mode: AssistantMode;
  language: ChatLanguage;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

class ChatServerError extends Error {}

const STORAGE_KEY = 'muqore_chat_history_v2';
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME_ID = 'welcome';
const welcomeMessage = (): ChatMessage => ({
  id: WELCOME_ID,
  role: 'assistant',
  content:
    "Hi! I'm **MuQore AI**. Ask me anything, from how AI or web development works to our services, pricing and contact details.\n\nAap Urdu ya Roman Urdu mein bhi pooch sakte hain.",
  timestamp: now(),
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Storage may be unavailable
    }
    return [welcomeMessage()];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AssistantMode>('unknown');
  const lastFailedRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // Ignore
    }
  }, [messages]);

  // Ask the server whether the live model is configured
  useEffect(() => {
    let cancelled = false;
    fetch('/api/chat/status')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelled && setMode(d.live ? 'live' : 'limited'))
      .catch(() => !cancelled && setMode('limited'));
    return () => {
      cancelled = true;
    };
  }, []);

  const language: ChatLanguage =
    [...messages].reverse().find((m) => m.role === 'user')?.language ?? 'english';

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || loadingRef.current) return;
    loadingRef.current = true;

    const history = messagesRef.current.filter((m) => m.id !== WELCOME_ID);
    const prevLang = [...history].reverse().find((m) => m.role === 'user')?.language ?? 'english';
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: now(),
      isRTL: isRTL(userText),
      language: detectLanguage(userText, prevLang),
    };

    setError(null);
    lastFailedRef.current = null;
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userText,
          language: prevLang,
          history: history.slice(-12).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      window.clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.reply) {
        // The server explains AI provider failures (bad key, quota, outage) in `message`
        throw new ChatServerError(data.message || `The assistant returned an error (HTTP ${res.status}).`);
      }

      if (data.provider === 'gemini-live') setMode('live');
      else if (data.provider === 'muqore-knowledge-base') setMode('limited');

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: now(),
          isRTL: Boolean(data.isRTL),
          language: data.language,
        },
      ]);
    } catch (err) {
      console.warn('[chat] request failed', err);
      // Remove the unanswered user turn so retry doesn't duplicate it
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      lastFailedRef.current = userText;
      setError(
        err instanceof ChatServerError
          ? err.message
          : err instanceof DOMException && err.name === 'AbortError'
            ? 'The assistant took too long to respond.'
            : "Couldn't reach the assistant. Check your connection and try again."
      );
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const retryLast = useCallback(() => {
    if (lastFailedRef.current) sendMessage(lastFailedRef.current);
  }, [sendMessage]);

  const openChat = useCallback(
    (prompt?: string) => {
      setIsOpen(true);
      if (prompt) sendMessage(prompt);
    },
    [sendMessage]
  );

  // Allow other parts of the page to open the chat via a DOM event
  useEffect(() => {
    const onOpen = (e: Event) => openChat((e as CustomEvent).detail?.prompt);
    window.addEventListener('open-muqore-chat', onOpen);
    return () => window.removeEventListener('open-muqore-chat', onOpen);
  }, [openChat]);

  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((v) => !v), []);

  const clearMessages = useCallback(() => {
    setMessages([welcomeMessage()]);
    setError(null);
    lastFailedRef.current = null;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        sendMessage,
        retryLast,
        isLoading,
        error,
        clearMessages,
        mode,
        language,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
