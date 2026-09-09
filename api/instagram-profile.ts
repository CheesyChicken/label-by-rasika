/**
 * GET /api/instagram-profile?username=label_by_rasika
 *
 * Returns live follower / following / post counts for a public Instagram
 * profile, plus the bio and avatar.
 *
 * WHY IT IS SHAPED THIS WAY
 * Instagram's JSON endpoint (/api/v1/users/web_profile_info) now answers
 * logged-out callers with HTTP 401 {"require_login": true}. What still works is
 * the server-rendered profile page requested with a crawler user-agent: Meta
 * keeps serving og: tags and a small embedded profile blob so search engines
 * can index profiles. We read only those public counters — no media scraping,
 * no credentials, no session cookies.
 *
 * This is best-effort by design. Instagram may rate-limit a datacentre IP at
 * any time, so every failure path returns 200 with `ok: false`, letting the
 * client keep the last verified figures instead of rendering an error.
 */

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, { at: number; body: unknown }>();

const CRAWLER_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function decodeEscapes(raw: string): string {
  try {
    return JSON.parse(`"${raw.replace(/"/g, '\\"')}"`);
  } catch {
    return raw;
  }
}

/** "1,274 Followers, 686 Following, 324 Posts - ..." → numbers. */
function parseOgDescription(html: string) {
  const m = html.match(/property="og:description" content="([^"]+)"/);
  if (!m) return null;
  const text = m[1].replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));
  const num = (label: string) => {
    const hit = text.match(new RegExp(`([\\d.,KMkm]+)\\s+${label}`, 'i'));
    if (!hit) return null;
    const v = hit[1].replace(/,/g, '');
    if (/k$/i.test(v)) return Math.round(parseFloat(v) * 1_000);
    if (/m$/i.test(v)) return Math.round(parseFloat(v) * 1_000_000);
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  return {
    followers: num('Followers'),
    following: num('Following'),
    posts: num('Posts'),
  };
}

export default async function handler(req: any, res: any) {
  const username =
    (typeof req?.query?.username === 'string' && req.query.username) ||
    'label_by_rasika';

  if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) {
    res.status(400).json({ ok: false, error: 'invalid username' });
    return;
  }

  const hit = cache.get(username);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    res.status(200).json(hit.body);
    return;
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    const r = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'user-agent': CRAWLER_UA,
        'accept-language': 'en-US,en;q=0.9',
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!r.ok) throw new Error(`instagram responded ${r.status}`);
    const html = await r.text();

    const counts = parseOgDescription(html);
    const fullName = html.match(/"full_name":"(.*?)"/)?.[1];
    const biography = html.match(/"biography":"(.*?)"/)?.[1];
    const avatar =
      html.match(/"profile_pic_url_hd":"(.*?)"/)?.[1] ||
      html.match(/"profile_pic_url":"(.*?)"/)?.[1];

    // If Instagram served a login wall there will be no counters at all.
    if (!counts || counts.followers === null) {
      throw new Error('profile counters not present (login wall)');
    }

    const body = {
      ok: true,
      username,
      fullName: fullName ? decodeEscapes(fullName) : undefined,
      biography: biography ? decodeEscapes(biography) : undefined,
      profilePicUrl: avatar ? decodeEscapes(avatar).replace(/\\u0026/g, '&') : undefined,
      followers: counts.followers,
      following: counts.following,
      posts: counts.posts,
      fetchedAt: new Date().toISOString(),
    };

    cache.set(username, { at: Date.now(), body });
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    res.status(200).json(body);
  } catch (err) {
    // Never fail the page — the client falls back to the last verified numbers.
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({
      ok: false,
      username,
      error: err instanceof Error ? err.message : 'unknown error',
    });
  }
}
