import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'dark',
  size = 'md' 
}) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex select-none items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Royal Crest Monogram Icon */}
      <div className={`relative hidden shrink-0 items-center justify-center rounded-full border sm:flex ${
        size === 'sm' ? 'w-9 h-9 text-xs' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-11 h-11 text-sm'
      } ${
        isLight 
          ? 'bg-[var(--ink-soft)] border-[var(--accent-on-dark)]/50 text-[var(--bg)] shadow-md'
          : 'bg-[var(--ink-soft)] border-[var(--line-strong)] text-[var(--bg)] shadow-sm'
      } transition-transform duration-300 hover:scale-105`}>
        {/* Subtle royal ornamental border ring */}
        <div className="absolute inset-[2px] rounded-full border border-[var(--muted)]/40 pointer-events-none" />
        {/* The monogram inherits the crest's text colour: on the dark footer
            it was --muted on --ink-soft, 2.11:1 — the worst contrast on the
            site — because this span hard-coded --muted for both variants. */}
        <span className="font-display font-bold tracking-widest">LBR</span>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex min-w-0 flex-col text-left">
        <span className={`truncate font-serif uppercase leading-tight tracking-[0.12em] sm:tracking-[0.2em] ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-[15px] sm:text-lg'
        } ${isLight ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}`}>
          LABEL BY RASIKA
        </span>
        <span className={`hidden truncate text-[9px] uppercase leading-tight tracking-[0.22em] sm:block ${
          isLight ? 'text-[var(--bg-soft)]/80' : 'text-[var(--muted)]'
        }`}>
          Pimple Gurav, Pune
        </span>
      </div>
    </div>
  );
};
