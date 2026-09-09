import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  /** Name of the area being guarded, shown in the fallback copy. */
  label?: string;
}
interface State {
  error: Error | null;
}

/**
 * Keeps one broken section from taking down the whole storefront.
 *
 * This exists because a prop-name mismatch in the cart drawer used to throw
 * during render, which unmounted the entire React tree and left a blank page —
 * and the cart opens automatically on "add to bag", so the site died on the
 * single most important interaction.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.label ?? 'app'}] render failed`, error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="m-4 rounded-2xl border border-[var(--line-strong)] bg-[var(--bg)] p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 h-7 w-7 text-[var(--ink)]" />
        <h3 className="font-serif text-base font-bold text-[var(--ink)]">
          This section could not be displayed
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-gray-600">
          The rest of the boutique is still available. If it keeps happening, reach us on WhatsApp
          at +91 78219 23346.
        </p>
        <button
          onClick={() => this.setState({ error: null })}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--ink-soft)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }
}
