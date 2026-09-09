import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Category, Product } from '../types';
import { useStore } from '../store/StoreContext';
import { Navbar } from '../components/Navbar';
import { SidebarDrawer } from '../components/SidebarDrawer';
import { CartDrawer } from '../components/CartDrawer';
import { WishlistModal } from '../components/WishlistModal';
import { ContactModal } from '../components/ContactModal';
import { AiStylistModal } from '../components/AiStylistModal';
import { StyleGuideModal } from '../components/StyleGuideModal';
import { Footer } from '../components/Footer';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { AuthModal } from '../components/AuthModal';

/** Category → route. Keeps every nav surface pointing at real URLs. */
export const categoryPath = (c: Category) =>
  c === 'all' ? '/collections' : `/collections/${c}`;

export const RootLayout: React.FC = () => {
  const s = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // A new page should start at the top, and no drawer should survive the move.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    (['sidebar', 'cart', 'wishlist'] as const).forEach((k) => s.closePanel(k));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const goCategory = (c: Category) => navigate(categoryPath(c));
  const openProduct = (p: Product) => navigate(`/product/${p.id}`);
  const goReels = () => navigate('/instagram');

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased flex flex-col">
      {s.toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-md bg-[var(--ink)] px-4 py-3 text-xs text-[var(--bg)] shadow-lg animate-in slide-in-from-bottom-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-on-dark)]" />
          {s.toast}
        </div>
      )}

      <AnnouncementBar />

      <Navbar
        selectedCategory="all"
        currency={s.currency}
        onSelectCurrency={s.setCurrency}
        cartCount={s.cartCount}
        wishlistCount={s.wishlistIds.length}
        onOpenCart={() => s.openPanel('cart')}
        onOpenWishlist={() => s.openPanel('wishlist')}
        onOpenSidebar={() => s.openPanel('sidebar')}
        onOpenContact={() => s.openPanel('contact')}
        onOpenAiStylist={() => s.openPanel('stylist')}
        onOpenStyleGuide={() => s.openPanel('styleGuide')}
        onOpenReels={goReels}
        onSelectCategory={goCategory}
        onSelectProduct={openProduct}
        searchQuery={s.searchQuery}
        onSearchChange={s.setSearchQuery}
        isSignedIn={Boolean(s.user)}
        onOpenAccount={() => (s.user ? navigate('/account') : s.openPanel('auth'))}
      />

      <SidebarDrawer
        isOpen={s.ui.sidebar}
        onClose={() => s.closePanel('sidebar')}
        selectedCategory="all"
        onSelectCategory={goCategory}
        currency={s.currency}
        onSelectCurrency={s.setCurrency}
        wishlistCount={s.wishlistIds.length}
        onOpenWishlist={() => { s.closePanel('sidebar'); s.openPanel('wishlist'); }}
        onOpenContact={() => { s.closePanel('sidebar'); s.openPanel('contact'); }}
        onOpenAiStylist={() => { s.closePanel('sidebar'); s.openPanel('stylist'); }}
        onOpenStyleGuide={() => { s.closePanel('sidebar'); s.openPanel('styleGuide'); }}
        onOpenAccount={() => (s.user ? navigate('/account') : s.openPanel('auth'))}
        isSignedIn={Boolean(s.user)}
        onOpenReels={() => { s.closePanel('sidebar'); goReels(); }}
      />

      <CartDrawer
        isOpen={s.ui.cart}
        onClose={() => s.closePanel('cart')}
        cartItems={s.cartItems}
        currency={s.currency}
        onUpdateQuantity={s.updateQuantity}
        onRemoveItem={s.removeCartItem}
        onToggleAddon={s.toggleAddon}
        onBrowse={() => { s.closePanel('cart'); navigate('/collections'); }}
      />

      <WishlistModal
        isOpen={s.ui.wishlist}
        onClose={() => s.closePanel('wishlist')}
        wishlistProducts={s.wishlistProducts}
        currency={s.currency}
        onRemoveWishlist={s.toggleWishlist}
        onMoveToBag={s.moveWishlistToCart}
        onSelectProduct={(p) => { s.closePanel('wishlist'); openProduct(p); }}
        onBrowse={() => { s.closePanel('wishlist'); navigate('/collections'); }}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer
        onSelectCategory={goCategory}
        onOpenContact={() => s.openPanel('contact')}
        onOpenAiStylist={() => s.openPanel('stylist')}
        onOpenStyleGuide={() => s.openPanel('styleGuide')}
        onOpenReels={goReels}
      />

      <AuthModal
        isOpen={s.ui.auth}
        onClose={() => s.closePanel('auth')}
        onSignedIn={(u) => {
          s.signIn(u);
          s.showToast('You are signed in');
        }}
      />

      <ContactModal isOpen={s.ui.contact} onClose={() => s.closePanel('contact')} />

      <AiStylistModal
        isOpen={s.ui.stylist}
        onClose={() => s.closePanel('stylist')}
        currency={s.currency}
        onSelectProduct={(p) => { s.closePanel('stylist'); openProduct(p); }}
        onAddToCart={(p) => s.addToCart(p)}
      />


      <StyleGuideModal
        isOpen={s.ui.styleGuide}
        onClose={() => s.closePanel('styleGuide')}
      />
    </div>
  );
};
