import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  CartAddon, CartItem, Category, CurrencyCode,
  InstagramProfile, Occasion, Product, SizeCustomization,
} from '../types';
import { PRODUCTS } from '../data/products';
import { colourFamiliesOf } from '../data/taxonomy';
import { IG_GALLERY } from '../data/instagram';
import { useInstagramProfile } from '../hooks/useInstagram';

/** Ready to wear — the default for one-tap "add to bag". */
export const DEFAULT_STITCHING: SizeCustomization = {
  type: 'ready-to-wear',
  size: 'M',
};

/** Instagram post date (unix seconds) per shortcode, for the "newest" sort. */
const POSTED_AT = new Map<string, number>(
  IG_GALLERY.filter((g) => g.date).map((g) => [g.code, g.date as number])
);
const postedAt = (p: Product): number =>
  (p.instagramShortcode && POSTED_AT.get(p.instagramShortcode)) || 0;

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeStored(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

export interface Filters {
  occasion: Occasion;
  color: string | null;
  sortBy: string;
  gridColumns: 2 | 3 | 4;
}

interface StoreValue {
  // currency
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;

  // search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // cart
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (
    product: Product,
    sizeInfo?: SizeCustomization,
    addTailoring?: boolean,
    addDupatta?: boolean
  ) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeCartItem: (cartId: string) => void;
  toggleAddon: (cartId: string, addon: CartAddon) => void;

  // wishlist
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  moveWishlistToCart: (product: Product) => void;
  isWishlisted: (id: string) => boolean;

  // filters
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  filterProducts: (category: Category) => Product[];

  // instagram
  igProfile: InstagramProfile;

  // ui
  // auth
  user: { phone: string; email: string | null } | null;
  signIn: (u: { phone: string; email: string | null }) => void;
  signOut: () => void;

  toast: string | null;
  showToast: (msg: string) => void;
  ui: {
    sidebar: boolean; cart: boolean; wishlist: boolean; contact: boolean;
    stylist: boolean; styleGuide: boolean; auth: boolean;
  };
  openPanel: (key: keyof StoreValue['ui']) => void;
  closePanel: (key: keyof StoreValue['ui']) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const DEFAULT_FILTERS: Filters = {
  occasion: 'all',
  color: null,
  sortBy: 'featured',
  gridColumns: 3,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [searchQuery, setSearchQuery] = useState('');
  // Both survive a refresh. They were pure in-memory state, so a customer who
  // saved six pieces and reloaded lost all of them.
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStored<CartItem[]>('lbr.bag.v1', [])
      .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.product?.id) as Product }))
      .filter((i) => i.product)
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => readStored('lbr.wishlist.v1', []));
  useEffect(() => writeStored('lbr.bag.v1', cartItems), [cartItems]);
  useEffect(() => writeStored('lbr.wishlist.v1', wishlistIds), [wishlistIds]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<string | null>(null);
  // Only the display fields live here. The session itself is an httpOnly
  // cookie the browser cannot read, so this is a convenience mirror, not proof
  // of authentication — the server re-verifies on every protected call.
  const [user, setUser] = useState<StoreValue['user']>(() => {
    try {
      const raw = localStorage.getItem('lbr.user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  // Monotonic — an index-derived id repeats after a removal and collides.
  const cartSeq = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ui, setUi] = useState({
    sidebar: false, cart: false, wishlist: false, contact: false,
    stylist: false, styleGuide: false, auth: false,
  });

  const { profile: igProfile } = useInstagramProfile();

  const signIn = useCallback((u: { phone: string; email: string | null }) => {
    setUser(u);
    try { localStorage.setItem('lbr.user', JSON.stringify(u)); } catch { /* private mode */ }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem('lbr.user'); } catch { /* private mode */ }
    // Clear the session cookie server-side too.
    fetch('/api/auth/sign-out', { method: 'POST' }).catch(() => {});
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const openPanel = useCallback(
    (key: keyof StoreValue['ui']) => setUi((p) => ({ ...p, [key]: true })),
    []
  );
  const closePanel = useCallback(
    (key: keyof StoreValue['ui']) => setUi((p) => ({ ...p, [key]: false })),
    []
  );

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (
      product: Product,
      sizeInfo: SizeCustomization = DEFAULT_STITCHING,
      addTailoring = false,
      addDupatta = false
    ) => {
      setCartItems((prev) => {
        // Add-ons are part of the line's identity — merging without them
        // silently drops a paid extra the customer chose.
        const idx = prev.findIndex(
          (i) =>
            i.product.id === product.id &&
            i.sizeInfo.type === sizeInfo.type &&
            i.sizeInfo.size === sizeInfo.size &&
            i.addTailoring === addTailoring &&
            i.addDupatta === addDupatta
        );
        if (idx > -1) {
          return prev.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [
          {
            cartId: `cart-${product.id}-${(cartSeq.current += 1)}`,
            product, quantity: 1, sizeInfo, addTailoring, addDupatta,
          },
          ...prev,
        ];
      });
      showToast(`Added “${product.name}” to your bag`);
      setUi((p) =>
        p.stylist || p.wishlist || p.styleGuide || p.contact
          ? p
          : { ...p, cart: true }
      );
    },
    [openPanel, showToast]
  );

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setCartItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.cartId !== cartId)
        : prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  }, []);

  const removeCartItem = useCallback(
    (cartId: string) => {
      setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
      showToast('Removed from your bag');
    },
    [showToast]
  );

  const toggleAddon = useCallback((cartId: string, addon: CartAddon) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.cartId !== cartId
          ? i
          : addon === 'tailoring'
          ? { ...i, addTailoring: !i.addTailoring }
          : { ...i, addDupatta: !i.addDupatta }
      )
    );
  }, []);

  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    (product: Product) => {
      const has = wishlistIds.includes(product.id);
      setWishlistIds((prev) =>
        has ? prev.filter((id) => id !== product.id) : [...prev, product.id]
      );
      showToast(has ? 'Removed from wishlist' : `Saved “${product.name}”`);
    },
    [showToast, wishlistIds]
  );

  /** Wishlist → bag in one step, with one toast that says what happened. */
  const moveWishlistToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      showToast(`Moved “${product.name}” to your bag`);
    },
    [addToCart, showToast]
  );

  const wishlistProducts = useMemo(
    () => PRODUCTS.filter((p) => wishlistIds.includes(p.id)),
    [wishlistIds]
  );
  const isWishlisted = useCallback((id: string) => wishlistIds.includes(id), [wishlistIds]);

  // Post date per shortcode, from the gallery we downloaded — the only real
  // recency signal we hold. `isNew` was a hand-set flag on 6 products that were
  // already first in the file, so sorting by it changed nothing.
  // ── Filtering ─────────────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  const filterProducts = useCallback(
    (category: Category) => {
      const q = searchQuery.trim().toLowerCase();
      return PRODUCTS.filter((p) => {
        if (category !== 'all' && p.category !== category) return false;
        if (filters.occasion !== 'all' && !p.occasion.includes(filters.occasion)) return false;
        if (filters.color && !colourFamiliesOf(p).includes(filters.color)) return false;
        if (q) {
          const hay = `${p.name} ${p.fabric} ${p.embellishment} ${p.description} ${p.colorName}`;
          if (!hay.toLowerCase().includes(q)) return false;
        }
        return true;
      }).sort((a, b) => {
        // A "price on request" piece has price 0; sorting on that would park
        // every unpriced garment at the top of "price: low to high".
        const val = (p: Product) => (p.priceOnRequest ? Number.POSITIVE_INFINITY : p.price);
        if (filters.sortBy === 'price-low') return val(a) - val(b);
        if (filters.sortBy === 'price-high') {
          const bv = b.priceOnRequest ? -1 : b.price;
          const av = a.priceOnRequest ? -1 : a.price;
          return bv - av;
        }
        // Newest first by the Instagram post date we actually hold.
        if (filters.sortBy === 'newest') return postedAt(b) - postedAt(a);
        if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
        // 'featured' — most engaged-with first. products.ts is already in
        // date order, so without this 'featured' and 'newest' were identical
        // and one of the two dropdown options did nothing observable.
        if (filters.sortBy === 'featured') return b.likes - a.likes;
        return 0;
      });
    },
    [filters, searchQuery]
  );

  const value: StoreValue = {
    currency, setCurrency,
    searchQuery, setSearchQuery,
    cartItems, cartCount,
    addToCart, updateQuantity, removeCartItem, toggleAddon,
    wishlistIds, wishlistProducts, toggleWishlist, moveWishlistToCart, isWishlisted,
    filters, setFilters, resetFilters, filterProducts,
    igProfile,
    user, signIn, signOut,
    toast, showToast, ui, openPanel, closePanel,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
