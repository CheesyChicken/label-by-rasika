import React from 'react';
import { Link } from 'react-router-dom';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

/** Centred, letter-spaced section heading with an optional quiet link. */
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title, subtitle, href, linkLabel,
}) => (
  <div className="relative text-center">
    <h2 className="font-serif text-[clamp(1.35rem,2.4vw,2rem)] font-light tracking-[0.02em]">
      {title}
    </h2>
    {subtitle && (
      <p className="mx-auto mt-2 max-w-lg text-xs font-light text-[var(--muted)]">{subtitle}</p>
    )}
    {href && linkLabel && (
      <Link
        to={href}
        className="link-underline mt-3 inline-block text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:absolute sm:right-0 sm:top-1.5 sm:mt-0"
      >
        {linkLabel}
      </Link>
    )}
  </div>
);
