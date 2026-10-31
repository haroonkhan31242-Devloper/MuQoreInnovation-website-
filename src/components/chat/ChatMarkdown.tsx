import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT } from '../../config/contact';

/**
 * Minimal, safe Markdown for chat replies: paragraphs, bullet and numbered
 * lists, **bold**, *italic*, `code` and [links](url). Never uses innerHTML.
 * Email addresses and the official phone numbers become clickable.
 */

const INLINE = /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|[\w.+-]+@[\w-]+\.[\w.]+|\b0\d{3}\s?\d{7}\b)/g;

function renderInline(text: string, onNavigate: () => void, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const token = m[0];
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const key = `${keyBase}-${i++}`;

    if (token.startsWith('[')) {
      const [, label, url] = token.match(/\[([^\]]+)\]\(([^)\s]+)\)/) ?? [];
      if (url?.startsWith('/')) {
        out.push(
          <Link key={key} to={url} onClick={onNavigate} className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
            {label}
          </Link>
        );
      } else if (url && /^https?:\/\//.test(url)) {
        out.push(
          <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline decoration-accent/40 underline-offset-2">
            {label}
          </a>
        );
      } else {
        out.push(label ?? token);
      }
    } else if (token.startsWith('**')) {
      out.push(<strong key={key} className="font-semibold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      out.push(<code key={key} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('*')) {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.includes('@')) {
      out.push(<a key={key} href={`mailto:${token}`} dir="ltr" className="inline-block max-w-full font-medium text-accent underline underline-offset-2 [overflow-wrap:anywhere] [unicode-bidi:isolate]">{token}</a>);
    } else {
      const digits = token.replace(/\s/g, '');
      const official = CONTACT.phones.find((p) => p.display.replace(/\s/g, '') === digits);
      out.push(
        official ? (
          <a key={key} href={`tel:${official.e164}`} dir="ltr" className="inline-block font-medium tabular-nums text-accent underline underline-offset-2 [unicode-bidi:isolate]">{token}</a>
        ) : (
          token
        )
      );
    }
    last = idx + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const ChatMarkdown: React.FC<{ content: string; onNavigate: () => void }> = ({ content, onNavigate }) => {
  const blocks = content.replace(/\r/g, '').split(/\n{2,}/);

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim() !== '');
        const isBullets = lines.length > 0 && lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isNumbered = lines.length > 0 && lines.every((l) => /^\s*\d+[.)]\s+/.test(l));

        if (isBullets || isNumbered) {
          const ListTag = isNumbered ? 'ol' : 'ul';
          return (
            <ListTag key={bi} className={`space-y-1.5 ps-5 ${isNumbered ? 'list-decimal' : 'list-disc'} marker:text-accent`}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ''), onNavigate, `${bi}-${li}`)}</li>
              ))}
            </ListTag>
          );
        }

        // Mixed block: a lead line followed by list items
        const firstListLine = lines.findIndex((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (firstListLine > 0 && lines.slice(firstListLine).every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const numbered = /^\s*\d/.test(lines[firstListLine]);
          const ListTag = numbered ? 'ol' : 'ul';
          return (
            <div key={bi} className="space-y-1.5">
              <p>{renderInline(lines.slice(0, firstListLine).join(' '), onNavigate, `${bi}-p`)}</p>
              <ListTag className={`space-y-1.5 ps-5 ${numbered ? 'list-decimal' : 'list-disc'} marker:text-accent`}>
                {lines.slice(firstListLine).map((l, li) => (
                  <li key={li}>{renderInline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ''), onNavigate, `${bi}-${li}`)}</li>
                ))}
              </ListTag>
            </div>
          );
        }

        return (
          <p key={bi} className="whitespace-pre-line">
            {renderInline(lines.join('\n').replace(/^#+\s*/gm, ''), onNavigate, `${bi}`)}
          </p>
        );
      })}
    </div>
  );
};
