import React, { useState } from 'react';

interface SmartImageProps {
  /** Base path without size suffix, e.g. "/assets/services/ai-solutions" */
  base: string;
  alt: string;
  /** CSS `sizes` hint for choosing between the 640w and 1200w files */
  sizes?: string;
  className?: string;
  imgClassName?: string;
  /** Above-the-fold images load eagerly with high priority */
  priority?: boolean;
}

/**
 * Responsive WebP image in a fixed 3:2 frame (no layout shift). It fades in
 * once decoded, so slow connections see a soft placeholder rather than a pop.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  base,
  alt,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  className = '',
  imgClassName = '',
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative aspect-[3/2] overflow-hidden bg-surface-2 ${className}`}>
      <img
        src={`${base}-640.webp`}
        srcSet={`${base}-640.webp 640w, ${base}-1200.webp 1200w`}
        sizes={sizes}
        alt={alt}
        width={1200}
        height={800}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          // Cached images can finish before React attaches onLoad
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        className={`h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out-expo)] ${
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.03] opacity-0 blur-sm'
        } ${imgClassName}`}
      />
    </div>
  );
};

/** Service slug → photo (see public/assets/services/CREDITS.md). */
export const SERVICE_IMAGES: Record<string, { base: string; alt: string }> = {
  'website-development': {
    base: '/assets/services/website-development',
    alt: 'Laptop and desktop monitor showing a website and analytics dashboard on a bright desk',
  },
  'desktop-applications': {
    base: '/assets/services/desktop-applications',
    alt: 'Laptop on a desk with application source code open in an editor',
  },
  'mobile-applications': {
    base: '/assets/services/mobile-applications',
    alt: 'Hand holding a smartphone running a data dashboard app',
  },
  'ai-automation': {
    base: '/assets/services/ai-automation',
    alt: 'Close-up of an AI processor chip on a circuit board',
  },
  'ai-solutions': {
    base: '/assets/services/ai-solutions',
    alt: 'Illustration of a neural network shaped like a brain above a platform',
  },
  'api-development': {
    base: '/assets/services/api-development',
    alt: 'Laptop screen showing code in a developer IDE',
  },
  'backend-development': {
    base: '/assets/services/backend-development',
    alt: 'Server racks with network cables and status lights in a data center',
  },
  'software-redesign': {
    base: '/assets/services/software-redesign',
    alt: 'Designer sketching app wireframes and user goals on paper',
  },
};
