import React, { useState } from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product, CurrencyCode } from '../types';
import { displayPrice } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface ProductCardProps {
  product: Product;
  currency: CurrencyCode;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

/**
 * Editorial product card.
 *
 * No border, no shadow, no radius — the photograph is the card. Hover
 * cross-fades to the second image, drifts it a touch, and raises a quick-add
 * bar; everything else stays still.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product, currency, isWishlisted, onToggleWishlist, onQuickView, onAddToCart,
}) => {
  const [added, setAdded] = useState(false);
  const hasSecond = Boolean(product.hoverImage && product.hoverImage !== product.primaryImage);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group">
      <div
        role="link"
        tabIndex={0}
        onClick={() => onQuickView(product)}
        onKeyDown={(e) => {
          // Only act on the card itself — otherwise Enter/Space on the nested
          // wishlist and quick-add buttons is swallowed and opens the product
          // instead of firing the button.
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onQuickView(product);
          }
        }}
        aria-label={product.name}
        className="relative block aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[var(--bg-soft)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
      >
        <SmartImage
          src={product.primaryImage}
          alt={product.name}
          fallbackLabel={product.name}
          fallbackHex={product.colorHex}
          className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[900ms] ease-out ${
            hasSecond
              ? 'group-hover:opacity-0 group-hover:scale-[1.03]'
              : 'group-hover:scale-[1.04]'
          }`}
        />
        {hasSecond && (
          <SmartImage
            src={product.hoverImage}
            alt=""
            aria-hidden="true"
            fallbackLabel={product.name}
            fallbackHex={product.colorHex}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}

        {/* Badges — one at a time, lower-left, solid, no rounding. */}

        {/* Wishlist — appears on hover, always present for keyboard users. */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          className={`absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg)]/85 backdrop-blur-sm transition-all duration-300 focus:opacity-100 focus-visible:ring-1 focus-visible:ring-[var(--ink)] ${
            isWishlisted
              ? 'opacity-100'
              : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              isWishlisted ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--ink)]'
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Quick add — slides up from the base of the image. */}
        <button
          onClick={handleAdd}
          className="absolute inset-x-0 bottom-0 flex translate-y-0 items-center justify-center gap-2 bg-[var(--ink)]/92 py-3 text-[10px] uppercase tracking-[0.2em] text-[var(--bg)] backdrop-blur-sm transition-transform duration-300 ease-out focus:translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0"
        >
          {added ? (
            <><Check className="h-3.5 w-3.5" /> Added</>
          ) : (
            <><ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} /> Quick add</>
          )}
        </button>
      </div>

      <div className="pt-3.5">
        <button
          onClick={() => onQuickView(product)}
          className="link-underline block text-left text-[13px] font-light leading-snug text-[var(--ink)]"
        >
          {product.name}
        </button>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            className={`text-[13px] ${
              product.priceOnRequest ? 'text-[var(--muted)]' : ''
            }`}
          >
            {displayPrice(product, currency)}
          </span>
          {product.priceIsIndicative && (
            <span
              className="text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]"
              title="Indicative only — confirm on WhatsApp"
            >
              indicative
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
