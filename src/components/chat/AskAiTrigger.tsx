import React, { ReactNode } from 'react';
import { useChat } from '../../context/ChatContext';

/**
 * Button that opens the AI assistant. Callers render it only when
 * FEATURES.aiAssistant is on, which is also when ChatProvider is mounted.
 */
export function AskAiTrigger({
  className,
  children,
  onOpen,
}: {
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
}) {
  const { openChat } = useChat();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onOpen?.();
        openChat();
      }}
    >
      {children}
    </button>
  );
}
