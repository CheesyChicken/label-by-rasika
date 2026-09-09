import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Heart, MessageCircle, Play, Volume2, VolumeX } from 'lucide-react';
import { GalleryItem } from '../types';
import { SmartImage } from './SmartImage';
import { describeMedia } from '../utils/mediaAlt';
import { permalinkFor } from '../data/instagram';

interface ReelCardProps {
  item: GalleryItem;
  /** Locally hosted preview clip, e.g. /media/reels/<code>.mp4 */
  videoSrc?: string;
  onOpenDetail?: (item: GalleryItem) => void;
}

/**
 * A reel card that plays our own MP4 on hover.
 *
 * This replaces Instagram's embed iframe, which stretched to whatever width it
 * was given, wrapped its own header over the media below ~326px, and could not
 * be styled at all. The clip is served from /media/reels — already in the repo,
 * so nothing depends on Instagram being reachable — and the poster is the real
 * cover frame. Clicking still opens the genuine post.
 */
/** The one preview allowed to be running, shared across every card. */
const CURRENT: { el: HTMLVideoElement | null; stop: () => void } = { el: null, stop: () => {} };

export const ReelCard: React.FC<ReelCardProps> = ({ item, videoSrc, onOpenDetail }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  /** Set by touchstart when that tap is meant to preview, not to navigate. */
  const previewTapRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const permalink = permalinkFor(item.code);

  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    // Only one preview runs at a time. On touch there is no mouseleave and no
    // blur, so without this every card tapped kept looping — tap three cards
    // and three clips played over each other indefinitely.
    if (CURRENT.el && CURRENT.el !== v) CURRENT.stop();
    CURRENT.el = v;
    CURRENT.stop = () => { v.pause(); v.currentTime = 0; };
    // React's `muted` prop does not reliably reach the DOM element, and an
    // unmuted video is refused autoplay outright — set it imperatively.
    v.muted = true;
    v.defaultMuted = true;
    // Autoplay is only permitted muted, so every preview restarts muted — the
    // toggle's label has to follow, or it claims audio that isn't playing.
    setMuted(true);
    // Autoplay is only permitted while muted; a play() rejection is normal
    // (reduced-motion, low power mode) and must not surface as an error.
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    if (CURRENT.el === v) { CURRENT.el = null; CURRENT.stop = () => {}; }
    setPlaying(false);
  }, []);

  // A card that scrolls out of view stops — the only stop signal a phone gets.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !videoSrc) return;
    const io = new IntersectionObserver(
      ([e]) => { if (!e.isIntersecting) stop(); },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stop, videoSrc]);

  // Never leave a clip running when the card unmounts (view switch, filter).
  useEffect(() => stop, [stop]);

  return (
    <article className="group flex w-full flex-col">
      <div
        ref={wrapRef}
        className="relative aspect-[9/16] w-full overflow-hidden bg-[var(--bg-soft)]"
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        // React maps onBlur to focusout, which BUBBLES. Without this guard,
        // moving focus from the link to the sound button inside the same card
        // fired stop(), which unmounted the button mid-focus and dropped the
        // caret to <body> — making the control unreachable by keyboard and
        // resetting the tab position on every one of the 30 cards.
        onBlur={(e) => {
          if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
          stop();
        }}
        // Touch has no hover: the first tap previews, and the link handles the
        // second one. Tapping an already-playing card stops it, so a phone user
        // has a way back — and `start` stops whichever card was playing before.
        onTouchStart={() => {
          // First tap previews, second tap follows the link. The click that
          // follows this touchstart is swallowed by the <a> below when
          // previewTapRef is set — otherwise the full-tile link navigated to
          // Instagram before the on-site clip was ever visible.
          previewTapRef.current = !playing;
          if (playing) stop(); else start();
        }}
      >
        {/* Cover frame — visible until the clip is actually running, so there
            is never a blank card while the video buffers. */}
        <SmartImage
          src={item.file}
          alt=""
          aria-hidden="true"
          fallbackLabel="Label by Rasika"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={item.file}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            aria-label={describeMedia(item)}
            onEnded={() => setPlaying(false)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              playing ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Whole tile is the link to the real post. */}
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (previewTapRef.current) { e.preventDefault(); previewTapRef.current = false; }
          }}
          className="absolute inset-0 z-10 [outline-offset:-3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--bg)]"
          aria-label="Open this post by @label_by_rasika on Instagram"
        >
          <span className="sr-only">View on Instagram</span>
        </a>

        {/* Play affordance, fades out once the preview is running. */}
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg)]/25 backdrop-blur-sm">
            <Play className="ml-0.5 h-5 w-5 fill-[var(--bg)] text-[var(--bg)]" />
          </span>
        </span>

        {/* Sound toggle — above the link layer so it stays clickable. */}
        {videoSrc && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const v = videoRef.current;
              if (!v) return;
              v.muted = !muted;
              setMuted(!muted);
            }}
            aria-label={muted ? 'Unmute preview' : 'Mute preview'}
            className={`absolute bottom-2.5 right-2.5 z-20 flex h-9 w-9 items-center justify-center bg-[var(--ink)]/60 text-[var(--bg)] backdrop-blur-sm transition-all hover:bg-[var(--ink)] focus-visible:opacity-100 ${
              playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
            }`}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Legibility scrim for the counts — white text straight on a pale
            photograph measured as low as 1.05:1. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-20 bg-gradient-to-t from-[var(--ink-deep)]/80 to-transparent"
        />
        {/* Engagement, bottom-left. */}
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-20 flex items-center gap-3 text-[11px] text-[var(--bg)]">
          {item.likes != null && (
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 fill-current" /> {item.likes}
            </span>
          )}
          {item.comments != null && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {item.comments}
            </span>
          )}
        </span>
      </div>

      <div className="pt-3">
        {item.caption && (
          <p className="line-clamp-2 text-[12px] font-light leading-relaxed text-[var(--ink)]">
            {item.caption}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            View on Instagram <ExternalLink className="h-3 w-3" />
          </a>
          {onOpenDetail && item.transcript && (
            <button
              onClick={() => onOpenDetail(item)}
              className="link-underline text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
