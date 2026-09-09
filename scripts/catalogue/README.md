# Catalogue generation

The storefront's data files are generated, not hand-written. Run them in this
order — `npm run catalogue` does exactly that:

| Step | Script | Writes |
|---|---|---|
| 1 | `build_products.py` | `src/data/products.ts` |
| 2 | `finalise_products.py` | `src/data/products.ts` (in place) |
| 3 | `build_gallery.py` | `src/data/instagram.gallery.json` |
| 4 | `build_reels.py` | `src/data/instagram.reels.json` |

**Step 2 is not optional.** `build_products.py` regenerates `products.ts` from
scratch, which wipes the fabric corrections. `finalise_products.py` reapplies
them, so it must run after every rebuild. It is also the ONLY place a price may
enter the catalogue: `REAL_PRICES = {shortcode: rupees}`, per garment, supplied
by Rasika. It is empty. Nothing infers a price from category, likes or anything
else — an earlier version did, on the strength of a "₹3,999 hint" that turned
out to be a mis-transcribed, expired anniversary basket offer.

## Inputs

All four live in `data/harvest/` and are committed, so the catalogue is
reproducible without re-scraping. (Two of them used to be read from `/tmp`,
which made the pipeline work on exactly one machine.)

- `instagram.manifest.json` — every post on `@label_by_rasika`, with the local
  path of each downloaded image, the caption, the like count and the date.
- `carousels.json` — the manifest regrouped by post: one entry per shortcode
  holding all of that carousel's frames.
- `keep_codes.json` — the shortcodes admitted to the product catalogue. A post
  is dropped from here when it is not a garment: a Kundan necklace hashtagged
  `#illustrations` was once a purchasable "kurta set" with a kurta-length field.
- `reel.transcripts.json` — locally transcribed narration for the reels
  (faster-whisper, small, int8). Only transcripts that pass BOTH filters reach
  the site: mis-detected scripts and film-song lyrics are rejected, and so is
  anything time-limited or commercial — offers, discounts, "last day", figures.
  Nine of the first twenty-nine shipped transcripts republished her own expired
  promotions ("flat 20% off") under "What Rasika says in this reel".

## Grouping rule

One Instagram carousel is one garment, photographed from several angles, so a
product's gallery can never mix different dresses. Grouping is by **perceptual
image hash**, not by caption: five different outfits share the caption "Where
couture whispers elegance", and hashing showed 18 of 19 same-caption pairs were
different garments. Merging on captions destroyed ~17 products before this was
caught.

## What is never invented

Fabric, colour, price and craft come from Rasika's own captions or they are not
stated at all. `fabric: 'Not stated'` and `priceOnRequest: true` are the
correct outputs when she has not said — they are not gaps to fill in.

Colour has one extra safeguard. The caption is the only source trusted to
ASSERT a colour, but a caption can be wrong for the frame we show ("classic in
regal blue" over a pink garment). So the photograph is allowed to VETO: if the
centre of the frame is dominated by a different colour family, the colour is
dropped to unstated rather than labelled wrongly. Colour and craft are also read
only from the part of the caption about the garment — "Earrings & bracelet-
@crafting_moves" credits someone else's work, and matches are whole-word, so
"Hand-Embroide**red**" no longer yields a red dress.
