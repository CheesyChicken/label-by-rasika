/**
 * GET /api/instagram-post?url=<instagram post or reel url>
 *
 * Resolves a single Instagram post and reports WHO PUBLISHED IT, so the
 * storefront can refuse to display anyone else's content.
 *
 * Instagram's public oEmbed endpoint still answers unauthenticated callers:
 *   https://www.instagram.com/api/v1/oembed/?url=<permalink>
 * Verified Sept 2026 — works with any user-agent, for both /p/ and /reel/
 * permalinks, and returns 404 "No Media Match" for a shortcode that does not
 * exist. It gives us author_name, the real caption and a thumbnail, which is
 * everything needed to prove a post belongs to @label_by_rasika.
 *
 * Response: { ok, shortcode, author, authorUrl, caption, thumbnailUrl, isOwner }
 *   ok:false + reason 'not_found'   → no such post
 *   ok:false + reason 'unverified'  → Instagram rate-limited us; caller must
 *                                     NOT assume ownership either way
 */

/** The only account whose media this storefront is allowed to publish. */
const OWNER = (process.env.IG_OWNER || 'label_by_rasika').toLowerCase();

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cache = new Map<string, { at: number; body: unknown }>();

/**
 * Pull the shortcode out of any Instagram permalink shape.
 * Everything downstream is rebuilt from this, so a caller can never steer our
 * outbound fetch at a host of their choosing.
 */
export function extractShortcode(input: string): string | null {
  const raw = String(input || '').trim();
  if (/^[A-Za-z0-9_-]{5,30}$/.test(raw)) return raw; // already a bare shortcode
  const m = raw.match(
    /(?:^|\/\/)(?:www\.)?instagram\.com\/(?:[A-Za-z0-9._]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]{5,30})/i
  );
  return m ? m[1] : null;
}

export default async function handler(req: any, res: any) {
  const shortcode = extractShortcode(req?.query?.url ?? req?.query?.shortcode ?? '');

  if (!shortcode) {
    res.status(400).json({
      ok: false,
      reason: 'bad_url',
      message:
        'Expected an Instagram post or reel link, e.g. https://www.instagram.com/reel/ABC123/',
    });
    return;
  }

  const hit = cache.get(shortcode);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json(hit.body);
    return;
  }

  // Rebuilt from the sanitised shortcode — never the caller's raw string.
  const permalink = `https://www.instagram.com/p/${shortcode}/`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);

    const r = await fetch(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(permalink)}`,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          accept: 'application/json',
        },
        signal: ctrl.signal,
      }
    );
    clearTimeout(timer);

    if (r.status === 404) {
      const body = { ok: false, reason: 'not_found', shortcode };
      cache.set(shortcode, { at: Date.now(), body });
      res.status(200).json(body);
      return;
    }
    if (!r.ok) throw new Error(`oembed responded ${r.status}`);

    const d: any = await r.json();
    const author = String(d.author_name || '').toLowerCase();

    const body = {
      ok: true,
      shortcode,
      author: d.author_name ?? null,
      authorUrl: d.author_url ?? null,
      caption: typeof d.title === 'string' ? d.title : '',
      thumbnailUrl: d.thumbnail_url ?? null,
      isOwner: author === OWNER,
      owner: OWNER,
    };

    cache.set(shortcode, { at: Date.now(), body });
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json(body);
  } catch (err) {
    // Do not guess. An unverified post must not be treated as owned.
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json({
      ok: false,
      reason: 'unverified',
      shortcode,
      message: err instanceof Error ? err.message : 'lookup failed',
    });
  }
}
