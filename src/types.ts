export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'CAD';

export type Category =
  | 'all'
  | 'russian-silk'
  | 'modal-silk'
  | 'anarkali'
  | 'salwar-suit'
  | 'kurta-set'
  | 'party-wear'
  | 'festive'
  | 'handloom';

export type Occasion =
  | 'all'
  | 'wedding'
  | 'wedding-guest'
  | 'festive'
  | 'party'
  | 'casual'
  | 'puja';

export type FabricType =
  | 'Russian Silk'
  | 'Modal Silk'
  | 'Pure Georgette'
  | 'Chanderi Silk Cotton'
  | 'Muslin Cotton'
  | 'Organza'
  | 'Net'
  | 'Raw Silk'
  | 'Semi-Banarasi Silk Cotton'
  | 'Handloom Cotton'
  | 'Chinon'
  | 'Cotton'
  | 'Modal Silk Bandhani'
  /** Rasika did not state a fabric for this piece — do not guess one. */
  | 'Not stated';

export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Custom';

/** How the customer wants the set finished. Carried into the WhatsApp enquiry. */
export type StitchingType = 'ready-to-wear' | 'standard-stitched' | 'bespoke-tailored';

export interface SizeCustomization {
  type: StitchingType;
  size: SizeOption | string;
  neckPattern?: string;
  sleeveLength?: string;
  measurements?: {
    bust: string;
    waist: string;
    hip?: string;
    kurtaLength?: string;
    sleeve?: string;
  };
  tailoringNotes?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  occasion: Occasion[];
  price: number; // in INR; 0 when priceOnRequest is set
  /**
   * True when we do not hold a verified price for this piece. The card and the
   * product page then invite an enquiry instead of showing a number — an
   * invented price on a real garment misleads the customer and lands on the
   * boutique.
   */
  priceOnRequest?: boolean;
  /**
   * The price is an INDICATIVE estimate, not a quoted figure.
   *
   * Rasika never publishes prices — all 303 posts and 175 reel transcripts say
   * "message us for details" instead. The only money she has ever mentioned is
   * an anniversary offer ("shop for ₹3,999 and above"), which anchors a typical
   * order but is not a per-garment price. Anything flagged here must be shown
   * with a visible "indicative" marker so nobody treats it as a quote.
   */
  priceIsIndicative?: boolean;
  primaryImage: string;
  hoverImage: string;
  galleryImages: string[];
  /** Likes on the Instagram post this piece comes from. Not a review count. */
  likes: number;
  /** Direct link to the @label_by_rasika post this piece appears in. */
  instagramPostUrl?: string;
  /** Instagram shortcode, when the piece has a verified post. */
  instagramShortcode?: string | null;
  videoUrl?: string;
  colorName: string;
  colorHex: string;
  fabric: FabricType;
  embellishment: string;
  setIncludes: string;
  /** Top 8 by likes on the original Instagram post. Engagement, not sales. */
  isBestseller?: boolean;
  isNew?: boolean;
  description: string;
  details: {
    kurtiLength: string;
    bottomType: string;
    dupattalength?: string;
    availableSizes: string;
    weight: string;
    washCare: string;
  };
  tags: string[];
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  /** How the customer wants it finished. Carried into the WhatsApp enquiry. */
  sizeInfo: SizeCustomization;
  /** Customer asked for the piece to be fitted to their measurements. */
  addTailoring: boolean;
  /** Customer asked about a matching dupatta. */
  addDupatta: boolean;
}

export type CartAddon = 'tailoring' | 'dupatta';

// ── Instagram ───────────────────────────────────────────────────────────────

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followers: number;
  following: number;
  posts: number;
  profileUrl: string;
  profilePicUrl?: string;
  /** ISO date the numbers were last confirmed against instagram.com. */
  verifiedAt: string;
  /** True when the figures came from the live API rather than the fallback. */
  isLive?: boolean;
}

export interface FAQ {
  q: string;
  a: string;
}

/** A fabric & care guide entry, shown in the Style Guide modal. */
export interface StyleGuideArticle {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  summary: string;
  heroImage: string;
  /** Step-by-step styling / wearing guidance. */
  drapeSteps: string[];
  /** Short care and pairing tips. */
  stylingTips: string[];
}

// ── Instagram gallery ───────────────────────────────────────────────────────

/** One downloaded image from @label_by_rasika, with its post's context. */
export interface GalleryItem {
  /** Instagram shortcode of the post this image belongs to. */
  code: string;
  /** Index within a carousel post (0 for single-image posts). */
  i: number;
  /** Local path under /media/instagram — Instagram CDN URLs expire. */
  file: string;
  /** True when the post is a reel; this image is then its cover frame. */
  isVideo: boolean;
  isSidecar: boolean;
  caption: string;
  likes?: number | null;
  comments?: number | null;
  /** Unix seconds. */
  date?: number | null;
  location?: string | null;
  /** Spoken narration from the reel, transcribed locally. */
  transcript?: string;
}

export type GalleryView = 'gallery' | 'posts';
export type GalleryFilter = 'all' | 'photos' | 'reels';
export type GalleryColumns = 2 | 3 | 4 | 5;

/** A real customer wearing LBR, as published on @label_by_rasika. */
export interface CustomerLook {
  /** Instagram shortcode — the link back to the original post. */
  code: string;
  image: string;
  /** Rasika's own caption, cleaned of hashtags, address and @handles. */
  caption: string;
  likes: number;
  isVideo: boolean;
}
