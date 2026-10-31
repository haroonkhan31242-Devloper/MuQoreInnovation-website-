import React, { useId, useState } from 'react';
import { Plus } from 'lucide-react';

export interface AccordionItem {
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number | null;
}

/**
 * Accessible disclosure list. Height animates with the CSS grid-rows
 * technique, so nothing below jumps and no JS measuring is needed.
 */
export const Accordion: React.FC<AccordionProps> = ({ items, defaultOpen = null }) => {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={i}>
            <h3 className="m-0 text-base font-sans tracking-normal">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-7 sm:py-6"
              >
                <span className="text-base font-semibold text-fg transition-colors group-hover:text-accent sm:text-lg">
                  {item.question}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen ? 'rotate-45 border-accent bg-accent-soft text-accent' : 'border-line text-fg-subtle'
                  }`}
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-expo)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="px-5 pb-6 text-[0.9375rem] leading-relaxed text-fg-muted sm:px-7">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
