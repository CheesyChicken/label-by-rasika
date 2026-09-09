import React, { useEffect, useRef } from 'react';
import { useDialog } from '../hooks/useDialog';
import { ChevronLeft, ChevronRight, ExternalLink, Heart, MessageCircle, Mic, X } from 'lucide-react';
import { GalleryItem } from '../types';
import { describeMedia } from '../utils/mediaAlt';
import { SmartImage } from './SmartImage';
import { permalinkFor } from '../data/instagram';

interface GalleryLightboxProps {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

const fmtDate = (unix?: number | null) =>
  unix
    ? new Date(unix * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

/** Full view of one image, with the post's caption and the reel's narration. */
export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items, index, onClose, onIndex,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape, scroll lock, focus trap and focus restore come from the shared
  // hook, so this dialog participates in the same open-dialog stack as the
  // others rather than keeping its own body-overflow snapshot.
  useDialog(index !== null, onClose, panelRef);

  // Arrow keys are this dialog's own concern.
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndex(Math.min(items.length - 1, index + 1));
      if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onIndex]);

  if (index === null || !items[index]) return null;
  const item = items[index];
  const date = fmtDate(item.date);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Instagram post"
      tabIndex={-1}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-8 focus:outline-none"
    >
      <div className="absolute inset-0 bg-[var(--ink-deep)]/92" onClick={onClose} aria-hidden="true" />

      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 p-2 text-[var(--bg)]/70 transition-colors hover:text-[var(--bg)]"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {index > 0 && (
        <button
          onClick={() => onIndex(index - 1)}
          aria-label="Previous"
          className="absolute left-2 z-10 p-3 text-[var(--bg)]/60 transition-colors hover:text-[var(--bg)] sm:left-6"
        >
          <ChevronLeft className="h-7 w-7" strokeWidth={1.2} />
        </button>
      )}
      {index < items.length - 1 && (
        <button
          onClick={() => onIndex(index + 1)}
          aria-label="Next"
          className="absolute right-2 z-10 p-3 text-[var(--bg)]/60 transition-colors hover:text-[var(--bg)] sm:right-6"
        >
          <ChevronRight className="h-7 w-7" strokeWidth={1.2} />
        </button>
      )}

      <div className="relative z-10 grid max-h-[90vh] w-full max-w-5xl grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-[var(--bg)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:grid-rows-1">
        <div className="flex min-h-0 items-center justify-center bg-[var(--ink-deep)]">
          <SmartImage
            src={item.file}
            alt={describeMedia(item)}
            fallbackLabel="Label by Rasika"
            className="max-h-[52vh] w-full object-contain md:max-h-[90vh]"
          />
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <span className="text-[11px] font-medium">@label_by_rasika</span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {item.isVideo ? 'Reel' : item.isSidecar ? 'Carousel' : 'Photo'}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--muted)]">
            {item.likes != null && (
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" /> {item.likes}
              </span>
            )}
            {item.comments != null && (
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" /> {item.comments}
              </span>
            )}
            {date && <span>{date}</span>}
          </div>

          {item.caption && (
            <p className="mt-4 whitespace-pre-line text-[13px] font-light leading-relaxed">
              {item.caption}
            </p>
          )}

          {item.transcript && (
            <div className="mt-5 border-t border-[var(--line)] pt-4">
              <h3 className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                <Mic className="h-3 w-3" strokeWidth={1.5} />
                What Rasika says in this reel
              </h3>
              <p className="mt-2.5 text-[13px] font-light leading-relaxed text-[var(--muted)]">
                {item.transcript}
              </p>
              <p className="mt-2 text-[10px] text-[var(--muted)]">
                Transcribed automatically — wording may differ slightly from the audio.
              </p>
            </div>
          )}

          <a
            href={permalinkFor(item.code)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            View on Instagram <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
