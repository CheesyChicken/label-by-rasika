import React from 'react';
import {
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { Logo } from './Logo';
import { Category } from '../types';
import { ACTIVE_CATEGORIES } from '../data/taxonomy';

interface FooterProps {
  onSelectCategory: (category: Category) => void;
  onOpenContact: () => void;
  onOpenStyleGuide: () => void;
  onOpenAiStylist: () => void;
  onOpenReels: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenContact,
  onOpenStyleGuide,
  onOpenAiStylist,
  onOpenReels,
}) => {
  return (
    <footer className="bg-[var(--ink-deep)] text-[var(--bg-soft)] border-t border-[var(--muted)]/30">
      {/*
        Follow bar.

        This used to be an email signup headed "Receive 10% Off Your First
        Order", promising lookbooks and trunk shows and telling the subscriber
        to check their inbox for a code. No mail was ever sent — handleSubscribe
        only flipped local state — and no discount programme exists. Replaced
        with the two channels Rasika actually runs.
      */}
      <div className="border-b border-white/10 py-10 px-4 sm:px-6 lg:px-8 bg-[var(--ink-deep)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--accent-on-dark)] mb-1">
              <Heart className="w-3.5 h-3.5 fill-[var(--accent-on-dark)]" /> New pieces, most weeks
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              See each piece as it&rsquo;s made
            </h3>
            <p className="text-xs text-[var(--bg-soft)]/80 mt-1 max-w-lg font-light">
              Rasika posts every new piece to Instagram first. Message on WhatsApp to ask about
              anything you see.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <a
              href="https://www.instagram.com/label_by_rasika/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/25 text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/20"
            >
              Follow @label_by_rasika
            </a>
            <a
              href="https://wa.me/917821923346"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#075E54] text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#0a7a6c]"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Atelier Details */}
        <div className="space-y-4">
          <Logo variant="light" size="md" />
          <p className="text-xs text-[var(--bg-soft)]/80 leading-relaxed font-light">
            Founded by designer Rasika Wankhede, Label by Rasika is a ready-to-wear and customised womenswear atelier in Pimple Gurav, Pune — kurta sets, Anarkalis and hand-worked separates.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://www.instagram.com/label_by_rasika/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--ink)] flex items-center justify-center text-white transition-colors"
              title="Instagram @label_by_rasika"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/917821923346"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#075E54]/15 hover:bg-[#075E54] flex items-center justify-center text-[#075E54] hover:text-white transition-colors"
              title="WhatsApp Concierge"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onOpenContact}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--accent-on-dark)] hover:text-[var(--ink)] flex items-center justify-center text-white transition-colors"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Col 2: Handloom Collections */}
        <div>
          <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-[var(--accent-on-dark)] mb-4">
            Curated Collections
          </h4>
          <ul className="space-y-2 text-xs text-[var(--bg-soft)]/85">
            {/* Derived from the catalogue: a footer link can never point at an
                empty category, which previously dumped the visitor on the full
                collection under a heading promising something narrower. */}
            {ACTIVE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelectCategory(c.id)}
                  className="transition-colors hover:text-white"
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: VIP Concierge & Services */}
        <div>
          <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-[var(--accent-on-dark)] mb-4">
            Atelier Concierge
          </h4>
          <ul className="space-y-2 text-xs text-[var(--bg-soft)]/85">
            <li>
              <button onClick={onOpenAiStylist} className="hover:text-white transition-colors">
                Rasika’s AI Stylist
              </button>
            </li>
            <li>
              <button onClick={onOpenContact} className="hover:text-white transition-colors">
                Book 1-on-1 Video Consultation
              </button>
            </li>
            <li>
              <button onClick={onOpenStyleGuide} className="hover:text-white transition-colors">
                Fabric & Care Guide
              </button>
            </li>
            <li>
              <button onClick={onOpenReels} className="hover:text-white transition-colors">
                Watch Reels @label_by_rasika
              </button>
            </li>
            <li>
              <a href="https://wa.me/917821923346" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                WhatsApp the atelier (+91 78219 23346)
              </a>
            </li>
            <li>
              <button onClick={onOpenContact} className="hover:text-white transition-colors">
                Visit the boutique in Pimple Gurav, Pune
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Boutique Address & Certification */}
        <div className="space-y-3 text-xs text-[var(--bg-soft)]/80">
          <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-[var(--accent-on-dark)] mb-4">
            The Boutique
          </h4>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[var(--accent-on-dark)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Label by Rasika Boutique, Chandrarang Park, Sudarshan Nagar, Near Jagtap Patil Petrol Pump & Wankhede Jewellers, Pimple Gurav, Pune, Maharashtra 411061.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[var(--accent-on-dark)] shrink-0" />
            <a href="tel:+917821923346" className="transition-colors hover:text-white">
              +91 78219 23346
            </a>
          </div>
          <div className="flex items-start gap-2">
            <MessageCircle className="w-4 h-4 text-[var(--accent-on-dark)] shrink-0 mt-0.5" />
            <p className="min-w-0">
              WhatsApp is the fastest way to reach the atelier — there is no published email
              address.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-[var(--bg-soft)]/80">
            <ShieldCheck className="w-4 h-4" />
            <span>Handcrafted in Pimple Gurav, Pune</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Gateways */}
      <div className="border-t border-white/10 py-6 px-4 text-center text-xs text-[var(--bg-soft)]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Label by Rasika. All rights reserved.</p>
          {/* No payment rail is listed: orders are placed on WhatsApp and there
              is no checkout on this site to accept a card. */}
          <p className="text-[11px] text-[var(--bg-soft)]/70">
            Orders and payment are arranged directly with the atelier on WhatsApp.
          </p>
        </div>
      </div>
    </footer>
  );
};
