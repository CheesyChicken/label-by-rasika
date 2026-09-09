import { Category, Occasion, Product } from '../types';
import { PRODUCTS } from './products';

/**
 * Single source of truth for the storefront taxonomy.
 *
 * Navbar, SidebarDrawer and FilterControls all read from here, so the browsing
 * chrome can never drift away from what the catalogue actually contains again.
 * (It previously advertised Paithani / Kanjivaram / Banarasi saree categories
 * while the catalogue held only ready-to-wear suits — every tab returned zero
 * products.)
 */

export interface CategoryDef {
  id: Category;
  label: string;
  shortLabel: string;
  sub: string;
  tag?: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'all',          label: 'View All',                shortLabel: 'All',          sub: 'The full atelier' },
  { id: 'kurta-set',    label: 'Kurtas & Sets',           shortLabel: 'Kurtas',       sub: 'Everyday elegance' },
  { id: 'anarkali',     label: 'Anarkali',                shortLabel: 'Anarkali',     sub: 'Floor-length flare' },
  { id: 'party-wear',   label: 'Party & Occasion',        shortLabel: 'Occasion',     sub: 'Two-piece & indo-western' },
  { id: 'salwar-suit',  label: 'Suits & Dress Material',  shortLabel: 'Suits',        sub: 'Stitched or unstitched' },
  { id: 'russian-silk', label: 'Tunics & Gararas',        shortLabel: 'Tunics',       sub: 'Silk separates' },
  { id: 'modal-silk',   label: 'Modal Silk',              shortLabel: 'Modal Silk',   sub: 'Bandhani & prints' },
  { id: 'festive',      label: 'Festive Edit',            shortLabel: 'Festive',      sub: 'Utsav ready' },
  { id: 'handloom',     label: 'Handloom & Heritage',     shortLabel: 'Handloom',     sub: 'Pure weaves' },
];

/**
 * Only the categories that actually hold stock.
 *
 * Guarantees no browsing control can ever lead to an empty grid — if a
 * category is emptied in products.ts it simply stops being offered.
 */
/**
 * True once at least one piece carries a real price. Until then every price
 * sort and the currency selector are no-ops and are hidden.
 */
export const HAS_PRICES = PRODUCTS.some((p) => !p.priceOnRequest && p.price > 0);

export const ACTIVE_CATEGORIES: CategoryDef[] = CATEGORIES.filter(
  (c) => c.id === 'all' || PRODUCTS.some((p) => p.category === c.id)
);

/** Occasions that at least one piece is tagged for. */
export const ACTIVE_OCCASIONS = (): OccasionDef[] =>
  OCCASIONS.filter((o) => o.id === 'all' || PRODUCTS.some((p) => p.occasion.includes(o.id)));

export interface OccasionDef {
  id: Occasion;
  label: string;
}

export const OCCASIONS: OccasionDef[] = [
  { id: 'all',           label: 'All Occasions' },
  { id: 'wedding',       label: 'Wedding & Muhurat' },
  { id: 'wedding-guest', label: 'Wedding Guest' },
  { id: 'festive',       label: 'Festive Utsav' },
  { id: 'party',         label: 'Party & Reception' },
  { id: 'puja',          label: 'Temple & Puja' },
  { id: 'casual',        label: 'Everyday Casual' },
];

/** Catalogue headings keyed by category. */
export const CATALOG_HEADINGS: Record<Category, string> = {
  all: 'The Label by Rasika Collection',
  'kurta-set': 'Kurtas & Sets',
  anarkali: 'Anarkali',
  'party-wear': 'Party & Occasion',
  'salwar-suit': 'Suits & Dress Material',
  'russian-silk': 'Tunics & Gararas',
  'modal-silk': 'Modal Silk',
  festive: 'Festive Edit',
  handloom: 'Handloom & Heritage',
};

/**
 * Colour swatches shown in the filter rail.
 *
 * DERIVED from the same COLOUR_FAMILIES the Shop-by menu uses, so every swatch
 * is guaranteed to return pieces. The previous hand-written list ("Deep Plum",
 * "Rose Gold & Ivory", "Mustard & Terracotta") was scaffold copy: the filter
 * matched on the first word of the label, and 8 of the 9 first words appear in
 * no product's stated colour, so 8 of 9 swatches returned an empty grid.
 */
export const COLOR_SWATCHES: { name: string; hex: string; count: number }[] = [];



// ── "Shop by" facets ────────────────────────────────────────────────────────

/**
 * Every facet below is DERIVED from the catalogue, never hand-listed. A value
 * appears in the menu only if at least one piece carries it, so the menu can
 * never offer a filter that leads to an empty grid.
 */
export interface Facet {
  /** Query value, e.g. "Russian Silk". */
  value: string;
  label: string;
  count: number;
  href: string;
}

export interface FacetGroup {
  key: string;
  title: string;
  facets: Facet[];
}

const tally = (values: (p: Product) => string[]): Map<string, number> => {
  const m = new Map<string, number>();
  for (const p of PRODUCTS) {
    for (const v of values(p)) {
      if (!v) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
  }
  return m;
};

const toFacets = (m: Map<string, number>, param: string): Facet[] =>
  [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({
      value,
      label: value,
      count,
      href: `/collections?${param}=${encodeURIComponent(value)}`,
    }));

/**
 * Craft words pulled out of each piece's embellishment text — the techniques
 * Rasika actually names in her own captions (Bandhani, Gota Patti, Madhubani,
 * hand painting, hand embroidery), rather than a generic "prints" list.
 */
const CRAFTS = [
  'Bandhani', 'Patola', 'Madhubani', 'Gota Patti', 'Hand Painted',
  'Hand Embroidery', 'Mirror Work', 'Chikankari', 'Print', 'Zari',
];

const craftsOf = (p: Product): string[] => {
  const hay = `${p.embellishment} ${p.name} ${p.subtitle}`.toLowerCase();
  return CRAFTS.filter((c) => hay.includes(c.toLowerCase().replace(' painted', ' paint')));
};

/**
 * Broad colour families, so "Regal Blue" and "Navy Blue" both answer to Blue.
 *
 * A garment can belong to more than one family on purpose: teal reads as both
 * blue and green, and a "Blue & White" set genuinely belongs under both.
 *
 * Only Rasika's own stated colour is used. Deriving colour from the photographs
 * was tried and abandoned — sampling the dominant hue called the Blue Russian
 * Silk Tunic "pink" and the Mint Green piece "yellow", because so many shots
 * are taken against the store's colourful racks or include a second person.
 * A garment whose colour she never stated is simply not offered under any
 * colour filter, rather than being mislabelled.
 */
const COLOUR_FAMILIES: [string, string[]][] = [
  ['Blue', ['blue', 'navy', 'teal', 'indigo', 'cobalt']],
  ['Green', ['green', 'pista', 'bottle', 'mint', 'emerald', 'olive', 'teal']],
  ['Pink', ['pink', 'magenta', 'rose', 'blush']],
  ['Purple', ['purple', 'plum', 'lilac', 'lavender', 'aubergine']],
  ['Red & Maroon', ['red', 'maroon', 'crimson', 'wine', 'rust']],
  ['Yellow & Mustard', ['yellow', 'mustard', 'ochre', 'gold']],
  ['Ivory & White', ['ivory', 'white', 'cream', 'chalk', 'bone']],
  ['Black & Grey', ['black', 'grey', 'gray', 'charcoal', 'graphite']],
  ['Pastel', ['pastel', 'peach', 'powder']],
];

/** Colours we will not guess at — these mean "Rasika did not say". */
const UNSTATED = ['assorted', 'multi', 'multi-colour', 'multicolor', 'various'];

export const colourFamiliesOf = (p: Product): string[] => {
  const c = p.colorName.toLowerCase().trim();
  if (!c || UNSTATED.some((u) => c === u)) return [];
  return COLOUR_FAMILIES.filter(([, keys]) => keys.some((k) => c.includes(k))).map(([n]) => n);
};

/** A representative hex per family, for the round swatch buttons. */
const FAMILY_HEX: Record<string, string> = {
  Blue: '#1f3d7a',
  Green: '#1a6b3c',
  Pink: '#d9557f',
  Purple: '#5c2a63',
  'Red & Maroon': '#8b1a1a',
  'Yellow & Mustard': '#c4862b',
  'Ivory & White': '#ece7de',
  'Black & Grey': '#2b2724',
  Pastel: '#f2d9cd',
};

COLOR_SWATCHES.push(
  ...[...tally(colourFamiliesOf).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, hex: FAMILY_HEX[name] ?? '#8a8178', count }))
);

export const SHOP_BY_GROUPS: FacetGroup[] = [
  {
    key: 'silhouette',
    title: 'Silhouette',
    facets: ACTIVE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
      value: c.id,
      label: c.label,
      count: PRODUCTS.filter((p) => p.category === c.id).length,
      href: `/collections/${c.id}`,
    })),
  },
  {
    key: 'fabric',
    title: 'Fabric',
    // 'Not stated' means Rasika never named a fabric — not a fabric to shop by.
    facets: toFacets(tally((p) => (p.fabric === 'Not stated' ? [] : [p.fabric])), 'fabric'),
  },
  { key: 'craft', title: 'Craft', facets: toFacets(tally(craftsOf), 'craft') },
  { key: 'colour', title: 'Colour', facets: toFacets(tally(colourFamiliesOf), 'colour') },
].filter((g) => g.facets.length > 0);

/** Does a piece match a facet query? Used by the collection page. */
export function matchesFacets(
  p: Product,
  q: { fabric?: string | null; craft?: string | null; colour?: string | null }
): boolean {
  if (q.fabric && p.fabric !== q.fabric) return false;
  if (q.craft && !craftsOf(p).includes(q.craft)) return false;
  if (q.colour && !colourFamiliesOf(p).includes(q.colour)) return false;
  return true;
}


// ── Home "Shop by collection" strip ─────────────────────────────────────────

export interface CollectionTile {
  key: string;
  label: string;
  sub: string;
  href: string;
  count: number;
  /** Which axis it came from, so a caller can balance the mix. */
  axis: 'silhouette' | 'craft' | 'fabric' | 'colour';
  /** Products belonging to it, for picking a photograph. */
  productIds: string[];
}

/**
 * Browsable collections drawn from EVERY real axis, not just silhouette.
 *
 * Only five categories hold stock, which made a five-tile strip — and fewer
 * when the hero claimed the sole product of a category. Craft, fabric and
 * colour are equally real ways in, and every tile below is generated from the
 * catalogue with a live count, so none can lead to an empty grid.
 */
export function collectionTiles(minCount = 1): CollectionTile[] {
  const tiles: CollectionTile[] = [];

  for (const c of ACTIVE_CATEGORIES) {
    if (c.id === 'all') continue;
    const ids = PRODUCTS.filter((p) => p.category === c.id).map((p) => p.id);
    if (ids.length >= minCount) {
      tiles.push({
        key: `cat:${c.id}`, label: c.label, sub: c.sub,
        href: `/collections/${c.id}`, count: ids.length, axis: 'silhouette', productIds: ids,
      });
    }
  }

  for (const g of SHOP_BY_GROUPS) {
    if (g.key === 'silhouette') continue;
    const axis = g.key as CollectionTile['axis'];
    const sub =
      axis === 'craft' ? 'Handwork' : axis === 'fabric' ? 'By fabric' : 'By colour';
    for (const f of g.facets) {
      if (f.count < minCount) continue;
      const ids = PRODUCTS.filter((p) =>
        matchesFacets(p, {
          craft: axis === 'craft' ? f.value : null,
          fabric: axis === 'fabric' ? f.value : null,
          colour: axis === 'colour' ? f.value : null,
        })
      ).map((p) => p.id);
      if (!ids.length) continue;
      tiles.push({
        key: `${axis}:${f.value}`, label: f.label, sub,
        href: f.href, count: ids.length, axis, productIds: ids,
      });
    }
  }

  return tiles;
}
