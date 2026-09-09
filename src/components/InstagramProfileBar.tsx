import React from 'react';
import { ExternalLink, Instagram } from 'lucide-react';
import { InstagramProfile } from '../types';
import { SmartImage } from './SmartImage';

const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 10_000 ? `${Math.round(n / 1000)}K`
  : n.toLocaleString('en-IN');

/** Compact live profile strip: avatar, handle, real counts, bio. */
export const InstagramProfileBar: React.FC<{ profile: InstagramProfile }> = ({ profile }) => (
  <div className="mb-10 flex flex-col items-center gap-5 border-b border-[var(--line)] pb-8 text-center sm:flex-row sm:items-center sm:gap-7 sm:text-left">
    <a
      href={profile.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative shrink-0"
      aria-label={`Open @${profile.username} on Instagram`}
    >
      <span className="block h-[76px] w-[76px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px] transition-transform duration-300 group-hover:scale-[1.03]">
        <span className="block h-full w-full overflow-hidden rounded-full border-2 border-[var(--bg)] bg-[var(--bg-soft)]">
          {profile.profilePicUrl ? (
            <SmartImage
              src={profile.profilePicUrl}
              alt={profile.fullName}
              fallbackLabel={profile.fullName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[var(--ink-soft)] font-serif text-sm tracking-[0.15em] text-[var(--bg)]">
              LBR
            </span>
          )}
        </span>
      </span>
    </a>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="font-serif text-lg">{profile.username}</span>
        {profile.isLive && (
          <span className="inline-flex items-center gap-1 border border-[var(--line)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
            <span className="h-1 w-1 rounded-full bg-[var(--success)]" /> Live
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-6 text-[13px] sm:justify-start">
        {[
          [compact(profile.posts), 'posts'],
          [compact(profile.followers), 'followers'],
          [compact(profile.following), 'following'],
        ].map(([v, l]) => (
          <span key={l} className="flex items-baseline gap-1.5">
            <strong className="font-serif font-normal">{v}</strong>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{l}</span>
          </span>
        ))}
      </div>
      <p className="mt-2.5 whitespace-pre-line text-[12px] font-light leading-relaxed text-[var(--muted)]">
        {profile.biography}
      </p>
    </div>

    <a
      href={profile.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-2 bg-[var(--ink)] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--bg)] transition-colors hover:bg-[var(--accent)]"
    >
      <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} />
      Follow
      <ExternalLink className="h-3 w-3 opacity-80" />
    </a>
  </div>
);
