import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, Heart, Instagram, Minus, Plus, Scissors, MessageCircle } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { SizeCustomization, SizeOption, StitchingType } from '../types';
import { displayPrice } from '../utils/currency';
import { useStore } from '../store/StoreContext';
import { SmartImage } from '../components/SmartImage';
import { ProductCard } from '../components/ProductCard';
import { categoryPath } from '../layouts/RootLayout';
import { CATEGORIES } from '../data/taxonomy';

/** Placeholder values the generator emits when Rasika never stated the fact. */
const UNSTATED = new Set(['not stated', 'see post', 'ask on whatsapp', 'assorted', '—', '-', '']);

const SIZES: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom'];

/**
 * Finishing options. No figures: Rasika has never published a stitching or
 * service charge, and quoting "+₹999" beside a garment marked "Price on
 * request" invented a number the boutique would then be held to.
 */
const STITCHING: { id: StitchingType; label: string; note: string }[] = [
  { id: 'ready-to-wear', label: 'Ready to wear', note: 'As shown, standard fit' },
  { id: 'standard-stitched', label: 'Stitched to size', note: 'Finished to your size' },
  { id: 'bespoke-tailored', label: 'Bespoke', note: 'Cut to your measurements' },
];

export const ProductPage: React.FC = () => {
  const { id } = useParams();
  const s = useStore();
  const navigate = useNavigate();
  const product = PRODUCTS.find((p) => p.id === id);

  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState<SizeOption>('M');
  const [stitching, setStitching] = useState<StitchingType>('ready-to-wear');
  const [addTailoring, setAddTailoring] = useState(false);
  const [addDupatta, setAddDupatta] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Same category first, then topped up from the rest — a category holding a
  // single piece should still show suggestions rather than an empty rail.
  const related = useMemo(() => {
    if (!product) return [];
    const others = PRODUCTS.filter((p) => p.id !== product.id);
    const sameCategory = others.filter((p) => p.category === product.category);
    const sameOccasion = others.filter(
      (p) =>
        !sameCategory.includes(p) && p.occasion.some((o) => product.occasion.includes(o))
    );
    return [...sameCategory, ...sameOccasion, ...others]
      .filter((p, i, a) => a.indexOf(p) === i)
      .slice(0, 4);
  }, [product]);

  if (!product) return <Navigate to="/collections" replace />;

  const gallery = [product.primaryImage, product.hoverImage, ...product.galleryImages].filter(
    (v, i, a) => v && a.indexOf(v) === i
  );

  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label ?? 'Collection';

  // Only facts Rasika actually stated in the caption. 15 of 43 pieces have
  // none, and an empty table is better than eight rows reading "Not stated".
  const statedDetails = (
    [
      ['Set includes', product.setIncludes],
      ['Kurta length', product.details.kurtiLength],
      ['Bottom', product.details.bottomType],
      ['Dupatta', product.details.dupattalength],
      ['Fabric', product.fabric],
      ['Embellishment', product.embellishment],
      ['Colour', product.colorName],
    ] as [string, string | undefined][]
  ).filter(([, v]) => v && !UNSTATED.has(v.trim().toLowerCase()));

  const handleAdd = () => {
    const info: SizeCustomization = { type: stitching, size };
    for (let i = 0; i < qty; i++) s.addToCart(product, info, addTailoring, addDupatta);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-8 sm:px-8">
      <nav className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
        <Link to="/" className="transition-colors hover:text-[var(--ink)]">Home</Link>
        <span>/</span>
        <Link to={categoryPath(product.category)} className="transition-colors hover:text-[var(--ink)]">
          {categoryLabel}
        </Link>
        <span>/</span>
        <span className="truncate text-[var(--ink)]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-soft)]">
            <SmartImage
              src={gallery[imgIndex]}
              alt={product.name}
              fallbackLabel={product.name}
              fallbackHex={product.colorHex}
              className="h-full w-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setImgIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative h-24 w-20 overflow-hidden bg-[var(--bg-soft)] transition-opacity ${
                    i === imgIndex ? 'opacity-100 ring-1 ring-[var(--ink)]' : 'opacity-55 hover:opacity-100'
                  }`}
                >
                  <SmartImage
                    src={src}
                    alt=""
                    fallbackLabel={product.name}
                    fallbackHex={product.colorHex}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
            {product.fabric}
          </p>
          <h1 className="mt-3 font-serif text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-tight">
            {product.name}
          </h1>
          <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">
            {product.subtitle}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-2xl">
              {displayPrice(product, s.currency)}
            </span>
            {product.priceIsIndicative && (
              <span className="border border-[var(--line)] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
                Indicative
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {product.priceOnRequest
              ? 'Message us on WhatsApp for the current price and availability.'
              : product.priceIsIndicative
              ? 'Indicative starting price — the final figure depends on fabric, size and finishing. Confirm on WhatsApp before ordering.'
              : 'Confirm the final figure with Rasika on WhatsApp before ordering.'}
          </p>

          <div className="mt-8 h-px bg-[var(--line)]" />

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em]">Size to quote for</span>
              <span className="text-[11px] text-[var(--muted)]">Availability confirmed on WhatsApp</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--muted)]">
              Picking a size here doesn&rsquo;t reserve it — some pieces are one-offs in a single
              size. Rasika confirms what&rsquo;s available when she replies.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSize(sz)}
                  className={`h-10 min-w-10 border px-3 text-xs transition-colors ${
                    size === sz
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]'
                      : 'border-[var(--line)] hover:border-[var(--ink)]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Stitching */}
          <div className="mt-8">
            <span className="text-[10px] uppercase tracking-[0.2em]">Fit</span>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {STITCHING.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setStitching(o.id)}
                  className={`border p-3 text-left transition-colors ${
                    stitching === o.id
                      ? 'border-[var(--ink)]'
                      : 'border-[var(--line)] hover:border-[var(--muted)]'
                  }`}
                >
                  <span className="block text-xs">{o.label}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--muted)]">{o.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="mt-6 space-y-2">
            <p className="text-[11px] text-[var(--muted)]">
              Tick anything you'd like quoted — it's added to your WhatsApp enquiry.
            </p>
            {[
              { on: addTailoring, set: setAddTailoring, label: 'Ask about fit to my measurements' },
              { on: addDupatta, set: setAddDupatta, label: 'Ask about a matching dupatta' },
            ].map((a) => (
              <label
                key={a.label}
                className="flex cursor-pointer items-center gap-3 border border-[var(--line)] p-3 text-xs transition-colors hover:border-[var(--muted)]"
              >
                <input
                  type="checkbox"
                  checked={a.on}
                  onChange={() => a.set(!a.on)}
                  className="h-3.5 w-3.5 accent-[var(--ink)]"
                />
                <span className="flex-1">{a.label}</span>
              </label>
            ))}
          </div>

          {/* Quantity + add */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 items-stretch border border-[var(--line)]">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex items-center px-4 text-[var(--muted)] transition-colors hover:text-[var(--ink)]" aria-label="Decrease quantity">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex w-8 items-center justify-center text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="flex items-center px-4 text-[var(--muted)] transition-colors hover:text-[var(--ink)]" aria-label="Increase quantity">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className={`h-12 sm:flex-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                added
                  ? 'bg-[var(--success)] text-white'
                  : 'bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--accent)]'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2"><Check className="h-3.5 w-3.5" /> Added</span>
              ) : (
                'Add to bag'
              )}
            </button>

            <button
              onClick={() => s.toggleWishlist(product)}
              aria-label="Save to wishlist"
              className="flex h-12 w-12 items-center justify-center border border-[var(--line)] transition-colors hover:border-[var(--ink)]"
            >
              <Heart
                className={`h-4 w-4 ${s.isWishlisted(product.id) ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}`}
              />
            </button>
          </div>

          <a
            href={`https://wa.me/917821923346?text=${encodeURIComponent(
              `Hi Rasika! I'd like to know more about "${product.name}".`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-12 items-center justify-center gap-2 border border-[var(--line)] text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-[var(--ink)]"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Ask on WhatsApp
          </a>

          <ul className="mt-8 space-y-2.5 border-t border-[var(--line)] pt-6 text-[11px] text-[var(--muted)]">
            <li className="flex items-center gap-2.5"><Scissors className="h-3.5 w-3.5" /> Cut and finished in the Pimple Gurav atelier</li>
            <li className="flex items-center gap-2.5"><MessageCircle className="h-3.5 w-3.5" /> Delivery, timeline and exchange confirmed on WhatsApp</li>
            {product.instagramPostUrl && (
              <li className="flex items-center gap-2.5">
                <Instagram className="h-3.5 w-3.5" />
                <a href={product.instagramPostUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--ink)]">
                  See this piece on Instagram
                </a>
              </li>
            )}
          </ul>

          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em]">Details</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">
              {product.description}
            </p>
            {/* Rows Rasika never stated are omitted, not filled in. Printing
                "Not stated" eight times says nothing; the WhatsApp line below
                is the honest answer to all of them. */}
            {statedDetails.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[11px]">
                {statedDetails.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[var(--muted)]">{k}</dt>
                    <dd className="mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="mt-4 text-[11px] text-[var(--muted)]">
              Fabric, fit, finishing and price are confirmed by Rasika on WhatsApp — this page
              only repeats what she published with the photographs.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-center font-serif text-2xl font-light">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
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
    </div>
  );
};
