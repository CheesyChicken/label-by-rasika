import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { SHOP_BY_GROUPS } from '../data/taxonomy';

/**
 * "Shop by" mega-menu — silhouette, fabric, craft and colour.
 *
 * Every column is derived from the catalogue (see SHOP_BY_GROUPS), so a value
 * is only offered when a piece actually carries it and each link lands on a
 * populated grid. Opens on hover on pointer devices and on click/keyboard
 * everywhere, so it is not hover-only.
 */
export const ShopByMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  /** Close and hand focus back to the trigger, so keyboard users don't land on <body>. */
  const closeToTrigger = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Anchor the fixed panel under the header and cap it to what is left of the
   * viewport.
   *
   * The panel had no `top`, no max-height and no scroll, so it settled at
   * whatever y its static position happened to be and never moved. At 375×812
   * that left it 930px tall with the entire COLOUR group — 7 of its 24 links —
   * permanently below the fold and unreachable.
   *
   * Note it is NOT positioned against the viewport despite `position: fixed`:
   * the header carries `backdrop-blur`, and a backdrop-filter makes that
   * element the containing block for fixed descendants. So `top` is measured
   * from the header's own box, while the height cap is measured against the
   * viewport. Both are read at open time because the header shrinks when the
   * announcement bar scrolls away.
   */
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = panel.current;
      const header = wrap.current?.closest('header');
      if (!el || !header) return;
      const bottom = header.getBoundingClientRect().bottom;
      el.style.top = `${header.clientHeight}px`;
      el.style.maxHeight = `${Math.max(160, window.innerHeight - bottom)}px`;
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !wrap.current) return;
      if (wrap.current.contains(document.activeElement)) closeToTrigger();
      else setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, []);

  const hold = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // A short grace period stops the panel snapping shut while the pointer
  // crosses the gap between the trigger and the panel.
  const release = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  if (SHOP_BY_GROUPS.length === 0) return null;

  return (
    <div
      ref={wrap}
      className="relative"
      // Hover-open is for a real mouse only. Touch browsers synthesise a
      // mouseenter right before the tap's click, so the menu opened on the
      // synthetic hover and the click's toggle instantly closed it again —
      // the first tap on a phone did nothing.
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') hold(); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') release(); }}
    >
      <button
        ref={trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`link-underline inline-flex shrink-0 items-center gap-1 whitespace-nowrap py-3.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
          open ? 'text-[var(--ink)] is-active' : 'text-[var(--muted)] hover:text-[var(--ink)]'
        }`}
      >
        Shop by
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          ref={panel}
          className="fixed inset-x-0 z-40 overflow-y-auto overscroll-contain border-y border-[var(--line)] bg-[var(--bg)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)]"
          role="menu"
        >
          <div className="mx-auto grid max-w-[1400px] gap-x-10 gap-y-8 px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-2 lg:grid-cols-4">
            {SHOP_BY_GROUPS.map((group) => (
              <div key={group.key}>
                <h3 className="border-b border-[var(--line)] pb-2.5 text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]">
                  {group.title}
                </h3>
                <ul className="mt-3.5 space-y-2">
                  {group.facets.map((f) => (
                    <li key={f.value}>
                      <Link
                        to={f.href}
                        onClick={() => setOpen(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setTimeout(() => trigger.current?.focus(), 0); }}
                        className="group flex items-baseline justify-between gap-3 text-[12px] font-light text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
                        role="menuitem"
                      >
                        <span className="link-underline">{f.label}</span>
                        <span className="text-[10px] tabular-nums text-[var(--muted)]">
                          {f.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
