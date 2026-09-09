import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

/** Consistent page masthead: eyebrow, serif title, one line of context. */
export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow, title, subtitle, align = 'center',
}) => (
  <header
    className={`mx-auto max-w-[1400px] px-5 pb-10 pt-14 sm:px-8 sm:pt-20 ${
      align === 'center' ? 'text-center' : ''
    }`}
  >
    {eyebrow && (
      <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">{eyebrow}</p>
    )}
    <h1 className="mt-3 font-serif text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.1] text-[var(--ink)]">
      {title}
    </h1>
    {subtitle && (
      <p
        className={`mt-4 text-sm font-light leading-relaxed text-[var(--muted)] ${
          align === 'center' ? 'mx-auto max-w-xl' : 'max-w-xl'
        }`}
      >
        {subtitle}
      </p>
    )}
  </header>
);
