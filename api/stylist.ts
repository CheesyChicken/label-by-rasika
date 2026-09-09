/**
 * POST /api/stylist
 *
 * Server-side AI styling recommendation.
 *
 * The Anthropic key MUST stay on the server. This previously ran in the
 * browser with `anthropic-dangerous-direct-browser-access`, and vite.config.ts
 * inlined ANTHROPIC_API_KEY into the client bundle — deploying that to Vercel
 * would have published the key to anyone who opened devtools.
 *
 * Set ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables.
 * Without it this returns 503 and the client falls back to its rule engine, so
 * the feature degrades rather than breaking.
 */

import Anthropic from '@anthropic-ai/sdk';

interface CatalogItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  fabric: string;
  price: number;
  description: string;
}

const OCCASION_NAMES: Record<string, string> = {
  wedding: 'Wedding / Muhurat',
  reception: 'Reception & Sangeet',
  cocktail: 'Cocktail / modern evening party',
  puja: 'Festive ritual / family puja',
};

const VIBE_NAMES: Record<string, string> = {
  royal: 'Heirloom opulence',
  modern: 'Contemporary, sleek silhouette',
  shimmer: 'Golden glow, festive radiance',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'stylist unavailable: ANTHROPIC_API_KEY not configured' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
  const { occasion = '', vibe = '', fitPreference = '', products = [] } = body as {
    occasion?: string;
    vibe?: string;
    fitPreference?: string;
    products?: CatalogItem[];
  };

  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ error: 'products is required and must be a non-empty array' });
    return;
  }

  // Only the fields the model needs — keeps the prompt small and predictable.
  const catalog = products.slice(0, 40).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    fabric: p.fabric,
    description: String(p.description ?? '').slice(0, 400),
  }));

  const client = new Anthropic({ apiKey });

  const system = `You are a styling assistant for "Label by Rasika", a ready-to-wear and customised womenswear label in Pimple Gurav, Pune, founded by Rasika Wankhede. The label makes kurta sets, Anarkalis, salwar suits and tunics. It does NOT sell sarees; never mention saree draping, pallus or petticoats.

You are writing STYLING SUGGESTIONS ONLY. Everything you write is shown to a customer, so it must never state anything about the business that you have not been given.

Hard rules — breaking any of these misleads a real customer and lands on the boutique:
- NEVER state or estimate a price, a discount, an offer or a delivery time.
- NEVER promise shipping, dispatch, returns, exchanges, stock or availability.
- NEVER state a fabric, a size, a measurement or a material for a piece unless it appears verbatim in the catalogue entry below. If the fabric reads "Not stated", do not guess one.
- NEVER claim a certification, an award, an origin, a mill, a cluster or a brand name (for example Swarovski).
- NEVER write in Rasika's first person or sign anything as her. Write as the shop's assistant.
- If the customer needs a price, availability or a timeline, say it is confirmed on WhatsApp.

Reply with a single raw JSON object and nothing else — no prose, no markdown fences:
{
  "outfitId": "<id copied exactly from the catalogue>",
  "blouseRecommendation": "<neckline, sleeve cut and dupatta styling for this set>",
  "jewelryRecommendation": "<jewellery pairing>",
  "drapeTip": "<how to wear it, matched to the client's fit preference>",
  "makeupTip": "<makeup and hair>",
  "stylistNote": "<a warm note about the look — no prices, no promises>"
}`;

  const userPrompt = `Client brief:
- Occasion: ${OCCASION_NAMES[occasion] || occasion || 'unspecified'}
- Desired aesthetic: ${VIBE_NAMES[vibe] || vibe || 'unspecified'}
- Fit preference: ${
    fitPreference === 'beginner'
      ? 'Ready to wear, minimal fuss'
      : 'Bespoke, tailored to measurements'
  }

Active catalogue:
${JSON.stringify(catalog, null, 2)}

Pick the single best matching piece and style it.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1500,
      output_config: { effort: 'low' },
      system,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (message.stop_reason === 'refusal') {
      res.status(502).json({ error: 'model declined the request' });
      return;
    }

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      res.status(502).json({ error: 'model returned unparseable output' });
      return;
    }

    // Never trust the model's id blindly — it must exist in the catalogue.
    const matched = catalog.find((p) => String(p.id) === String(parsed.outfitId));

    // Belt and braces: the prompt forbids prices and promises, so drop any
    // field that contains one rather than rendering it to a customer.
    const FORBIDDEN =
      /(₹|\brs\.?\s*\d|\bprice[sd]?\b|\bcost\b|\bdiscount\b|\boffer\b|\bfree\b|\bship\w*\b|\bdispatch\w*\b|\bdeliver\w*\b|\breturn\w*\b|\bexchange\w*\b|\bin stock\b|\bguarantee\w*\b|\bcertified\b|\bswarovski\b|\bbusiness days?\b)/i;
    const TEXT_FIELDS = [
      'blouseRecommendation', 'jewelryRecommendation', 'drapeTip', 'makeupTip', 'stylistNote',
    ] as const;
    let redacted = 0;
    for (const key of TEXT_FIELDS) {
      const v = parsed[key];
      if (typeof v === 'string' && FORBIDDEN.test(v)) {
        delete parsed[key];
        redacted++;
      }
    }
    if (redacted) console.warn(`[api/stylist] dropped ${redacted} field(s) containing a price or promise`);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ...parsed,
      outfitId: matched ? matched.id : catalog[0].id,
      poweredByClaude: true,
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'rate limited, try again shortly' });
      return;
    }
    const status = err instanceof Anthropic.APIError ? err.status ?? 502 : 500;
    console.error('[api/stylist]', err);
    res.status(status).json({ error: 'stylist request failed' });
  }
}
