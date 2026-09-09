import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <div className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
    <p className="font-serif text-6xl font-light text-[var(--muted)]">404</p>
    <h1 className="mt-4 font-serif text-2xl font-light">This page has moved on</h1>
    <p className="mt-3 text-sm font-light text-[var(--muted)]">
      The page you were looking for isn&rsquo;t here. The collection is.
    </p>
    <Link
      to="/collections"
      className="mt-8 border border-[var(--ink)] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
    >
      Browse the collection
    </Link>
  </div>
);
