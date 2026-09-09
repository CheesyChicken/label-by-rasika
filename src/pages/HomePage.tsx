import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Scissors } from 'lucide-react';
import { PRODUCTS } from '../data/products';

import { useStore } from '../store/StoreContext';
import { HeroBanner } from '../components/HeroBanner';
import { ProductCard } from '../components/ProductCard';
import { CustomerLooks } from '../components/CustomerLooks';
import { SmartImage } from '../components/SmartImage';
import { IG_GALLERY, IG_REELS_WITH_CLIP } from '../data/instagram';
import { curateHome } from '../data/homeCuration';
import { SectionTitle } from '../components/SectionTitle';
import { categoryPath } from '../layouts/RootLayout';

export const HomePage: React.FC = () => {
  const s = useStore();
  const navigate = useNavigate();

  // One curated arrangement per visit: every section draws from a shared pool
  // and claims the photographs it uses, so nothing appears twice on the page —
  // and the seed changes each load, so the archive keeps cycling.
  const {
    heroSources, categoryTiles, bestsellers, newIn, more: moreToSee, editorialImage,
  } = useMemo(() => curateHome(), []);

  return (
    <>
      <HeroBanner
        sources={heroSources}
        onSelectCategory={(c) => navigate(categoryPath(c))}
        onOpenAiStylist={() => s.openPanel('stylist')}
        onOpenContact={() => s.openPanel('contact')}
        onOpenReels={() => navigate('/instagram')}
      />

      {/* Category strip */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <SectionTitle title="Shop by collection" />
        <div className="mt-10 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
          {categoryTiles.map((c) => {
            const img = c.image;
            return (
              <Link key={c.id} to={c.href} className="group text-center">
                <div className="relative mx-auto aspect-square w-full overflow-hidden bg-[var(--bg-soft)]">
                  <SmartImage
                    src={img}
                    alt={c.label}
                    fallbackLabel={c.label}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.14em] transition-colors group-hover:text-[var(--accent)]">
                  {c.label}
                </p>
                <p className="mt-0.5 text-[10px] font-light text-[var(--muted)]">
                  {c.sub} · {c.count}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Most liked on Instagram — this is engagement data, not sales data. */}
      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
          <SectionTitle title="Most loved on Instagram" href="/collections" linkLabel={`All ${PRODUCTS.length} pieces`} />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={s.currency}
                onQuickView={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => s.addToCart(p)}
                isWishlisted={s.isWishlisted(p.id)}
                onToggleWishlist={s.toggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* Editorial band */}
      <section className="border-y border-[var(--line)] bg-[var(--bg-soft)]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
              Made to measure
            </p>
            <h2 className="mt-4 font-serif text-[clamp(1.6rem,3vw,2.5rem)] font-light leading-tight">
              Stitched to your measurements, in our own atelier
            </h2>
            <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-[var(--muted)]">
              Send your bust, waist, hip and length over WhatsApp and we cut to your exact
              measurements — or visit us at Chandrarang Park, Pimple Gurav for a fitting.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-[var(--muted)]">
              {['All sizes available', 'Custom length and sleeves', 'Measurements over WhatsApp'].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Scissors className="h-3 w-3" /> {t}
                  </li>
                )
              )}
            </ul>
            <a
              href="https://wa.me/917821923346?text=Hi%20Rasika!%20I%20need%20custom%20stitching."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[var(--ink)] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] text-[var(--bg)] transition-colors hover:bg-[var(--accent)]"
            >
              Enquire on WhatsApp <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <SmartImage
              src={editorialImage}
              alt="Made to measure at the Label by Rasika atelier"
              fallbackLabel="Made to measure"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* New in */}
      {newIn.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
          <SectionTitle title="New in" href="/collections" linkLabel={`All ${PRODUCTS.length} pieces`} />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {newIn.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={s.currency}
                onQuickView={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => s.addToCart(p)}
                isWishlisted={s.isWishlisted(p.id)}
                onToggleWishlist={s.toggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* More from the atelier */}
      {moreToSee.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
          <SectionTitle
            title="More from the atelier"
            href="/collections"
            linkLabel={`All ${PRODUCTS.length} pieces`}
          />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {moreToSee.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={s.currency}
                onQuickView={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => s.addToCart(p)}
                isWishlisted={s.isWishlisted(p.id)}
                onToggleWishlist={s.toggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* Instagram teaser */}
      <section className="border-t border-[var(--line)] bg-[var(--bg-soft)] py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
          @{s.igProfile.username}
        </p>
        <h2 className="mt-3 font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-light">
          The latest looks, straight from the atelier
        </h2>
        <p className="mx-auto mt-4 max-w-lg px-5 text-sm font-light text-[var(--muted)]">
          {IG_GALLERY.length} photographs and {IG_REELS_WITH_CLIP.length} playable reels, straight from
          Rasika&rsquo;s own Instagram.
        </p>
        <Link
          to="/instagram"
          className="mt-8 inline-flex items-center gap-2 border border-[var(--ink)] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
        >
          Shop the feed <ArrowRight className="h-3 w-3" />
        </Link>
      </section>

      <CustomerLooks />
    </>
  );
};
