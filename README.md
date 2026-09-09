# Label by Rasika — storefront

Ready-to-wear and customised womenswear for **[@label_by_rasika](https://www.instagram.com/label_by_rasika/)**
(Rasika Wankhede) — Chandrarang Park, Pimple Gurav, Pune.

React 19 · React Router 7 · Vite 6 · Tailwind 4 · TypeScript — deployed on Vercel
with three serverless functions.

---

## Run locally

```bash
npm install
npm run dev
```

The storefront works with no configuration. The two API routes need the Vercel
runtime, so use `vercel dev` if you want to exercise them locally:

```bash
npx vercel dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run typecheck` | `tsc --noEmit` — currently clean |
| `npm run catalogue` | Regenerate products, gallery and reels from `data/harvest/` |

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, **Add New → Project** and import it. `vercel.json` already sets the
   framework, build command, output directory, SPA rewrites and the function runtime,
   so accept the detected settings.
3. Add environment variables under **Settings → Environment Variables**:

   | Name | Required | Purpose |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | optional | Powers the AI Stylist. Without it the stylist falls back to a rule engine and still works. |
   | `ANTHROPIC_MODEL` | optional | Defaults to `claude-opus-5`. |

4. Deploy.

**The Anthropic key is server-only.** It is read inside `api/stylist.ts` and never
reaches the browser bundle. Do not add a `VITE_`-prefixed copy — anything prefixed
`VITE_` is inlined into public JavaScript.

---

## Pages

Real routes, so every page is shareable, linkable and indexable. `vercel.json`
rewrites everything except `/api/*` to `index.html`, so deep links work in
production.

| Route | Page |
| --- | --- |
| `/` | Home — hero, collections, bestsellers, made-to-measure, new in |
| `/collections` | Full catalogue with filters and sort |
| `/collections/:category` | One category (`russian-silk`, `anarkali`, …) |
| `/product/:id` | Product detail — gallery, size, fit, add-ons, related |
| `/instagram` | The verified @label_by_rasika feed |
| anything else | 404 |

Shared state (bag, wishlist, currency, filters, Instagram feed, drawers) lives in
`src/store/StoreContext.tsx`, so pages stay thin and nothing is prop-drilled
through the tree.

## Design system

The reference is karagiri.com: white ground, near-black type, and colour
supplied **only by the garment photography**. Tokens live in `src/index.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--bg` / `--bg-soft` | `#ffffff` / `#f6f4f0` | page, alternating bands |
| `--ink` | `#14100d` | all type, primary buttons — 18.9:1 on white |
| `--muted` | `#6b625a` | secondary text — 5.97:1 on white |
| `--line` / `--line-strong` | `#e5e1db` / `#cfc9c1` | hairlines, field borders |
| `--accent` | `#3a4c68` | sale badges, saved heart, primary hover — 8.7:1 |
| `--success` | `#2f5d4b` | verified / in-stock marks |

Two decisions worth recording:

**The accent is cool on purpose.** Indian ethnic photography is overwhelmingly
warm — warm skin, gold zari, dyes from red through mustard to emerald. A warm
accent (the old maroon, or a terracotta) sits inside that same arc and argues
with the merchandise. A low-chroma slate sits outside the garment gamut, so it
reads as chrome and never competes.

**The greys are contrast-checked.** The mid-greys this replaced failed WCAG AA
badly (3.28:1, 4.48:1, 2.75:1). Nothing carrying text sits below 4.5:1 now.

Hover language, applied consistently: product images cross-fade to the second
photograph over 900ms with a 4% drift, a quick-add bar rises from the base of
the card, links draw a 1px underline from the left over 400ms, and primary
buttons shift from ink to accent. All of it is disabled under
`prefers-reduced-motion`.

## Instagram: only Label by Rasika's own content

The feed shows @label_by_rasika's media and nothing else — no stock photography,
no invented captions, no borrowed reels. That rule is enforced in code, not just
intended.

Instagram no longer lets a logged-out server read a profile's posts. Verified
against instagram.com in September 2026:

| Approach | Result |
| --- | --- |
| `GET /api/v1/users/web_profile_info` | **401** `{"require_login": true}` |
| Scraping `/<user>/` or `/p/<code>/` server-side | Login-wall shell, no media |
| Instagram Basic Display API | Shut down 2024-12-04 |
| Profile page with a crawler user-agent | ✅ real follower / following / post counts |
| **`/api/v1/oembed/?url=…`** | ✅ **real `author_name`, caption and thumbnail** |
| **Per-post embed iframes** | ✅ **the real photo and video** |

Three things follow from that:

**1. Live profile stats** — `api/instagram-profile.ts` parses the public profile
page. If Instagram rate-limits it, the response is `ok: false` and the UI keeps
the last hand-verified figures (1,274 followers / 686 following / 324 posts,
checked 2026-09-09). The header previously claimed 185K followers and 1,420
posts, which was untrue.

**2. Ownership is proved, not assumed** — every one of the 324 harvested posts
was checked against `owner.username` before it was allowed into the archive;
303 are published by `label_by_rasika` and the other 21 were dropped.
`api/instagram-post.ts` resolves a single post through Instagram's public
oEmbed endpoint and reports who published it — it is kept as the verification
path for adding new posts by hand. Set `IG_OWNER` to change the account.

**3. Real media, served by us** — the photos and reel clips are downloaded from
Rasika's own posts and served from `public/media/`, and every card links back
to the original post so it can be checked. There are no Instagram embed
iframes; see below for why.

### The full archive, and the reel transcripts

The account's entire post feed is harvested — **324 posts, matching the profile
count exactly**. Of those, **303 are published by `label_by_rasika`**; the
remaining 21 are customer and collaborator posts by other accounts and are
excluded everywhere.

| | count |
| --- | --- |
| Photo posts (hers) | 87 → 226 photographs, carousels included |
| Reels (hers) | 216 → 216 cover frames |
| Total images | ~442, downloaded to `public/media/instagram/` |

Images are re-encoded to max 1600px at quality 82 on the way in. The originals
average ~2MB and the raw set ran to roughly a gigabyte, which will not deploy.

**A trap worth knowing:** in the feed JSON a reel's `src`/`srcs` is the *mp4*,
not an image. Only `thumb` is the cover frame. Downloading `src` for reels
silently produces MP4 files named `.jpg`.

#### Reel transcripts

The reels are not music-over-product clips — Rasika narrates each one, and that
narration is the richest description of the garment the brand has:

> "Looking for something elegant, classy and effortlessly beautiful? Introducing
> a lilac Chikankari A-line set… whether it's a family function, festive
> celebration, office event or a casual day out, this outfit fits every occasion."

Each reel is downloaded, transcribed locally with `faster-whisper` (small,
int8, CPU) and the video is then deleted — only the words and the cover frame
are kept. The model reliably mangles the brand's proper nouns, so a fixed
substitution pass corrects them: *chicken curry* → **Chikankari**, *LPR* →
**LBR**, *Play Guru* → **Pimple Gurav**, *Vanke Dejwellers* → **Wankhede
Jewellers**. Roughly 60% of reels carry speech; the rest are silent or
music-only and store an empty transcript.

Transcripts surface in the gallery lightbox under "What Rasika says in this
reel", labelled as machine-transcribed.

### Instagram page: gallery controls

`/instagram` has two modes:

- **Gallery** — dense square tiles of the downloaded archive, with a
  filter (All / Photos / Reels), a column control (**2, 3, 4 or 5**), and a page
  size including **20 (4 × 5)** and *All on one page*. Clicking a tile opens a
  lightbox with the full image, the real caption, engagement, and the reel
  transcript; arrow keys move between images.
- **Posts** — reel cards that play a locally hosted clip on hover. Clicking opens
  the real post on Instagram.

**There are no Instagram embed iframes anywhere.** They were removed: the embed
stretches to whatever width it is given, wraps its own header over the media
below ~326px, cannot be styled, and makes every card depend on Instagram being
reachable. Cards now play our own MP4.

Preview clips live in `public/media/reels/` and are built by the same pipeline:

- the **540p video-only** rendition — a hover preview is muted by definition, so
  the audio track is pure weight and is never downloaded
- **stream-copied to the first 10 seconds** with PyAV (no re-encode, instant,
  lossless), which takes a clip from ~4.7MB to ~1.3MB
- poster is the real cover frame, so a card is never blank while buffering

30 clips currently ship, about 36MB. `muted` is set imperatively on the element
rather than through the React prop, because the prop does not reliably reach the
DOM and an unmuted video is refused autoplay outright.

Total media footprint: ~86MB images + ~36MB clips.

**Removed with the embeds:** `InstagramReelsSection`, `InstagramEmbed` and the
in-app `InstagramStudio`. The Studio let you paste a post URL and verified it
belonged to @label_by_rasika before adding it to the feed — but with the feed now
driven by the downloaded archive, anything added there had no local media and
rendered nowhere, so the button would have been lying. The ownership rule it
enforced still holds, and now holds earlier: the harvest filters on
`owner.username` before a single byte is downloaded. `api/instagram-post.ts`
remains available for verifying a single post on demand.

### Product photography

Every product image is now a real photograph from @label_by_rasika, downloaded
into `public/media/instagram/` and served locally (Instagram CDN URLs expire, so
hotlinking them would break).

How they were chosen: the account's full post feed was harvested and split by
`isVideo` — 168 posts, of which **37 are photo posts and 131 are reels**. Of
those 37, **27 are published by `label_by_rasika` itself**; the other 10 are
customer and collaborator posts by different accounts and were excluded. That
gave 65 photographs, each matched to a product by garment colour against the
product's stated `colorName`.

**Caveat worth acting on:** the product names, prices and descriptions are still
the original placeholder text. The photographs are real, so a piece captioned
"mint green statement piece" now genuinely shows a mint green outfit — but the
names and prices attached to them are invented and should be replaced with the
real catalogue. Several photographs are also client photos the brand reposted.

### Refreshing the catalogue

The data files are generated from a committed harvest, so a rebuild needs no
scraping and no Instagram token:

```bash
npm run catalogue
```

That runs the four scripts in `scripts/catalogue/` in order. Read
`scripts/catalogue/README.md` first — step 2 reapplies the fabric corrections
that step 1 wipes, and is the only place a real, per-garment price can be
entered. Every piece is price-on-request until Rasika supplies figures; the
site invents none.

There is no Graph API sync any more. `scripts/sync-instagram.mjs` was removed:
it wrote `src/data/instagram.generated.json`, which nothing imported, and named
downloads `<shortcode>.jpg` while every reference in the app uses the
carousel-indexed `<shortcode>_0.jpg`, so running it produced a file nobody read
and images nothing linked to.

## Project layout

```
api/
  instagram-profile.ts   live profile counters (best-effort, never fails the page)
  instagram-post.ts      oEmbed lookup — proves a post belongs to @label_by_rasika
  stylist.ts             server-side Claude call — keeps the API key off the client
api/auth/
  request-otp.ts         issues an HMAC-signed challenge; the code never reaches the browser
  verify-otp.ts          verifies the challenge, issues a 30-day session cookie
  sign-out.ts            clears it
scripts/catalogue/       the four generators; see its own README
data/harvest/            committed inputs: post manifest + reel transcripts
src/
  main.tsx               RouterProvider + StoreProvider + error boundary
  routes.tsx             route table
  layouts/RootLayout.tsx header, drawers, modals, footer, <Outlet/>
  store/StoreContext.tsx bag, wishlist, currency, filters, panels
  pages/                 Home, Collection, Product, Instagram, Account, 404
  data/
    products.ts          catalogue, FAQs, style-guide articles
    customerLooks.ts     real client photos Rasika published
    homeCuration.ts      picks home-page photos so none repeats across sections
    instagram.ts         profile facts, verified posts, shortcode helpers
    taxonomy.ts          single source of truth for categories & occasions
  hooks/useInstagram.ts  live profile counters
  hooks/useDialog.ts     Escape, scroll lock, focus trap and focus restore
  components/            UI
  index.css              design tokens
```

`taxonomy.ts` derives the browsing chrome from the catalogue, and
`ACTIVE_CATEGORIES` filters to categories that actually hold stock — so a nav tab
or filter can never lead to an empty grid.

---

## Contact

Chandrarang Park, Sudarshan Nagar, Pimple Gurav, Pune 411061 ·
WhatsApp [+91 78219 23346](https://wa.me/917821923346) — the number Rasika
publishes in her own captions.
