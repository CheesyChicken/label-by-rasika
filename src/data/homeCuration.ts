import { Product } from '../types';
import { PRODUCTS } from './products';
import { collectionTiles } from './taxonomy';
import { IG_GALLERY } from './instagram';
import { CUSTOMER_LOOKS } from './customerLooks';

/** Post date per shortcode, from the archive — the real "new in" signal. */
const POSTED = new Map<string, number>(
  IG_GALLERY.filter((g) => g.date).map((g) => [g.code, g.date as number])
);
const postedAt = (p: Product): number =>
  (p.instagramShortcode && POSTED.get(p.instagramShortcode)) || 0;


/**
 * Chooses what the home page shows, guaranteeing no photograph appears twice.
 *
 * Before this existed the front page repeated eleven images: the category tiles
 * reused each category's first product photo (already on a card below), the
 * hero reused product photos, the editorial band reused PRODUCTS[4], and
 * "New in" fell back to PRODUCTS.slice(0, 8) which overlapped "Bestsellers"
 * outright. Every section now draws from a shared pool and claims what it uses.
 *
 * The pick also rotates: a fresh offset each load means a returning visitor
 * sees different pieces and different photographs from the same archive, which
 * is 400+ images deep.
 */

export interface HeroSlideSource {
  product: Product;
  image: string;
}

export interface HomeCuration {
  seed: number;
  heroSources: HeroSlideSource[];
  categoryTiles: { id: string; label: string; sub: string; href: string; count: number; image: string }[];
  bestsellers: Product[];
  newIn: Product[];
  more: Product[];
  editorialImage: string;
}

/** Deterministic shuffle so one seed reproduces one arrangement exactly. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    // xorshift — small, dependency-free, good enough for picking photographs
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = Math.abs(s) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** All photographs belonging to a product, primary first. */
const imagesOf = (p: Product): string[] =>
  [p.primaryImage, p.hoverImage, ...p.galleryImages].filter(
    (v, i, a) => Boolean(v) && a.indexOf(v) === i
  );

export function curateHome(seed = Date.now()): HomeCuration {
  const claimed = new Set<string>();
  /**
   * Products already shown in SOME section.
   *
   * Claiming by filename alone was not enough. Every product's photographs come
   * from one Instagram carousel — consecutive frames of one shoot, same pose and
   * backdrop, seconds apart. Handing _0 to a category tile and _1 to a product
   * card gave two different files that read as the same photograph, which is
   * exactly the repetition this module exists to prevent. A product now belongs
   * to one section only; within that section it may use as many of its own
   * frames as it needs.
   */
  const spentProducts = new Set<string>();

  const claim = (img: string) => {
    if (!img) return false;
    if (claimed.has(img)) return false;
    claimed.add(img);
    return true;
  };

  /** First unclaimed photograph of this product, or null if it has none left. */
  const takeFrom = (p: Product): string | null =>
    imagesOf(p).find((img) => claim(img)) ?? null;

  const pool = shuffle(PRODUCTS, seed);

  // ── Hero first: it is the largest surface, so it gets first pick. ─────────
  const heroSources: HeroSlideSource[] = [];
  for (const p of pool) {
    if (heroSources.length >= 4) break;
    const image = takeFrom(p);
    if (image) {
      heroSources.push({ product: p, image });
      spentProducts.add(p.id);
    }
  }

  // ── Collection tiles ─────────────────────────────────────────────────────
  // Drawn from every axis — silhouette, craft, fabric, colour — because only
  // five categories hold stock and a five-tile strip is a thin way in. A tile
  // is kept only if some product in it can still supply an unclaimed
  // photograph, so a tile never renders blank; and a tile does NOT spend its
  // product, because a collection is a way in rather than a slot of its own.
  const wanted = shuffle(collectionTiles(), seed + 31);
  const categoryTiles: HomeCuration['categoryTiles'] = [];
  for (const t of wanted) {
    if (categoryTiles.length >= 12) break;
    const candidates = shuffle(
      PRODUCTS.filter((p) => t.productIds.includes(p.id)),
      seed + t.key.length
    );
    let image: string | null = null;
    for (const p of candidates) {
      if (spentProducts.has(p.id)) continue;
      image = imagesOf(p).find((img) => !claimed.has(img)) ?? null;
      if (image) {
        claimed.add(image);
        spentProducts.add(p.id);
        break;
      }
      image = null;
    }
    if (image) {
      categoryTiles.push({
        id: t.key, label: t.label, sub: t.sub, href: t.href, count: t.count, image,
      });
    }
  }

  // ── Product rails: disjoint sets, each card claiming its own two images. ──
  const rest = pool.filter((p) => !spentProducts.has(p.id));
  const byEngagement = [...rest].sort((a, b) => b.likes - a.likes);

  const used = new Set<string>();
  /** How many of this product's photographs are still unspoken for. */
  const spare = (p: Product) => imagesOf(p).filter((img) => !claimed.has(img)).length;

  const take = (source: Product[], n: number, keepOrder = false): Product[] => {
    const picked: Product[] = [];
    // A card wants two distinct photographs — one at rest, one on hover — so
    // prefer products that can still supply both. Without this, a two-image
    // product whose second shot was already claimed elsewhere ends up with the
    // same file on both sides and the hover does nothing.
    // `keepOrder` rails ("Most loved", "New in") are ranked lists: re-sorting
    // them by spare photographs silently threw the ranking away.
    const queue = keepOrder ? [...source] : [...source].sort((a, b) => spare(b) - spare(a));
    for (const p of queue) {
      if (picked.length >= n) break;
      if (used.has(p.id)) continue;
      if (spare(p) < 2 && picked.length < n) {
        // Only accept a single-image product once nothing better is left.
        const better = queue.some((q) => !used.has(q.id) && spare(q) >= 2);
        if (better) continue;
      }
      const primary = takeFrom(p);
      if (!primary) continue;
      const hover = takeFrom(p) ?? primary;
      used.add(p.id);
      spentProducts.add(p.id);
      picked.push({ ...p, primaryImage: primary, hoverImage: hover });
    }
    return picked;
  };

  // Strictly by Instagram likes, in that order — the heading says so.
  const bestsellers = take(byEngagement, 8, true);
  // Strictly by post date, newest first.
  const byDate = [...rest].sort((a, b) => postedAt(b) - postedAt(a));
  const newIn = take(byDate, 8, true);
  const more = take(rest, 8);

  // ── Editorial band: any remaining archive photograph. ────────────────────
  // Drawn from the wider archive, and never from a carousel already on the page
  // — including the "Customers wearing LBR" strip further down, which renders
  // on this same page from the same archive.
  // NB: Instagram shortcodes can themselves contain underscores (DJ1kGB3N_cT),
  // so the post code is everything before the trailing _<index>.jpg — splitting
  // on the first underscore truncates it and defeats the check.
  const codeOf = (file: string) =>
    (file.split('/').pop() ?? '').replace(/_\d+\.[a-z]+$/i, '');

  const shownShortcodes = new Set([
    ...[...claimed].map(codeOf),
    ...CUSTOMER_LOOKS.map((l) => l.code),
  ]);
  const editorialImage =
    shuffle(IG_GALLERY.filter((g) => !g.isVideo), seed)
      .filter((g) => !shownShortcodes.has(g.code))
      .map((g) => g.file)
      .find((f) => claim(f)) ?? '';

  return { seed, heroSources, categoryTiles, bestsellers, newIn, more, editorialImage };
}
