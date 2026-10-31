import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { EASE_OUT } from './Reveal';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Centered dialog with focus trap, Escape to close, scroll lock and focus restore. */
export const Modal: React.FC<ModalProps> = ({ open, onClose, labelledBy, children, className = '' }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-bg-elevated shadow-2xl sm:max-w-2xl sm:rounded-3xl ${className}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <button
              type="button"
              onClick={onClose}
              className="icon-btn absolute right-4 top-4 z-10"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
