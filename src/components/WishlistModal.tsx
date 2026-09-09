import React, { useRef } from 'react';
import { useDialog } from '../hooks/useDialog';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, CurrencyCode } from '../types';
import { displayPrice } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  currency: CurrencyCode;
  onRemoveWishlist: (product: Product) => void;
  onMoveToBag: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onBrowse: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  currency,
  onRemoveWishlist,
  onMoveToBag,
  onSelectProduct,
  onBrowse,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(isOpen, onClose, panelRef);

  // Guard AFTER the hooks: an early return above them changed the hook
  // count between renders, which React does not allow.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        className="relative z-10 w-full max-w-2xl bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--line)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--ink)]">
            <Heart className="w-5 h-5 fill-[var(--ink)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              My Saved Wishlist ({wishlistProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Heart className="w-12 h-12 text-[var(--ink)] opacity-30 mx-auto mb-3" />
              <p className="font-serif font-bold text-base text-[var(--ink)]">Your Wishlist is Empty</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Tap the heart on any piece to save it to your wishlist.
              </p>
              <button
                onClick={onBrowse}
                className="px-5 py-2 rounded-full bg-[var(--ink)] text-white text-xs font-bold uppercase tracking-wider"
              >
                Browse the Collection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-white rounded-xl border border-[var(--line)] flex items-center gap-3 shadow-xs"
                >
                  <SmartImage
                    src={product.primaryImage}
                    alt={product.name}
                    fallbackLabel={product.name}
                    fallbackHex={product.colorHex}
                    className="w-16 h-20 object-cover rounded bg-gray-100 cursor-pointer shrink-0"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[var(--ink)] font-semibold uppercase tracking-wider">
                      {product.fabric}
                    </span>
                    <h4
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="font-serif font-bold text-sm text-[var(--ink)] truncate cursor-pointer hover:text-[var(--ink)]"
                    >
                      {product.name}
                    </h4>
                    <p className="font-serif font-bold text-sm text-[var(--ink)] mt-0.5">
                      {displayPrice(product, currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onMoveToBag(product)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => onRemoveWishlist(product)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
