/**
 * Real @label_by_rasika Instagram integration.
 * ---------------------------------------------------------------------------
 * RULE: this section shows @label_by_rasika's own media and nothing else.
 *
 * Nothing renders in the feed unless it is a genuine post by IG_OWNER, proven
 * by /api/instagram-post (Instagram's public oEmbed endpoint reports the real
 * author_name). No stock photography, no invented captions, no borrowed reels.
 *
 * WHAT WORKS (verified against instagram.com, Sept 2026):
 *  ✗ /api/v1/users/web_profile_info      → 401 require_login
 *  ✗ Server-side scrape of /p/<code>/    → login-wall shell
 *  ✓ Profile page w/ crawler UA          → real follower / post counts
 *  ✓ /api/v1/oembed/?url=<permalink>     → real author_name + caption + thumb
 *
 * The archive below is generated, not hand-listed: see scripts/catalogue/ and
 * `npm run catalogue`. Every post was checked against `owner.username` during
 * the harvest, so nothing published by another account can reach the page.
 */

import { GalleryItem, InstagramProfile } from '../types';
import galleryJson from './instagram.gallery.json';
import reelClips from './instagram.reels.json';

/** The only account whose media may appear on this site. */
export const IG_OWNER = 'label_by_rasika';

/**
 * Verified from the live profile page on 2026-09-09.
 * These are the FALLBACK values; /api/instagram-profile refreshes them live.
 * (The site previously claimed 185K followers / 1,420 posts, which was false.)
 */
export const IG_PROFILE: InstagramProfile = {
  username: IG_OWNER,
  fullName: 'Rasika Wankhede',
  biography:
    'Rasika Wankhede | Fashion Designer | Fashion Stylist\nLabel by Rasika — The Art of Timeless Luxury ✨\nReady to wear | Customised Womenswear',
  followers: 1274,
  following: 686,
  posts: 324,
  profileUrl: `https://www.instagram.com/${IG_OWNER}/`,
  verifiedAt: '2026-09-09',
};



/**
 * Canonical permalink for a shortcode — this is the "verify" link.
 * Always the /p/ form: Instagram resolves it for photos, carousels and reels
 * alike (and redirects reels to the reel view), so it can never 404 on a
 * mislabelled type.
 */
export function permalinkFor(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/`;
}


/**
 * Every image downloaded from @label_by_rasika, newest first.
 *
 * Generated from the account's full post feed: photo posts contribute each
 * photograph (carousels included), reels contribute their cover frame, and
 * reels additionally carry a locally transcribed narration. Posts published by
 * other accounts — customers and collaborators tagging the brand — are excluded.
 *
 * Regenerate with the harvest + transcribe scripts; see the README.
 */
export const IG_GALLERY: GalleryItem[] = galleryJson as GalleryItem[];

/**
 * Locally hosted preview clips, keyed by shortcode.
 *
 * 540p, video-only (a hover preview is muted, so the audio track is dead
 * weight), stream-copied to the first 10 seconds. Serving these instead of
 * Instagram's embed iframe means the cards render at whatever size the layout
 * wants and do not depend on Instagram being reachable.
 */
export const IG_REEL_CLIPS: Record<string, string> = reelClips as Record<string, string>;

/** Reels we hold a local clip for, newest first. */
export const IG_REELS_WITH_CLIP = IG_GALLERY.filter(
  (g) => g.isVideo && IG_REEL_CLIPS[g.code]
);
