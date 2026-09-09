import { GalleryItem } from '../types';

/**
 * A usable accessible name for a downloaded Instagram image.
 *
 * The previous version passed `caption.slice(0, 110)` straight into `alt`,
 * which meant a screen-reader user heard 436 fragments of marketing copy —
 * decorative emoji, ". . " separators, the shop address, the repeated
 * "We are waiting to celebrate FASHION with YOU" line — each cut off mid-word,
 * with two frames of the same carousel getting byte-identical text.
 *
 * We can't describe a photograph we haven't looked at, so this does the honest
 * thing instead: says what kind of post it is, and quotes the one part of the
 * caption that is actually about the garment — the opening clause, before the
 * boilerplate starts.
 */

/** Everything from these markers onward is shop boilerplate, not description. */
const BOILERPLATE = [
  'We are waiting to celebrate',
  'Do Visit our store',
  'DM for',
  'DM to order',
  'For orders',
  '#',
];

const strip = (caption: string): string => {
  let text = caption;
  for (const marker of BOILERPLATE) {
    const at = text.indexOf(marker);
    if (at >= 0) text = text.slice(0, at);
  }
  return text
    // Drop emoji and the pictographic separators the captions lean on.
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2764}]/gu, ' ')
    .replace(/\s*\.\s*\.\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:–—-]+$/, '');
};

export const describeMedia = (item: GalleryItem): string => {
  // Frames of one carousel share a caption, so the position is the only thing
  // that distinguishes them for a reader.
  const position = item.i > 0 || item.isSidecar ? ` ${item.i + 1} of a series` : '';
  const kind = `${item.isVideo ? 'Reel' : 'Photo'}${position}`;
  const gist = strip(item.caption ?? '');
  const head = gist.length > 90 ? `${gist.slice(0, 90).replace(/\s+\S*$/, '')}…` : gist;
  return head ? `${kind} by Label by Rasika: ${head}` : `${kind} by Label by Rasika`;
};
