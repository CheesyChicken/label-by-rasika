import React from 'react';
import { Grid3X3, Grid2X2, RotateCcw, Sparkles } from 'lucide-react';
import { HAS_PRICES } from '../data/taxonomy';
import { Category, Occasion } from '../types';
import { ACTIVE_OCCASIONS, COLOR_SWATCHES } from '../data/taxonomy';

interface FilterControlsProps {
  selectedCategory: Category;
  selectedOccasion: Occasion;
  onSelectOccasion: (occasion: Occasion) => void;
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  gridColumns: 2 | 3 | 4;
  onSetGridColumns: (cols: 2 | 3 | 4) => void;
  productCount: number;
  onResetFilters: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedCategory,
  selectedOccasion,
  onSelectOccasion,
  selectedColor,
  onSelectColor,
  sortBy,
  onSelectSortBy,
  gridColumns,
  onSetGridColumns,
  productCount,
  onResetFilters,
}) => {
  const occasions: { id: Occasion; label: string }[] = ACTIVE_OCCASIONS();


  const colors = COLOR_SWATCHES;


  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedOccasion !== 'all' ||
    selectedColor !== null;

  return (
    <div className="bg-white border-b border-[var(--line)] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Row 1: Occasion pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Occasion Switcher */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-1 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--ink)]" /> Occasion:
            </span>
            {occasions.map((occ) => (
              <button
                key={occ.id}
                onClick={() => onSelectOccasion(occ.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  selectedOccasion === occ.id
                    ? 'bg-[var(--ink)] text-white shadow-xs'
                    : 'bg-[var(--bg-soft)] text-gray-700 hover:bg-[var(--line)]'
                }`}
              >
                {occ.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-[var(--ink)] hover:underline font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Color Swatches, Sort, and Grid Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {/* Color filter chips */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-gray-500">
              Colour:
            </span>
            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => onSelectColor(null)}
                className={`shrink-0 rounded border px-2 py-1.5 text-[11px] transition-colors ${
                  selectedColor === null
                    ? 'border-[var(--ink)] text-[var(--ink)] font-bold bg-[var(--bg)]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onSelectColor(selectedColor === c.name ? null : c.name)}
                  aria-pressed={selectedColor === c.name}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2.5 text-[11px] transition-colors ${
                    selectedColor === c.name
                      ? 'border-[var(--ink)] font-semibold text-[var(--ink)]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  <span className="text-gray-500">{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Results Count, Sort Dropdown & Layout */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              Showing <strong className="text-gray-900">{productCount}</strong> pieces
            </span>

            {/* Sort Select */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => onSelectSortBy(e.target.value)}
                className="bg-[var(--bg-soft)] border border-[var(--line)] text-[var(--ink)] font-medium rounded-md px-2 py-1 focus:outline-hidden focus:border-[var(--ink)] cursor-pointer"
              >
                <option value="featured">Most loved on Instagram</option>
                {HAS_PRICES && <option value="price-low">Price: Low to High</option>}
                {HAS_PRICES && <option value="price-high">Price: High to Low</option>}
                <option value="newest">Recently posted</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>

            {/* Grid Column Selector on Desktop */}
            <div className="hidden lg:flex items-center gap-1 border border-gray-200 rounded p-0.5">
              <button
                onClick={() => onSetGridColumns(3)}
                className={`p-1 rounded ${
                  gridColumns === 3 ? 'bg-[var(--ink)] text-white' : 'text-gray-500 hover:text-black'
                }`}
                title="3 Columns"
              >
                <Grid2X2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSetGridColumns(4)}
                className={`p-1 rounded ${
                  gridColumns === 4 ? 'bg-[var(--ink)] text-white' : 'text-gray-500 hover:text-black'
                }`}
                title="4 Columns"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
