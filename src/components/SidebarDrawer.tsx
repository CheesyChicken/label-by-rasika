import React, { useEffect, useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Instagram, X } from 'lucide-react';
import { Category, CurrencyCode } from '../types';
import { ACTIVE_CATEGORIES, ACTIVE_OCCASIONS } from '../data/taxonomy';
import { CURRENCIES } from '../utils/currency';
import { HAS_PRICES } from '../data/taxonomy';
import { IG_PROFILE } from '../data/instagram';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category;
  onSelectCategory: (c: Category) => void;
  currency: CurrencyCode;
  onSelectCurrency: (c: CurrencyCode) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  isSignedIn: boolean;
  onOpenContact: () => void;
  onOpenAiStylist: () => void;
  onOpenStyleGuide: () => void;
  onOpenReels: () => void;
}

/**
 * Left slide-in navigation.
 *
 * Deliberately plain: white panel, uppercase rows, hairline dividers, one
 * chevron for the expandable group — the reference site's drawer, and a long
 * way from the dense coloured panel this replaces.
 */
export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen, onClose, selectedCategory, onSelectCategory, currency, onSelectCurrency,
  wishlistCount, onOpenWishlist, onOpenAccount, isSignedIn,
  onOpenContact, onOpenAiStylist, onOpenStyleGuide,
  onOpenReels,
}) => {
  const [shopOpen, setShopOpen] = useState(true);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape, and stop the page behind from scrolling.
  // Escape, scroll lock, focus trap and focus restore all come from the shared
  // hook. This component used to duplicate them, which meant three independent
  // body-overflow snapshots (here, useDialog and GalleryLightbox) could
  // interleave and leave the page unscrollable.
  useDialog(isOpen, onClose, panelRef);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => closeRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [isOpen]);

  const rowClass =
    'flex w-full items-center justify-between border-b border-[var(--line)] px-6 py-4 text-left text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-[var(--bg-soft)]';

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        aria-hidden={!isOpen}
        // Keeps the closed, off-screen drawer out of the tab order entirely.
        // React 19 takes `inert` as a real boolean — passing '' makes React
        // treat it as false, which silently defeats the whole guard.
        inert={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[340px] flex-col bg-[var(--bg)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <span className="font-serif text-sm tracking-[0.14em]">MENU</span>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <button onClick={() => setShopOpen(!shopOpen)} className={rowClass}>
            <span>Shop by collection</span>
            {shopOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
            )}
          </button>

          {shopOpen && (
            <div className="border-b border-[var(--line)] bg-[var(--bg-soft)] py-1">
              {ACTIVE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSelectCategory(c.id); onClose(); }}
                  className={`flex w-full items-center justify-between px-6 py-2.5 text-left text-[11px] font-light tracking-[0.06em] transition-colors hover:text-[var(--accent)] ${
                    selectedCategory === c.id ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                  }`}
                >
                  <span>{c.id === 'all' ? 'View all' : c.label}</span>
                  {c.tag && (
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
                      {c.tag}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => { onOpenReels(); onClose(); }} className={rowClass}>
            <span>Shop the Instagram feed</span>
            <Instagram className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
          </button>

          <button onClick={() => { onOpenAiStylist(); onClose(); }} className={rowClass}>
            <span>Ask the AI stylist</span>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
          </button>

          <button onClick={() => { onOpenStyleGuide(); onClose(); }} className={rowClass}>
            <span>Fabric &amp; care guide</span>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
          </button>

          <button onClick={() => { onOpenWishlist(); onClose(); }} className={rowClass}>
            <span>Wishlist</span>
            <span className="text-[var(--muted)]">{wishlistCount}</span>
          </button>

          {/* The header hides these two below sm — five 44px controls plus the
              wordmark do not fit at 375px. */}
          <button onClick={() => { onOpenAccount(); onClose(); }} className={`${rowClass} sm:hidden`}>
            <span>{isSignedIn ? 'Your account' : 'Log in or sign up'}</span>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
          </button>

          <button onClick={() => { onOpenContact(); onClose(); }} className={rowClass}>
            <span>Atelier &amp; contact</span>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={1.5} />
          </button>

          <div className="px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Shop for an occasion
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {ACTIVE_OCCASIONS()
                .filter((o) => o.id !== 'all')
                .map((o) => (
                  <Link
                    key={o.id}
                    to={`/collections?occasion=${o.id}`}
                    onClick={onClose}
                    className="link-underline text-[11px] font-light text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    {o.label}
                  </Link>
                ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-[var(--line)] px-6 py-4">
          {HAS_PRICES && (
<label className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Currency
            <select
              value={currency}
              onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
              className="border border-[var(--line)] bg-transparent px-2 py-1 text-[11px] tracking-normal text-[var(--ink)] focus:outline-none"
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                <option key={c} value={c}>
                  {c} {CURRENCIES[c].symbol}
                </option>
              ))}
            </select>
          </label>
)}
          <a
            href={IG_PROFILE.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-[11px] font-light text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} /> @{IG_PROFILE.username}
          </a>
        </div>
      </aside>
    </>
  );
};
