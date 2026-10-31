import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { EASE_OUT } from '../ui/Reveal';

/** Floating button that opens the assistant. Hidden while the chat is open. */
export const ChatLauncher: React.FC = () => {
  const { isOpen, openChat } = useChat();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          type="button"
          onClick={() => openChat()}
          aria-label="Open MuQore AI assistant"
          aria-haspopup="dialog"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.6 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 items-center gap-2.5 rounded-full border border-cyan-400/30 bg-slate-950/90 pl-2 pr-2 text-white shadow-[0_12px_32px_-8px_rgba(34,211,238,0.45)] backdrop-blur-md transition-[border-color,box-shadow] hover:border-cyan-300/60 hover:shadow-[0_16px_40px_-8px_rgba(34,211,238,0.6)] sm:bottom-6 sm:right-6 sm:pr-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#22d3ee,#2563eb)]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold">Ask MuQore AI</span>
            <span className="block text-xs text-cyan-200/80">English · اردو</span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
