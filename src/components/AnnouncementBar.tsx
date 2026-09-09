import React from 'react';

/**
 * Thin strip above the header. Every line here must be something Rasika has
 * actually published — it previously read "Complimentary shipping across India",
 * a promise that appears in none of her 436 captions and that the bag then
 * contradicted with a ₹20,000 free-shipping threshold.
 */
export const AnnouncementBar: React.FC = () => (
  <div className="bg-[var(--ink)] px-4 py-2 text-center text-[10px] uppercase tracking-[0.18em] text-[var(--bg)]/85">
    <span>Ready to wear &amp; made to measure</span>
    <span aria-hidden="true" className="mx-3 text-[var(--bg)]/55">·</span>
    <span className="hidden sm:inline">Pimple Gurav, Pune</span>
    <span aria-hidden="true" className="mx-3 hidden text-[var(--bg)]/55 sm:inline">·</span>
    <a
      href="https://wa.me/917821923346"
      target="_blank"
      rel="noopener noreferrer"
      className="underline-offset-4 transition-colors hover:text-[var(--accent-on-dark)] hover:underline"
    >
      WhatsApp +91 78219 23346
    </a>
  </div>
);
