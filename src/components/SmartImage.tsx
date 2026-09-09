import React, { useEffect, useRef, useState } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Shown instead of a broken-image icon if the source fails. */
  fallbackLabel?: string;
  /** Tints the fallback to the garment colour. */
  fallbackHex?: string;
  className?: string;
}

type Status = 'loading' | 'ok' | 'error';

/**
 * An <img> that can never render as a broken icon.
 *
 * The catalogue previously pointed at 12 dead Unsplash URLs, so most product
 * cards showed the browser's broken-image glyph. On error this swaps to a
 * branded gradient tile carrying the piece's name, which reads as intentional
 * rather than broken while real photography is pending.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fallbackLabel,
  fallbackHex = 'var(--ink)',
  className = '',
  ...rest
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    setStatus('loading');
    // A cached image can finish loading before React attaches onLoad, so the
    // event never fires. Reconcile against the DOM instead of trusting it.
    const el = imgRef.current;
    if (el?.complete && el.currentSrc) {
      setStatus(el.naturalWidth > 0 ? 'ok' : 'error');
    }
  }, [src]);

  if (status === 'error') {
    const label = fallbackLabel || alt;
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[var(--ink)] ${className}`}
        style={{
          backgroundImage: `linear-gradient(140deg, ${fallbackHex}55 0%, ${fallbackHex}22 45%, var(--ink-deep) 100%)`,
        }}
        role="img"
        aria-label={label}
      >
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--muted) 0 1px, transparent 1px 9px)',
          }}
        />
        <div className="relative px-2 text-center">
          <div className="font-serif text-base leading-none tracking-[0.2em] text-[var(--muted)]">
            LBR
          </div>
          <div className="mt-1 line-clamp-2 text-[8px] uppercase tracking-[0.15em] text-white/70">
            {label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      {...rest}
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => setStatus('ok')}
      onError={() => setStatus('error')}
      className={`${className} transition-opacity duration-500 ${
        status === 'ok' ? 'opacity-100' : 'opacity-0'
      }`}
      style={
        status === 'loading'
          ? { backgroundColor: 'var(--bg-soft)', ...(rest.style ?? {}) }
          : rest.style
      }
    />
  );
};
