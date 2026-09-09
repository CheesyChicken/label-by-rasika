import React from 'react';
import { Heart, MessageCircle, Play, Layers } from 'lucide-react';
import { GalleryColumns, GalleryItem } from '../types';
import { SmartImage } from './SmartImage';
import { describeMedia } from '../utils/mediaAlt';

interface GalleryGridProps {
  items: GalleryItem[];
  columns: GalleryColumns;
  onOpen: (item: GalleryItem, index: number) => void;
}

const COLS: Record<GalleryColumns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
};

const compact = (n?: number | null) =>
  n == null ? '' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

/** Dense square-tile grid of the downloaded photography. */
export const GalleryGrid: React.FC<GalleryGridProps> = ({ items, columns, onOpen }) => (
  <ul className={`grid gap-1.5 sm:gap-2 ${COLS[columns]}`}>
    {items.map((item, i) => (
      <li key={`${item.code}-${item.i}`}>
        <button
          onClick={() => onOpen(item, i)}
          className="group relative block aspect-square w-full overflow-hidden bg-[var(--bg-soft)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
          aria-label={describeMedia(item)}
        >
          <SmartImage
            src={item.file}
            alt=""
            aria-hidden="true"
            fallbackLabel="Label by Rasika"
            className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
          />

          {/* Type marker, mirroring Instagram's own grid affordances. */}
          <span className="pointer-events-none absolute right-2 top-2 text-[var(--bg)] drop-shadow">
            {item.isVideo ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : item.isSidecar ? (
              <Layers className="h-3.5 w-3.5" strokeWidth={1.8} />
            ) : null}
          </span>

          {/* Engagement on hover — quiet, never on by default. */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 bg-[var(--ink)]/45 text-xs text-[var(--bg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.likes != null && (
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-current" /> {compact(item.likes)}
              </span>
            )}
            {item.comments != null && (
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" /> {compact(item.comments)}
              </span>
            )}
          </span>
        </button>
      </li>
    ))}
  </ul>
);
