import React, { useState } from 'react';
import { ExternalLink, Heart, Play } from 'lucide-react';
import { CUSTOMER_LOOKS } from '../data/customerLooks';
import { permalinkFor } from '../data/instagram';
import { SmartImage } from './SmartImage';
import { describeMedia } from '../utils/mediaAlt';
import { SectionTitle } from './SectionTitle';

/**
 * Real customers wearing Label by Rasika.
 *
 * Deliberately NOT a reviews block: no stars, no ratings, no words attributed
 * to anyone. Each tile is a photograph Rasika published on the brand account
 * with her own caption, linking back to the original post so any claim here can
 * be checked. It replaces six fabricated testimonials that named invented
 * people reviewing garments that never existed.
 */
export const CustomerLooks: React.FC<{ limit?: number }> = ({ limit = 8 }) => {
  const [showAll, setShowAll] = useState(false);
  if (CUSTOMER_LOOKS.length === 0) return null;

  const looks = showAll ? CUSTOMER_LOOKS : CUSTOMER_LOOKS.slice(0, limit);

  return (
    <section className="border-t border-[var(--line)] bg-[var(--bg-soft)] py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionTitle
          title="Customers wearing LBR"
          subtitle="Photographs shared by Rasika on @label_by_rasika. Every one links back to the original post."
        />

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {looks.map((look) => (
            <li key={look.code}>
              <a
                href={permalinkFor(look.code)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg)]">
                  <SmartImage
                    src={look.image}
                    alt={describeMedia({ ...look, i: 0, file: look.image, isSidecar: false })}
                    fallbackLabel="Label by Rasika"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />

                  {look.isVideo && (
                    <span className="pointer-events-none absolute right-2.5 top-2.5 text-[var(--bg)] drop-shadow">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                  )}

                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[var(--ink-deep)]/80 to-transparent px-3 pb-2.5 pt-8 text-[11px] text-[var(--bg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="h-3 w-3 fill-current" /> {look.likes}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em]">
                      View <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-[12px] font-light leading-relaxed text-[var(--muted)]">
                  {look.caption}
                </p>
              </a>
            </li>
          ))}
        </ul>

        {CUSTOMER_LOOKS.length > limit && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="border border-[var(--ink)] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
            >
              {showAll ? 'Show fewer' : `See all ${CUSTOMER_LOOKS.length}`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
