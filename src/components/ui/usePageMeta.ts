import { useEffect } from 'react';

const SITE = 'MuQore Innovation';

/** Sets a per-page document title and meta description. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} | Ideas • Code • Solutions`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
