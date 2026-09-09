import React, { useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { X, Trash2, Plus, Minus, ShoppingBag, Scissors, Gift, MessageCircle } from 'lucide-react';
import { CartItem, CartAddon, CurrencyCode } from '../types';
import { displayPrice } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: CurrencyCode;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemoveItem: (cartId: string) => void;
  onToggleAddon: (cartId: string, addon: CartAddon) => void;
  onBrowse: () => void;
}

const FIT_LABEL: Record<string, string> = {
  'ready-to-wear': 'Ready to wear',
  'standard-stitched': 'Stitched to size',
  'bespoke-tailored': 'Bespoke, to measurement',
};

/**
 * The bag is an ENQUIRY list, not a checkout.
 *
 * 35 of 43 pieces are `priceOnRequest` and the other 8 carry an indicative
 * figure, so there is no honest number to total. Earlier versions summed
 * `product.price` raw — which rendered "Total Amount ₹0" and sent Rasika a
 * WhatsApp order quoting ₹0. Nothing here invents a total, a discount or a
 * delivery promise; the pieces go over to WhatsApp and she quotes them.
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onToggleAddon,
  onBrowse,
}) => {
  const [giftNoteOpen, setGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(isOpen, onClose, panelRef);

  if (!isOpen) return null;

  const handleWhatsAppEnquiry = () => {
    if (cartItems.length === 0) return;
    const lines = cartItems
      .map((it) => {
        const extras = [
          FIT_LABEL[it.sizeInfo.type] ?? it.sizeInfo.type,
          it.sizeInfo.size ? `size ${it.sizeInfo.size}` : '',
          it.addTailoring ? 'fit to my measurements' : '',
          it.addDupatta ? 'matching dupatta' : '',
        ]
          .filter(Boolean)
          .join(', ');
        return `• ${it.product.name} × ${it.quantity} — ${extras}`;
      })
      .join('\n');
    const note = giftNote.trim() ? `\n\nGift note: ${giftNote.trim()}` : '';
    const msg =
      `Hello Label by Rasika! I'd like a quote for these pieces:\n\n${lines}${note}\n\n` +
      `Could you confirm the price and availability?`;
    window.open(`https://wa.me/917821923346?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Enquiry bag"
        className="relative z-10 flex h-full w-full max-w-md animate-in slide-in-from-right flex-col border-l border-[var(--line)] bg-[var(--bg)] shadow-2xl duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-white p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--ink)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              Your bag ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            aria-label="Close bag"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* What this bag is */}
        <p className="border-b border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2.5 text-[11px] leading-relaxed text-[var(--ink)]">
          This is an enquiry list, not a checkout. Send it over and Rasika confirms the price,
          fabric availability and timeline on WhatsApp.
        </p>

        {/* Items */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[var(--ink)]">
                <ShoppingBag className="h-8 w-8 opacity-60" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Your bag is empty</h3>
              <p className="mb-6 mt-1 max-w-[240px] text-xs text-[var(--muted)]">
                Browse the pieces Rasika has published and add anything you'd like a quote on.
              </p>
              <button
                onClick={onBrowse}
                className="rounded bg-[var(--ink)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[var(--ink-soft)]"
              >
                Browse the collection
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartId}
                className="flex gap-3 rounded-lg border border-[var(--line)] bg-white p-3 shadow-xs"
              >
                <SmartImage
                  src={item.product.primaryImage}
                  alt={item.product.name}
                  fallbackLabel={item.product.name}
                  fallbackHex={item.product.colorHex}
                  className="h-24 w-20 shrink-0 rounded bg-[var(--bg-soft)] object-cover"
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 font-serif text-sm font-bold text-[var(--ink)]">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="-m-2 p-2 text-[var(--muted)] transition-colors hover:text-red-600"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {item.product.fabric !== 'Not stated' && (
                      <p className="mt-0.5 text-[11px] font-medium text-[var(--ink)]">
                        {item.product.fabric}
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                      <span className="rounded bg-[var(--bg-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink)]">
                        {FIT_LABEL[item.sizeInfo.type] ?? item.sizeInfo.type}
                        {item.sizeInfo.size ? ` · ${item.sizeInfo.size}` : ''}
                      </span>
                    </div>

                    {/* Requests — no invented service charges. Rasika quotes these. */}
                    <div className="mt-2 flex flex-col gap-1 border-t border-[var(--line)] pt-2 text-[11px]">
                      <label className="flex cursor-pointer select-none items-center gap-1.5 text-[var(--ink)]">
                        <input
                          type="checkbox"
                          checked={item.addTailoring}
                          onChange={() => onToggleAddon(item.cartId, 'tailoring')}
                          className="h-3.5 w-3.5 accent-[var(--ink)]"
                        />
                        <span>Ask about fit to my measurements</span>
                      </label>
                      <label className="flex cursor-pointer select-none items-center gap-1.5 text-[var(--ink)]">
                        <input
                          type="checkbox"
                          checked={item.addDupatta}
                          onChange={() => onToggleAddon(item.cartId, 'dupatta')}
                          className="h-3.5 w-3.5 accent-[var(--ink)]"
                        />
                        <span>Ask about a matching dupatta</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-1">
                    <div className="flex items-center rounded border border-[var(--line)]">
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                        className="px-2.5 py-2 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-1 text-xs font-semibold tabular-nums text-[var(--ink)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                        className="px-2.5 py-2 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-serif text-sm font-bold text-[var(--ink)]">
                      {displayPrice(item.product, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {cartItems.length > 0 && (
            <div className="rounded-lg border border-[var(--line)] bg-white p-3">
              <button
                onClick={() => setGiftNoteOpen(!giftNoteOpen)}
                aria-expanded={giftNoteOpen}
                className="flex w-full items-center justify-between py-1 text-xs font-medium text-[var(--ink)]"
              >
                <span className="flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-[var(--ink)]" />
                  <span>Add a gift note to your message</span>
                </span>
                <span className="text-[var(--muted)]">{giftNoteOpen ? '−' : '+'}</span>
              </button>
              {giftNoteOpen && (
                <div className="mt-2.5">
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Anything you'd like Rasika to know — an occasion, a date, a colour preference."
                    rows={2}
                    aria-label="Gift note"
                    className="w-full rounded border border-[var(--line)] p-2 text-xs focus:border-[var(--ink)] focus:outline-hidden"
                  />
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    This is included in the WhatsApp message you send.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Send */}
        {cartItems.length > 0 && (
          <div className="space-y-3 border-t border-[var(--line)] bg-white p-4">
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              Most pieces are priced on request — Rasika replies with the figure, the fabric that's
              in stock and how long it will take.
            </p>

            <button
              id="whatsapp-order-btn"
              onClick={handleWhatsAppEnquiry}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#075E54] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#0a7a6c] hover:shadow-lg"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send enquiry on WhatsApp</span>
            </button>

            <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-[var(--muted)]">
              <Scissors className="h-3.5 w-3.5" />
              <span>Ready to wear and customised pieces, from the Pimple Gurav atelier</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
