import React, { useEffect, useState } from 'react';
import {
  ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Pause, Play, Scissors, ShieldCheck, Sparkles, Video,
} from 'lucide-react';
import { Category } from '../types';
import { SmartImage } from './SmartImage';
import { HeroSlideSource } from '../data/homeCuration';

interface HeroBannerProps {
  /**
   * Products and photographs chosen by the home curation, which guarantees
   * none of these images appear anywhere else on the page.
   */
  sources: HeroSlideSource[];
  onSelectCategory: (category: Category) => void;
  onOpenAiStylist: () => void;
  onOpenContact: () => void;
  onOpenReels: () => void;
}

/**
 * How a slide presents its photograph.
 *
 * NOTE ON CROPPING: the sources are portrait 3:4 / 9:16 phone shots. A
 * full-bleed hero is roughly 2:1, so object-cover shows only a horizontal band
 * of them. Anchoring that band at 18% from the top keeps the model's face in
 * frame; centring it decapitated her, which is what the first version did.
 *
 * The source images are portrait 9:16 phone shots, which behave very
 * differently depending on the frame they are put in — so rather than force one
 * treatment on all of them, each slide declares its own and the carousel gives
 * the page some variety as it turns.
 *
 *  split     — copy on a light ground, photograph in its own column at close to
 *              its native ratio. Safest for a tall shot: nothing is cropped away.
 *  immersive — full-bleed with a slow Ken Burns push and a directional scrim.
 *              Cinematic; best when the subject sits centre-frame.
 *  tinted    — full-bleed washed in the slide's accent, the photograph reading
 *              as texture behind the type rather than as the subject.
 */
type HeroTreatment = 'split' | 'immersive' | 'tinted';

interface Slide {
  title: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
  category: Category;
  image: string;
  accent: string;
  treatment: HeroTreatment;
}

/** The three shade treatments, cycled so consecutive slides never match. */
const TREATMENTS: HeroTreatment[] = ['split', 'immersive', 'tinted'];

const TAGLINES = [
  'Handcrafted in Pimple Gurav, Pune',
  'Made to your measurements',
  'Ready to wear · Customised womenswear',
  'From Rasika’s own atelier',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  sources,
  onSelectCategory,
  onOpenAiStylist,
}) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  /** Built from the curated sources — real pieces, real photographs. */
  const slides: Slide[] = sources.map((src, i) => ({
    title: src.product.name,
    subtitle: src.product.subtitle,
    tagline: TAGLINES[i % TAGLINES.length],
    ctaText: 'Shop this',
    category: src.product.category,
    image: src.image,
    accent: src.product.colorHex,
    treatment: TREATMENTS[i % TREATMENTS.length],
  }));

  if (slides.length === 0) return null;

  const slide = slides[current];
  const dark = slide.treatment !== 'split';

  // Rotation stops while the pointer or keyboard focus is inside the hero,
  // when the visitor asks for reduced motion, or when they press pause. It
  // used to re-render the slide's copy (key={current}) every 6.5s regardless,
  // which unmounted whatever the reader had focused.
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (paused || userPaused || reducedMotion) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, userPaused, reducedMotion, slides.length]);

  const go = (d: number) => setCurrent((p) => (p + d + slides.length) % slides.length);

  const copy = (
    <div
      key={current}
      className="max-w-xl space-y-5 duration-700 animate-in fade-in slide-in-from-bottom-3"
    >
      <p
        className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] ${
          dark ? 'text-[var(--bg)]/75' : 'text-[var(--muted)]'
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
        {slide.tagline}
      </p>

      <h1
        className={`font-serif text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.08] ${
          dark ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
        }`}
      >
        {slide.title}
      </h1>

      <p
        className={`max-w-md text-sm font-light leading-relaxed ${
          dark ? 'text-[var(--bg)]/80' : 'text-[var(--muted)]'
        }`}
      >
        {slide.subtitle}
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => onSelectCategory(slide.category)}
          className={`group inline-flex items-center gap-2 px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
            dark
              ? 'bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--accent-on-dark)]'
              : 'bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--accent)]'
          }`}
        >
          {slide.ctaText}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={onOpenAiStylist}
          className={`inline-flex items-center gap-2 border px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
            dark
              ? 'border-[var(--bg)]/45 text-[var(--bg)] hover:border-[var(--bg)]'
              : 'border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--ink)]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          AI Styling Concierge
        </button>
      </div>
    </div>
  );

  /** One <SmartImage> per slide, cross-fading; only the active one is zoomed. */
  const layer = (s: Slide, i: number, objectPos: string) => (
    <div
      key={i}
      aria-hidden={i !== current}
      className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
        i === current ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <SmartImage
        src={s.image}
        alt={s.title}
        fallbackLabel={s.title}
        fallbackHex={s.accent}
        className={`h-full w-full object-cover ${objectPos} transition-transform duration-[9000ms] ease-out ${
          i === current ? 'scale-[1.04]' : 'scale-100'
        }`}
      />
    </div>
  );

  return (
    <div
      className="relative overflow-hidden bg-[var(--bg-soft)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[520px] lg:min-h-[600px]">
        {/* ── split ─────────────────────────────────────────────────────── */}
        {slide.treatment === 'split' && (
          <div className="grid min-h-[520px] lg:min-h-[600px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative order-first h-[320px] overflow-hidden bg-[var(--ink-deep)] sm:h-[420px] lg:order-last lg:h-auto">
              {slides.map((s, i) => layer(s, i, 'object-top'))}
              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-[var(--bg-soft)] to-transparent lg:block" />
            </div>
            <div className="flex flex-col justify-center bg-[var(--bg-soft)] px-5 py-12 sm:px-10 lg:py-20 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))] lg:pr-16">
              {copy}
            </div>
          </div>
        )}

        {/* ── immersive ─────────────────────────────────────────────────── */}
        {slide.treatment === 'immersive' && (
          <>
            <div className="absolute inset-0 overflow-hidden bg-[var(--ink-deep)]">
              {slides.map((s, i) => layer(s, i, 'object-[50%_18%]'))}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink-deep)]/88 via-[var(--ink-deep)]/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink-deep)]/70 to-transparent" />
            </div>
            <div className="relative flex min-h-[520px] items-center px-5 py-16 sm:px-10 lg:min-h-[600px] lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
              {copy}
            </div>
          </>
        )}

        {/* ── tinted ────────────────────────────────────────────────────── */}
        {slide.treatment === 'tinted' && (
          <>
            <div className="absolute inset-0 overflow-hidden bg-[var(--ink-deep)]">
              {slides.map((s, i) => layer(s, i, 'object-[50%_18%]'))}
              {/* Accent wash: the photograph reads as texture, not as subject. */}
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background: `linear-gradient(120deg, ${slide.accent} 0%, ${slide.accent}cc 45%, transparent 100%)`,
                }}
              />
              {/* Darker than the accent wash alone — with a pale product colour
                  as accent the subtitle measured 3.1:1 against it. */}
              <div className="absolute inset-0 bg-[var(--ink-deep)]/55" />
            </div>
            <div className="relative flex min-h-[520px] items-center px-5 py-16 sm:px-10 lg:min-h-[600px] lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
              {copy}
            </div>
          </>
        )}

        {/* Controls */}
        <div className="absolute bottom-1 left-1/2 z-30 flex -translate-x-1/2 items-center">
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className={`flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60 ${
              dark ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
            }`}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* The visible rule is 2px tall; the button around it is 44px so it
              can actually be tapped on a phone. */}
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === current}
              className="group flex h-11 items-center justify-center px-1.5"
            >
              <span
                className={`block h-[2px] transition-all duration-500 ${
                  i === current ? 'w-8' : 'w-3 opacity-40 group-hover:opacity-80'
                } ${dark ? 'bg-[var(--bg)]' : 'bg-[var(--ink)]'}`}
              />
            </button>
          ))}

          <button
            onClick={() => setUserPaused((v) => !v)}
            aria-pressed={userPaused}
            aria-label={userPaused ? 'Resume slideshow' : 'Pause slideshow'}
            className={`flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60 ${
              dark ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
            }`}
          >
            {userPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
          </button>

          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className={`flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60 ${
              dark ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
            }`}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-y border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-5 px-5 py-6 sm:px-8 md:grid-cols-4">
          {[
            [ShieldCheck, 'Pimple Gurav, Pune', 'Ready to wear and customised pieces'],
            [Scissors, 'Bespoke tailoring', 'Stitched to your measurements'],
            [Video, 'Ask for a video call', 'See the fabric and finish in daylight'],
            [MessageCircle, 'Order on WhatsApp', 'Price and timeline confirmed by Rasika'],
          ].map(([Icon, title, sub]) => {
            const I = Icon as React.ElementType;
            return (
              <div key={title as string} className="flex items-start gap-3">
                <I className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={1.3} />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--ink)]">
                    {title as string}
                  </p>
                  <p className="mt-0.5 text-[11px] font-light text-[var(--muted)]">
                    {sub as string}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
