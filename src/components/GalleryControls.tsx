import React from 'react';
import { Grid2x2, Grid3x3, LayoutGrid, Rows3, Image as ImageIcon, Play, Layers } from 'lucide-react';
import { GalleryColumns, GalleryFilter, GalleryView } from '../types';

interface GalleryControlsProps {
  view: GalleryView;
  onView: (v: GalleryView) => void;
  filter: GalleryFilter;
  onFilter: (f: GalleryFilter) => void;
  columns: GalleryColumns;
  onColumns: (c: GalleryColumns) => void;
  perPage: number;
  onPerPage: (n: number) => void;
  total: number;
  counts: { photos: number; reels: number };
}

const seg =
  'px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors border border-[var(--line)]';
const on = 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]';
const off = 'text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]';

const COL_ICON: Record<GalleryColumns, React.ElementType> = {
  2: Rows3,
  3: Grid2x2,
  4: Grid3x3,
  5: LayoutGrid,
};

/** Media-type filter, layout mode, grid density and page size for the feed. */
export const GalleryControls: React.FC<GalleryControlsProps> = ({
  view, onView, filter, onFilter, columns, onColumns, perPage, onPerPage, total, counts,
}) => (
  <div className="mb-8 flex flex-col gap-4 border-y border-[var(--line)] py-4">
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Media type — gallery only; the Posts view is always the reel clips. */}
      {view === 'gallery' && (
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Show</span>
        <div className="flex">
          {([
            ['all', `All ${total}`, Layers],
            ['photos', `Photos ${counts.photos}`, ImageIcon],
            ['reels', `Reels ${counts.reels}`, Play],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => onFilter(id as GalleryFilter)}
              aria-pressed={filter === id}
              className={`${seg} -ml-px inline-flex items-center gap-1.5 first:ml-0 ${
                filter === id ? on : off
              }`}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Layout mode */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">View</span>
        <div className="flex">
          {([
            ['gallery', 'Gallery'],
            ['posts', 'Posts'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onView(id as GalleryView)}
              aria-pressed={view === id}
              className={`${seg} -ml-px first:ml-0 ${view === id ? on : off}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Density — gallery only; embeds have a minimum width and cannot go dense. */}
      {view === 'gallery' && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Columns
          </span>
          <div className="flex">
            {([2, 3, 4, 5] as GalleryColumns[]).map((c) => {
              const Icon = COL_ICON[c];
              return (
                <button
                  key={c}
                  onClick={() => onColumns(c)}
                  aria-pressed={columns === c}
                  aria-label={`${c} columns`}
                  className={`${seg} -ml-px inline-flex items-center gap-1 first:ml-0 ${
                    columns === c ? on : off
                  }`}
                >
                  <Icon className="h-3 w-3" strokeWidth={1.5} />
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Page size — gallery only, for the same reason. */}
      {view === 'gallery' && (
      <label className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Per page
        </span>
        <select
          value={perPage}
          onChange={(e) => onPerPage(Number(e.target.value))}
          className="border border-[var(--line)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[var(--ink)]"
        >
          {[12, 20, 24, 40, 60, 9999].map((n) => (
            <option key={n} value={n}>
              {n === 9999 ? 'All on one page' : n}
              {n === 20 ? ' (4 × 5)' : ''}
            </option>
          ))}
        </select>
      </label>
      )}
    </div>
  </div>
);
