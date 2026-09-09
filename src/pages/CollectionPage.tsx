import React, { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Category, Occasion } from '../types';
import { CATALOG_HEADINGS, ACTIVE_CATEGORIES, matchesFacets } from '../data/taxonomy';
import { useStore } from '../store/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { FilterControls } from '../components/FilterControls';
import { PageHeader } from '../components/PageHeader';

const VALID = new Set(ACTIVE_CATEGORIES.map((c) => c.id));

export const CollectionPage: React.FC = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const s = useStore();

  // ?q=… is how "View all results" hands the search over. Without it the query
  // stayed switched on invisibly and the grid looked mysteriously short.
  const qParam = params.get('q') ?? '';
  useEffect(() => {
    if (qParam !== s.searchQuery) s.setSearchQuery(qParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  // ?occasion=… lets the sidebar and footer deep-link into a filtered view.
  const occasionParam = params.get('occasion') as Occasion | null;
  useEffect(() => {
    if (occasionParam && occasionParam !== s.filters.occasion) {
      s.setFilters((f) => ({ ...f, occasion: occasionParam }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occasionParam]);

  const active: Category = (VALID.has(category as Category) ? category : 'all') as Category;

  // Facet query from the "Shop by" menu — fabric / craft / colour.
  const facets = {
    fabric: params.get('fabric'),
    craft: params.get('craft'),
    colour: params.get('colour'),
  };
  const activeFacets = Object.entries(facets).filter(([, v]) => v) as [string, string][];
  const products = s.filterProducts(active).filter((p) => matchesFacets(p, facets));
  const heading = CATALOG_HEADINGS[active] ?? 'The Collection';

  return (
    <>
      <PageHeader
        eyebrow="Handcrafted in Pimple Gurav, Pune"
        title={activeFacets.length ? activeFacets.map(([, v]) => v).join(' · ') : heading}
        subtitle="Ready to wear, or customised to your measurements — every piece here is one Rasika has published."
      />

      <div className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8">
        {s.searchQuery && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Searching for
            </span>
            <button
              onClick={() => { s.setSearchQuery(''); navigate('/collections', { replace: true }); }}
              className="inline-flex items-center gap-1.5 border border-[var(--ink)] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
            >
              &ldquo;{s.searchQuery}&rdquo;
              <span aria-hidden="true">&times;</span>
              <span className="sr-only">Clear search</span>
            </button>
          </div>
        )}

        {activeFacets.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Filtered by
            </span>
            {activeFacets.map(([k, v]) => (
              <button
                key={k}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.delete(k);
                  navigate({ pathname: `.`, search: next.toString() ? `?${next}` : '' }, { replace: true });
                }}
                className="inline-flex items-center gap-1.5 border border-[var(--ink)] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
              >
                {v}
                <span aria-hidden="true">&times;</span>
                <span className="sr-only">Remove {v} filter</span>
              </button>
            ))}
            <Link
              to="/collections"
              className="link-underline text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Clear all
            </Link>
          </div>
        )}

        <FilterControls
          selectedCategory={active}
          selectedOccasion={s.filters.occasion}
          onSelectOccasion={(o) => s.setFilters((f) => ({ ...f, occasion: o }))}
          selectedColor={s.filters.color}
          onSelectColor={(c) => s.setFilters((f) => ({ ...f, color: c }))}
          sortBy={s.filters.sortBy}
          onSelectSortBy={(v) => s.setFilters((f) => ({ ...f, sortBy: v }))}
          gridColumns={s.filters.gridColumns}
          onSetGridColumns={(n) => s.setFilters((f) => ({ ...f, gridColumns: n }))}
          productCount={products.length}
          onResetFilters={s.resetFilters}
        />

        {products.length === 0 ? (
          <div className="border border-[var(--line)] py-24 text-center">
            <Compass className="mx-auto mb-4 h-8 w-8 text-[var(--muted)]" strokeWidth={1.2} />
            <h3 className="font-serif text-xl text-[var(--ink)]">Nothing matches those filters</h3>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Try clearing a filter, or search for a fabric.
            </p>
            <button
              onClick={s.resetFilters}
              className="mt-6 border border-[var(--ink)] px-7 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            className={`mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 ${
              s.filters.gridColumns === 4
                ? 'lg:grid-cols-4'
                : s.filters.gridColumns === 2
                ? 'lg:grid-cols-2'
                : 'lg:grid-cols-3'
            }`}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={s.currency}
                onQuickView={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => s.addToCart(p)}
                isWishlisted={s.isWishlisted(p.id)}
                onToggleWishlist={s.toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
