import { useEffect, useState } from 'react';
import { InstagramProfile } from '../types';
import { IG_PROFILE } from '../data/instagram';

/**
 * Live @label_by_rasika profile stats.
 *
 * Calls the /api/instagram-profile serverless function. If it is unavailable
 * (running `vite dev` without `vercel dev`, or Instagram rate-limiting the
 * datacentre IP) we keep the figures that were verified by hand — so the
 * header always shows real numbers, never the fabricated 185K it used to.
 */
export function useInstagramProfile(): {
  profile: InstagramProfile;
  isLoading: boolean;
} {
  const [profile, setProfile] = useState<InstagramProfile>(IG_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);

    fetch(`/api/instagram-profile?username=${IG_PROFILE.username}`, {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.ok) return;
        setProfile((prev) => ({
          ...prev,
          fullName: d.fullName || prev.fullName,
          biography: d.biography || prev.biography,
          profilePicUrl: d.profilePicUrl || prev.profilePicUrl,
          followers: typeof d.followers === 'number' ? d.followers : prev.followers,
          following: typeof d.following === 'number' ? d.following : prev.following,
          posts: typeof d.posts === 'number' ? d.posts : prev.posts,
          verifiedAt: (d.fetchedAt || '').slice(0, 10) || prev.verifiedAt,
          isLive: true,
        }));
      })
      .catch(() => {
        /* offline / no serverless runtime — keep the verified fallback */
      })
      .finally(() => {
        clearTimeout(timer);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  return { profile, isLoading };
}
