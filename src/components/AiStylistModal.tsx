import React, { useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { 
  X, 
  Sparkles, 
  Crown, 
  ShoppingBag, 
  ArrowRight, 
  RotateCcw,
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product, CurrencyCode } from '../types';
import { displayPrice } from '../utils/currency';
import { generateAiStylistAdvice, StylistRecommendation } from '../utils/aiStylistService';
import { SmartImage } from './SmartImage';

interface AiStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const AiStylistModal: React.FC<AiStylistModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSelectProduct,
  onAddToCart,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [occasion, setOccasion] = useState('wedding');
  const [vibe, setVibe] = useState('royal');
  const [drapeExperience, setDrapeExperience] = useState('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<StylistRecommendation | null>(null);

  const handleGenerateAdvice = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAiStylistAdvice({
        occasion,
        vibe,
        drapeExperience,
        products: PRODUCTS,
      });
      setRecommendation(result);
      setStep(3);
    } catch (err) {
      console.error('Failed to generate AI styling:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setRecommendation(null);
  };

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

      {/* Modal Card */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="AI styling concierge"
        className="relative z-10 w-full max-w-2xl bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--line-strong)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Royal Maroon & Gold */}
        <div className="p-5 bg-gradient-to-r from-[var(--ink-soft)] via-[var(--ink)] to-[var(--ink-soft)] text-white flex items-center justify-between border-b border-[var(--muted)]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[var(--muted)]/20 border border-[var(--muted)]/40 text-[var(--muted)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                Rasika’s AI Styling Concierge
              </h2>
              <p className="text-[11px] text-[var(--bg-soft)]/80 font-light">
                Personal styling, for your occasion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] block mb-1">
                  Step 1 of 2
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                  What occasion are you dressing for?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Rasika curates each handloom weave to complement the lighting and aura of your event.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'wedding', label: 'Bridal / Wedding Muhurat', desc: 'Regal silks & heirloom zari' },
                  { id: 'reception', label: 'Reception / Sangeet', desc: 'Grand twilight couture & sparkle' },
                  { id: 'cocktail', label: 'Cocktail / Modern Party', desc: 'Contemporary evening pieces' },
                  { id: 'puja', label: 'Puja / Festive Family Ritual', desc: 'Sacred hues & authentic weaves' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOccasion(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      occasion === item.id
                        ? 'border-[var(--ink)] bg-white text-[var(--ink)] ring-2 ring-[var(--ink)]/20 shadow-xs'
                        : 'border-[var(--line)] bg-white/70 hover:bg-white text-gray-700'
                    }`}
                  >
                    <p className="font-serif font-bold text-sm text-[var(--ink)]">{item.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  <span>Next: Styling Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)] block mb-1">
                  Step 2 of 2
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                  Select your desired aesthetic & comfort level
                </h3>
              </div>

              {/* Vibe Selection */}
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-2">
                  Style Aura:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'royal', label: 'Maharani Royalty', sub: 'Traditional & Majestic' },
                    { id: 'modern', label: 'Contemporary Chic', sub: 'Sleek & Minimalist' },
                    { id: 'shimmer', label: 'Golden Glow', sub: 'Tissue & Shimmer Sheen' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        vibe === v.id
                          ? 'border-[var(--ink)] bg-white text-[var(--ink)] font-bold shadow-xs'
                          : 'border-[var(--line)] bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{v.label}</p>
                      <p className="text-[10px] text-gray-500">{v.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Draping Experience */}
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide block mb-2">
                  How would you like it finished?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'beginner', label: 'Ready to wear', desc: 'As shown, in a standard size' },
                    { id: 'expert', label: 'Made to measure', desc: 'Cut to my own measurements' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDrapeExperience(d.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        drapeExperience === d.id
                          ? 'border-[var(--ink)] bg-white text-[var(--ink)] font-bold shadow-xs'
                          : 'border-[var(--line)] bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{d.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-900 underline"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateAdvice}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--ink)] to-[var(--ink-soft)] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[var(--muted)]" />
                  <span>{isGenerating ? 'Finding your piece…' : 'Curate My Look'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && recommendation && (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--ink)] font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[var(--muted)]" />
                    <span>Rasika’s Personalized Styling Recommendation</span>
                  </div>
                  {recommendation.poweredByClaude ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                      ✨ Powered by Anthropic Claude
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Curated by Rasika Atelier
                    </span>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Over
                </button>
              </div>

              {/* Recommended piece */}
              <div className="bg-white rounded-xl p-4 border border-[var(--line-strong)] shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <SmartImage
                  src={recommendation.outfit.primaryImage}
                  alt={recommendation.outfit.name}
                  className="w-28 h-36 object-cover rounded-lg bg-gray-100 shrink-0"
                />

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">
                    {recommendation.outfit.fabric}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[var(--ink)] mt-0.5">
                    {recommendation.outfit.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {recommendation.outfit.description}
                  </p>
                  <p className="font-serif font-bold text-base text-[var(--ink)] mt-2">
                    {displayPrice(recommendation.outfit, currency)}
                  </p>

                  <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                    <button
                      onClick={() => {
                        onAddToCart(recommendation.outfit);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-lg bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Shopping Bag
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(recommendation.outfit);
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Curated Styling Guide Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-[var(--line)] space-y-1">
                  <p className="font-bold text-[var(--ink)] uppercase tracking-wide text-[11px]">
                    ✂️ Neckline &amp; sleeves
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {recommendation.blouseRecommendation}
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[var(--line)] space-y-1">
                  <p className="font-bold text-[var(--ink)] uppercase tracking-wide text-[11px]">
                    👑 Jewellery &amp; accessories
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {recommendation.jewelryRecommendation}
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[var(--line)] space-y-1">
                  <p className="font-bold text-[var(--ink)] uppercase tracking-wide text-[11px]">
                    🪡 Fit &amp; finishing
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {recommendation.drapeTip}
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[var(--line)] space-y-1">
                  <p className="font-bold text-[var(--ink)] uppercase tracking-wide text-[11px]">
                    💄 Makeup & Hair
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {recommendation.makeupTip}
                  </p>
                </div>
              </div>

              {recommendation.stylistNote && (
                <div className="p-4 bg-gradient-to-r from-[var(--bg-soft)] via-[var(--bg-soft)] to-[var(--bg-soft)] rounded-xl border border-[var(--line-strong)]/40 space-y-1.5 shadow-2xs">
                  <p className="font-serif font-bold text-[var(--ink)] text-xs flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Styling note
                  </p>
                  <p className="text-gray-700 italic text-xs leading-relaxed">
                    {recommendation.stylistNote}
                  </p>
                  <p className="text-[10px] text-gray-500 not-italic">
                    Generated suggestion, not Rasika&rsquo;s own words — ask her on WhatsApp before
                    you decide.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
