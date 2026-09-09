import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { Category, CurrencyCode, Product } from '../types';
import { PRODUCTS } from '../data/products';
import { CURRENCIES } from '../utils/currency';
import { HAS_PRICES } from '../data/taxonomy';
import { ACTIVE_CATEGORIES } from '../data/taxonomy';
import { displayPrice } from '../utils/currency';
import { SmartImage } from './SmartImage';
import { Logo } from './Logo';
import { ShopByMenu } from './ShopByMenu';

interface NavbarProps {
  selectedCategory: Category;
  onSelectCategory: (c: Category) => void;
  currency: CurrencyCode;
  onSelectCurrency: (c: CurrencyCode) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenSidebar: () => void;
  onOpenAiStylist: () => void;
  onOpenStyleGuide: () => void;
  onOpenContact: () => void;
  onOpenReels: () => void;
  onSelectProduct: (p: Product) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSignedIn: boolean;
  onOpenAccount: () => void;
}

/**
 * Sticky header.
 *
 * Three zones on one line — menu + search, centred wordmark, account icons —
 * with the category rail on a second line, mirroring the reference site. All
 * navigation goes through real routes, so links are shareable and open in a
 * new tab the way a customer expects.
 */
export const Navbar: React.FC<NavbarProps> = ({
  onSelectCategory, currency, onSelectCurrency, cartCount, onOpenCart,
  wishlistCount, onOpenWishlist, onOpenSidebar, onOpenAiStylist, onOpenReels,
  onSelectProduct, searchQuery, onSearchChange, isSignedIn, onOpenAccount,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const results = q
    ? PRODUCTS.filter((p) =>
        `${p.name} ${p.fabric} ${p.colorName} ${p.tags.join(' ')}`.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const iconBtn =
    'relative flex h-11 w-11 items-center justify-center text-[var(--ink)] transition-opacity ' +
    'hover:opacity-60 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]';

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-3.5 sm:gap-4 sm:px-8">
        {/* Left */}
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={onOpenSidebar} aria-label="Open menu" className={iconBtn}>
            <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className={`${iconBtn} hidden sm:flex sm:items-center sm:gap-2`}
          >
            <Search className="h-[17px] w-[17px]" strokeWidth={1.5} />
            <span className="text-[11px] tracking-[0.1em] text-[var(--muted)]">Search</span>
          </button>
        </div>

        {/* Centre */}
        <Link
          to="/"
          aria-label="Label by Rasika — home"
          className="flex min-w-0 flex-1 justify-center overflow-hidden"
        >
          <Logo />
        </Link>

        {/* Right */}
        <div className="flex shrink-0 items-center justify-end gap-0.5">
          <button
            onClick={onOpenAiStylist}
            className="mr-1 hidden items-center gap-1.5 border border-[var(--line)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-[var(--ink)] lg:flex"
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.5} /> AI Stylist
          </button>

          {HAS_PRICES && (
          <select
            value={currency}
            onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
            aria-label="Currency"
            className="hidden cursor-pointer border-0 bg-transparent px-1.5 py-1 text-[11px] tracking-[0.08em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none sm:block"
          >
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          )}

          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search" aria-expanded={searchOpen} className={`${iconBtn} sm:hidden`}>
            <Search className="h-[17px] w-[17px]" strokeWidth={1.5} />
          </button>

          <button
            onClick={onOpenAccount}
            aria-label={isSignedIn ? 'Your account' : 'Log in or sign up'}
            className={`${iconBtn} hidden sm:flex`}
          >
            <User className="h-[17px] w-[17px]" strokeWidth={1.5} />
            {isSignedIn && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            )}
          </button>

          <button
            onClick={onOpenWishlist}
            aria-label={`Wishlist, ${wishlistCount} items`}
            className={`${iconBtn} hidden sm:flex`}
          >
            <Heart className="h-[17px] w-[17px]" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-[var(--accent)] px-1 text-[9px] leading-none text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          <button onClick={onOpenCart} aria-label={`Bag, ${cartCount} items`} className={iconBtn}>
            <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-[var(--ink)] px-1 text-[9px] leading-none text-[var(--bg)]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category rail */}
      <nav className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-[1400px] items-stretch justify-start gap-5 overflow-x-auto px-4 sm:justify-center sm:px-8 scrollbar-none">
          <ShopByMenu />
          {ACTIVE_CATEGORIES.map((c) => (
            <NavLink
              key={c.id}
              to={c.id === 'all' ? '/collections' : `/collections/${c.id}`}
              end={c.id === 'all'}
              onClick={() => onSelectCategory(c.id)}
              className={({ isActive }) =>
                `link-underline flex shrink-0 items-center whitespace-nowrap py-3.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                  isActive ? 'text-[var(--ink)] is-active' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`
              }
            >
              {c.shortLabel}
            </NavLink>
          ))}
          <button
            onClick={onOpenReels}
            className="link-underline flex shrink-0 items-center whitespace-nowrap py-3.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Instagram
          </button>
        </div>
      </nav>

      {/* Search panel */}
      {searchOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--bg)]">
          <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-8">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-2">
              <Search className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.5} />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Russian silk, Anarkali, Chikankari…"
                className="flex-1 bg-transparent text-sm font-light placeholder:text-[var(--muted)] focus:outline-none"
              />
              <button
                onClick={() => { onSearchChange(''); setSearchOpen(false); }}
                aria-label="Close search"
                className="p-1 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {q && (
              <div className="mt-4">
                {results.length === 0 ? (
                  <p className="py-4 text-xs text-[var(--muted)]">
                    Nothing matches “{searchQuery}”.
                  </p>
                ) : (
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {results.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => {
                            onSelectProduct(p);
                            setSearchOpen(false);
                            onSearchChange('');
                          }}
                          className="flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-[var(--bg-soft)]"
                        >
                          <span className="relative block h-14 w-11 shrink-0 overflow-hidden bg-[var(--bg-soft)]">
                            <SmartImage
                              src={p.primaryImage}
                              alt={p.name}
                              fallbackLabel={p.name}
                              fallbackHex={p.colorHex}
                              className="h-full w-full object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-light">{p.name}</span>
                            <span className="block text-[11px] text-[var(--muted)]">
                              {displayPrice(p, currency)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => { setSearchOpen(false); navigate(`/collections?q=${encodeURIComponent(searchQuery)}`); }}
                  className="link-underline mt-3 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
