import React, { useMemo, useState } from 'react';
import { useStore } from '../store/StoreContext';
import { ReelCard } from '../components/ReelCard';
import { GalleryControls } from '../components/GalleryControls';
import { GalleryGrid } from '../components/GalleryGrid';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { PageHeader } from '../components/PageHeader';
import { InstagramProfileBar } from '../components/InstagramProfileBar';
import { IG_GALLERY, IG_REEL_CLIPS, IG_REELS_WITH_CLIP } from '../data/instagram';
import { GalleryColumns, GalleryFilter, GalleryView } from '../types';

export const InstagramPage: React.FC = () => {
  const s = useStore();

  const [view, setView] = useState<GalleryView>('gallery');
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [columns, setColumns] = useState<GalleryColumns>(4);
  const [perPage, setPerPage] = useState(20); // 4 × 5
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const counts = useMemo(
    () => ({
      photos: IG_GALLERY.filter((g) => !g.isVideo).length,
      reels: IG_GALLERY.filter((g) => g.isVideo).length,
    }),
    []
  );

  const filtered = useMemo(
    () =>
      IG_GALLERY.filter((g) =>
        filter === 'all' ? true : filter === 'photos' ? !g.isVideo : g.isVideo
      ),
    [filter]
  );

  // The lightbox walks whichever list the visible view is showing.
  const lightboxItems = view === 'posts' ? IG_REELS_WITH_CLIP : filtered;

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * perPage, safePage * perPage + perPage);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  return (
    <>
      <PageHeader
        eyebrow={`@${s.igProfile.username}`}
        title="Shop the Instagram feed"
        subtitle={`${IG_GALLERY.length} images from Rasika’s own Instagram — every photograph she has posted, plus the cover of every reel.`}
      />

      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <InstagramProfileBar profile={s.igProfile} />
        <GalleryControls
          view={view}
          onView={setView}
          filter={filter}
          onFilter={reset(setFilter)}
          columns={columns}
          onColumns={setColumns}
          perPage={perPage}
          onPerPage={reset(setPerPage)}
          total={IG_GALLERY.length}
          counts={counts}
        />
      </div>

      {view === 'gallery' ? (
        <div className="mx-auto w-full max-w-[1120px] px-5 pb-20 sm:px-8">
          {pageItems.length === 0 ? (
            <p className="py-24 text-center text-sm text-[var(--muted)]">
              Nothing to show for this filter yet.
            </p>
          ) : (
            <>
              <GalleryGrid
                items={pageItems}
                columns={columns}
                onOpen={(_, i) => setLightbox(safePage * perPage + i)}
              />

              {pageCount > 1 && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label="Gallery pages"
                >
                  <button
                    onClick={() => setPage(Math.max(0, safePage - 1))}
                    disabled={safePage === 0}
                    className="border border-[var(--line)] px-4 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-[var(--ink)] disabled:opacity-35 disabled:hover:border-[var(--line)]"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-[11px] text-[var(--muted)]">
                    {safePage + 1} / {pageCount}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
                    disabled={safePage >= pageCount - 1}
                    className="border border-[var(--line)] px-4 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-[var(--ink)] disabled:opacity-35 disabled:hover:border-[var(--line)]"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1120px] px-5 pb-20 sm:px-8">
          {IG_REELS_WITH_CLIP.length === 0 ? (
            <p className="py-24 text-center text-sm text-[var(--muted)]">
              No preview clips have been generated yet.
            </p>
          ) : (
            <>
              <p className="mb-6 text-[11px] font-light text-[var(--muted)]">
                Hover a reel to play it. Clips are served from this site, so nothing here depends
                on Instagram loading — clicking still opens the original post.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {IG_REELS_WITH_CLIP.map((item) => (
                  <ReelCard
                    key={item.code}
                    item={item}
                    videoSrc={IG_REEL_CLIPS[item.code]}
                    onOpenDetail={() => {
                      const i = IG_REELS_WITH_CLIP.findIndex((f) => f.code === item.code);
                      if (i >= 0) setLightbox(i);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <GalleryLightbox
        items={lightboxItems}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </>
  );
};
