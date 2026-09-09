import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, LogOut, MessageCircle, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  const s = useStore();
  const navigate = useNavigate();

  if (!s.user) return <Navigate to="/" replace />;

  return (
    <>
      <PageHeader
        eyebrow={`+91 ${s.user.phone}`}
        title="Your account"
        subtitle={s.user.email ?? undefined}
      />

      <div className="mx-auto max-w-[1120px] px-5 pb-24 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--line)] py-4">
          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> {s.wishlistIds.length} saved
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> {s.cartCount} in bag
            </span>
          </div>
          <button
            onClick={() => { s.signOut(); navigate('/'); }}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>

        {/* There is no order history because checkout goes through WhatsApp —
            no orders are ever recorded on this site. Saying so is better than
            an empty "My Orders" panel that implies one exists. */}
        <section className="mt-12">
          <h2 className="font-serif text-lg font-light">Your orders</h2>
          <div className="mt-4 border border-[var(--line)] bg-[var(--bg-soft)] p-8 text-center">
            <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-[var(--muted)]">
              Orders are placed and tracked over WhatsApp, so there is no order history here.
              Message us and we&rsquo;ll pull up everything you&rsquo;ve ordered.
            </p>
            <a
              href="https://wa.me/917821923346"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[var(--ink)] px-7 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--bg)] transition-colors hover:bg-[var(--accent)]"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Message us on WhatsApp
            </a>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-lg font-light">Saved pieces</h2>
          {s.wishlistProducts.length === 0 ? (
            <p className="mt-4 border border-[var(--line)] p-8 text-center text-sm font-light text-[var(--muted)]">
              Nothing saved yet.{' '}
              <Link to="/collections" className="link-underline text-[var(--ink)]">
                Browse the collection
              </Link>
              .
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {s.wishlistProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={s.currency}
                  onQuickView={() => navigate(`/product/${p.id}`)}
                  onAddToCart={() => s.addToCart(p)}
                  isWishlisted
                  onToggleWishlist={s.toggleWishlist}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};
