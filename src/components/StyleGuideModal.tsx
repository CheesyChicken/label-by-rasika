import React, { useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { X, BookOpen, Sparkles, Compass } from 'lucide-react';
import { STYLE_GUIDE_ARTICLES } from '../data/content';
import { SmartImage } from './SmartImage';

interface StyleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StyleGuideModal: React.FC<StyleGuideModalProps> = ({ isOpen, onClose }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(STYLE_GUIDE_ARTICLES[0].id);
  const article = STYLE_GUIDE_ARTICLES.find((a) => a.id === selectedArticleId) || STYLE_GUIDE_ARTICLES[0];

  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(isOpen, onClose, panelRef);

  // Guard AFTER the hooks: an early return above them changed the hook
  // count between renders, which React does not allow.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Fabric and care guide"
        className="relative z-10 w-full max-w-4xl bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--line-strong)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[var(--ink-soft)] via-[var(--ink)] to-[var(--ink-soft)] text-white flex items-center justify-between border-b border-[var(--muted)]/40">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[var(--muted)]" />
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Fabric & Care Guide
              </h2>
              <p className="text-[11px] text-[var(--bg-soft)]/80 font-light">
How to look after the fabrics Rasika works with
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Article Tabs */}
        <div className="flex border-b border-[var(--line)] bg-white text-xs font-semibold overflow-x-auto">
          {STYLE_GUIDE_ARTICLES.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelectedArticleId(art.id)}
              className={`py-3 px-5 whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                selectedArticleId === art.id
                  ? 'border-[var(--ink)] text-[var(--ink)] font-bold bg-[var(--bg)]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span>{art.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Article Banner & Summary */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <SmartImage
              src={article.heroImage}
              alt={article.title}
              className="w-full md:w-64 h-64 object-cover rounded-xl shadow-md shrink-0"
            />
            <div className="flex-1">
              {article.region !== 'Origin not stated' && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] bg-[var(--bg-soft)] px-2 py-0.5 rounded">
                  Origin: {article.region}
                </span>
              )}
              <h3 className="font-serif text-2xl font-bold text-[var(--ink)] mt-1.5">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 italic mt-0.5">
                {article.subtitle}
              </p>
              <p className="text-xs text-gray-700 leading-relaxed mt-3">
                {article.summary}
              </p>
            </div>
          </div>

          {/* Step-by-Step Draping Tutorial */}
          <div className="bg-white rounded-xl p-5 border border-[var(--line)] space-y-3">
            <h4 className="font-serif text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--ink)]" />
              <span>Caring for this fabric</span>
            </h4>
            <div className="space-y-2">
              {article.drapeSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--ink)] text-white font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rasika's Styling Tips */}
          <div className="bg-[var(--bg-soft)] rounded-xl p-5 border border-[var(--line)] space-y-2 text-xs">
            <h4 className="font-serif text-base font-bold text-[var(--ink)]">
              Styling notes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {article.stylingTips.map((tip, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-[var(--line)]">
                  <p className="text-gray-700 leading-relaxed">✨ {tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
