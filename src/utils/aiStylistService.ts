import { Product, Category } from '../types';

export interface StylistRecommendation {
  outfit: Product;
  blouseRecommendation: string;
  jewelryRecommendation: string;
  drapeTip: string;
  makeupTip: string;
  stylistNote?: string;
  poweredByClaude?: boolean;
}

interface StylistPreferences {
  occasion: string;
  vibe: string;
  drapeExperience: string;
  products: Product[];
}

export async function generateAiStylistAdvice({
  occasion,
  vibe,
  drapeExperience,
  products,
}: StylistPreferences): Promise<StylistRecommendation> {
  // The Anthropic key stays on the server — see api/stylist.ts. If the
  // endpoint is missing (plain `vite dev`) or unconfigured, we fall through to
  // the rule engine below and the feature still works.
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);

    const res = await fetch('/api/stylist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        occasion,
        vibe,
        fitPreference: drapeExperience,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          subtitle: p.subtitle,
          category: p.category,
          fabric: p.fabric,
          price: p.price,
          description: p.description,
        })),
      }),
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const matched =
        products.find((p) => String(p.id) === String(data.outfitId)) || products[0];
      return {
        outfit: matched,
        blouseRecommendation: data.blouseRecommendation,
        jewelryRecommendation: data.jewelryRecommendation,
        drapeTip: data.drapeTip,
        makeupTip: data.makeupTip,
        stylistNote: data.stylistNote,
        poweredByClaude: true,
      };
    }
  } catch {
    /* offline, aborted, or no serverless runtime — use the rule engine */
  }

  // Graceful couture expert fallback
  let matchedProduct = products[0];
  if (drapeExperience === 'beginner' || vibe === 'modern') {
    matchedProduct =
      products.find((p) => (['kurta-set', 'salwar-suit'] as Category[]).includes(p.category)) ||
      products[0];
  } else if (vibe === 'royal' || occasion === 'wedding') {
    matchedProduct =
      products.find((p) => (['russian-silk', 'anarkali'] as Category[]).includes(p.category)) ||
      products[0];
  } else if (vibe === 'shimmer' || occasion === 'cocktail') {
    matchedProduct =
      products.find((p) => (['modal-silk', 'festive'] as Category[]).includes(p.category)) ||
      products[2] ||
      products[0];
  } else {
    matchedProduct =
      products.find((p) => (['handloom', 'salwar-suit'] as Category[]).includes(p.category)) ||
      products[3] ||
      products[0];
  }

  return {
    outfit: matchedProduct,
    blouseRecommendation:
      vibe === 'royal'
        ? 'A deeper neckline with worked sleeves carries this best — ask about elbow-length.'
        : vibe === 'modern'
        ? 'Keep the neckline clean and the sleeves simple so the fabric leads.'
        : 'A high collar or boat neck suits the print; keep the trim minimal.',
    jewelryRecommendation:
      occasion === 'wedding'
        ? 'Traditional gold — a Kolhapuri saaj or Thushi choker sits well with this.'
        : occasion === 'cocktail'
        ? 'Modern uncut Polki diamond choker with chandelier earrings; skip the heavy necklace to let the neckline shine.'
        : 'Temple gold coin necklace with ruby Kemp studs and fresh jasmine gajra.',
    drapeTip:
      drapeExperience === 'beginner'
        ? 'Ready to wear — pick your usual size and ask Rasika to confirm it before you order.'
        : 'Send your bust, waist and length on WhatsApp and Rasika will cut to your measurements.',
    makeupTip: 'A dewy base, a soft berry lip, and a light hand with the eyes — let the outfit lead.',
    stylistNote:
      'Made to be worn often rather than saved for one occasion — ask Rasika what can be customised on it.',
    poweredByClaude: false,
  };
}
