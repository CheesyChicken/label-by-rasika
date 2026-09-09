import { FAQ, StyleGuideArticle } from '../types';

/**
 * Hand-written editorial copy: FAQs and the fabric & care guide.
 *
 * Kept OUT of products.ts, which is regenerated wholesale by
 * `npm run catalogue` — this prose used to live there and would have been
 * destroyed by every rebuild.
 *
 * Everything here must be traceable to something Rasika has published, or must
 * say plainly that she confirms it on WhatsApp. Dispatch windows, opening
 * hours, shipping destinations and return policies were all invented once and
 * are not to come back without her saying them first.
 */
// ─────────────────────────────────────────────────────────────────────────────
// FAQs — Used by ContactModal
// ─────────────────────────────────────────────────────────────────────────────
/**
 * FAQs — shown in ContactModal.
 *
 * Every answer here must be traceable to something Rasika has actually
 * published, or must say plainly that she confirms it on WhatsApp. The earlier
 * set invented dispatch windows (2–3 days / 7–10 days), a pan-India and
 * international shipping network, opening hours, and a 7-day exchange policy —
 * none of which appear in any of her 436 captions or 216 reel transcripts.
 * Fabric clusters, courier partners and delivery timelines are hers to state,
 * not ours to guess.
 */
export const FAQS: FAQ[] = [
  {
    q: 'What does Label by Rasika make?',
    a: 'Ready-to-wear and customised womenswear — kurta sets, Anarkalis, suits and dress material, tunics and gararas, and modal silk pieces. Everything on this site is a piece Rasika has published on @label_by_rasika.',
  },
  {
    q: 'Do you offer custom stitching?',
    a: 'Yes. Pieces can be finished to your size or cut to your measurements. Send your bust, waist, hip and length on WhatsApp (+91 78219 23346) and Rasika will confirm what is possible and what it costs.',
  },
  {
    q: 'What sizes are available?',
    a: 'Availability varies by piece — some are made to order, others are one-off pieces in a single size. Message us on WhatsApp with the piece you like and we will tell you what is in stock.',
  },
  {
    q: 'How much does a piece cost?',
    a: 'Prices are quoted per piece on WhatsApp, because they depend on the fabric, the size and the finishing you choose. Where this site shows a figure it is marked indicative — please confirm it before ordering.',
  },
  {
    q: 'How long does delivery take, and where do you ship?',
    a: 'Rasika confirms delivery and timelines directly on WhatsApp for each order. Please ask when you enquire rather than relying on a figure here.',
  },
  {
    q: 'Can I visit the boutique?',
    a: 'Yes — Chandrarang Park, Sudarshan Nagar, near Jagtap Patil Petrol Pump and Wankhede Jewellers, Pimple Gurav, Pune 411061. Message on WhatsApp before you travel to check she is in.',
  },
  {
    q: 'Can I exchange or return a piece?',
    a: 'Please ask about exchanges on WhatsApp before you order, particularly for made-to-measure pieces. We would rather agree it with you up front than publish a policy here.',
  },
  {
    q: 'How should I care for these fabrics?',
    a: 'Ask Rasika about the specific piece before its first wash — the right care depends on the fabric and on how it is embroidered, painted or finished, and she has not published general instructions. We would rather she tell you than guess here.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLE GUIDE — fabric, care and styling notes by Rasika.
// Rendered by StyleGuideModal (opened from the "Style Guide & Fabric Care" CTA).
// ─────────────────────────────────────────────────────────────────────────────
export const STYLE_GUIDE_ARTICLES: StyleGuideArticle[] = [
  {
    id: 'russian-silk',
    title: 'Russian Silk',
    subtitle: 'Fluid, high-sheen, and the base for her hand-embroidered tunics',
    region: 'Origin not stated',
    summary:
      'A high-lustre silk with a fluid fall — Rasika describes hers as "pure Russian silk". It holds a straight silhouette without stiffness, which is why it carries heavy handwork well. She names it on two of the pieces in this catalogue.',
    heroImage: '/media/instagram/DPWRBXnk27h_0.jpg',
    drapeSteps: [
      'Pairs with a straight pant to keep the column line; palazzos soften it for daywear.',
      'Drape the dupatta once over the left shoulder so the border sits clear of the embroidery.',
    ],
    stylingTips: [
      'Ask Rasika how to care for your specific piece — how it is finished changes the answer.',
      'Skip a heavy necklace when the neckline is already embroidered.',
    ],
  },
  {
    id: 'modal-silk',
    title: 'Modal Silk',
    subtitle: 'Softer and more breathable than pure silk',
    region: 'Origin not stated',
    summary:
      'Modal silk has a matte-satin surface and drapes close to the body. It is more breathable than pure silk, which matters in Pune. Rasika works with it plain, printed, and in Bandhani.',
    heroImage: '/media/instagram/DNF9DSRNyWb_0.jpg',
    drapeSteps: [
      'Wear the long kurta with the palazzo hem just brushing the floor for a full column line.',
      'A wide V at the front lets a zari-bordered dupatta frame the yoke.',
    ],
    stylingTips: [
      'Ask Rasika how to care for your specific piece before the first wash.',
      'Keep jewellery minimal when the fabric already carries surface work.',
    ],
  },
  {
    id: 'bandhani',
    title: 'Bandhani',
    subtitle: 'Tie-dye worked in thousands of hand-tied points',
    region: 'Origin not stated',
    summary:
      'Bandhani is made by tying the cloth into tiny points before dyeing, so each dot is placed by hand. Rasika works it on modal silk, often finished with Gota Patti.',
    heroImage: '/media/instagram/DNC5WGTtSQf_0.jpg',
    drapeSteps: [
      'Let the dupatta fall in soft folds rather than pleating it sharply — the pattern reads better in movement.',
      'Keep the bottom plain so the tie-dye stays the focus.',
    ],
    stylingTips: [
      'Ask about washing before the first wear: tie-dye and the metallic Gota Patti want different handling.',
      'Oxidised silver sits well against the deeper Bandhani grounds.',
    ],
  },
  {
    id: 'chikankari',
    title: 'Chikankari',
    subtitle: 'Shadow-work embroidery done by hand',
    region: 'Origin not stated',
    summary:
      'A whitework tradition in which the motif is worked from the reverse so it shows as a soft shadow through the cloth. No two pieces are identical, and slight irregularity is the proof of handwork.',
    heroImage: '/media/instagram/DbhhSXnge2m_0.jpg',
    drapeSteps: [
      'Worn over a matched slip, the shadow work reads against a skin-tone lining as intended.',
      'Keep the bottom loose; Chikankari reads best when the fabric moves.',
    ],
    stylingTips: [
      'Ask Rasika about washing — a sheer ground and dense handwork are easy to spoil.',
      'Pairs with oxidised silver or pearls more readily than with gold.',
    ],
  },
  {
    id: 'madhubani',
    title: 'Madhubani',
    subtitle: 'Mithila painting applied by hand to cotton',
    region: 'Origin not stated',
    summary:
      'Madhubani is a painting tradition from Mithila, applied here directly to cotton dress material rather than printed. Rasika describes these pieces as breathable and made to be worn often.',
    heroImage: '/media/instagram/DJ1lB3TtuiJ_0.jpg',
    drapeSteps: [
      'These arrive as dress material — the fit is decided when it is stitched, so send measurements.',
      'A plain dupatta keeps the painted panel as the focus.',
    ],
    stylingTips: [
      'Hand-applied paint and cotton behave differently from a print — ask before washing.',
      'Terracotta and mustard sit well beside the traditional palette.',
    ],
  },
];
