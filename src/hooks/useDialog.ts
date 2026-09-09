import { RefObject, useEffect, useRef } from 'react';

/** Stack of currently-open dialogs, innermost last. */
const OPEN_DIALOGS: object[] = [];
/** body.style.overflow as it was before the first dialog opened. */
let savedOverflow = '';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Standard modal behaviour: Escape closes, the page behind stops scrolling,
 * Tab is contained inside the panel, and focus returns to whatever opened it.
 *
 * Before this, behaviour differed per overlay — the auth modal focused its
 * first field but let Tab walk out into the navbar and footer behind the
 * scrim, the cart/wishlist/contact/style-guide/stylist modals ignored Escape
 * entirely, and none of them restored focus on close.
 */
export function useDialog(
  isOpen: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>
): void {
  /**
   * `onClose` is read through a ref, NOT taken as a dependency.
   *
   * Call sites pass inline arrows, so its identity changes on every render of
   * the layout. With it in the dep array the effect tore down and re-ran on
   * every unrelated store change — and the teardown calls `restoreTo.focus()`.
   * The visible symptom was that pressing "+" in the bag threw focus onto the
   * close button, so a keyboard user could not press it twice.
   */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    const token = {};
    OPEN_DIALOGS.push(token);
    // Ref-counted so stacked dialogs cannot restore each other's snapshot.
    // Previously each dialog saved body.overflow independently: open two, and
    // the second snapshotted "hidden" and restored "hidden" on close.
    if (OPEN_DIALOGS.length === 1) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    // Move focus into the panel. Without this, focus stays on the trigger
    // behind the scrim: a screen reader is never told the dialog opened, and
    // Tab starts from the page rather than from the dialog.
    const enter = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }, 40);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only the topmost dialog closes: this listener is on `window`, so
        // without the check one Escape collapsed every open dialog at once and
        // their overflow restores raced, leaving the page unscrollable.
        if (OPEN_DIALOGS[OPEN_DIALOGS.length - 1] === token) onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(enter);
      window.removeEventListener('keydown', onKey);
      const at = OPEN_DIALOGS.indexOf(token);
      if (at >= 0) OPEN_DIALOGS.splice(at, 1);
      if (OPEN_DIALOGS.length === 0) document.body.style.overflow = savedOverflow;
      restoreTo?.focus?.();
    };
  }, [isOpen, panelRef]);
}
