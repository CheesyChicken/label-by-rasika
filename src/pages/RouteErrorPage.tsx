import React from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

/**
 * Distinguishes a missing page from a broken one.
 *
 * Routing every error to the 404 page hid real render crashes behind
 * "page not found", which is both wrong for the visitor and invisible to us.
 */
export const RouteErrorPage: React.FC = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  console.error('[route] unhandled error', error);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
      <h1 className="font-serif text-2xl font-light">Something went wrong here</h1>
      <p className="mt-3 text-sm font-light text-[var(--muted)]">
        This page failed to load. The rest of the boutique is still open — and you can always
        reach us on WhatsApp at +91 78219 23346.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="border border-[var(--ink)] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
        >
          Back to home
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="border border-[var(--line)] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-[var(--ink)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
};
