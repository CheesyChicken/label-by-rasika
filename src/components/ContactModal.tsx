import React, { useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { 
  X, 
  MapPin, 
  Phone, 
  Video, 
  MessageCircle, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Instagram
} from 'lucide-react';
import { FAQS } from '../data/content';
import { ACTIVE_CATEGORIES } from '../data/taxonomy';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'appointment' | 'contact' | 'faqs'>('appointment');
  
  // Appointment Form State
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptDate, setApptDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [apptSlot, setApptSlot] = useState('afternoon (IST)');
  const [interest, setInterest] = useState('Kurtas & Sets');
  const [apptSubmitted, setApptSubmitted] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  /**
   * Nothing is booked here. There is no calendar, no API and no storage — the
   * request is a WhatsApp message Rasika has to see and reply to. The UI used
   * to answer "Video Consultation Confirmed! We've saved your slot", which was
   * false, and it opened WhatsApp from inside a setTimeout — outside the click
   * gesture, so browsers routinely suppressed it and the customer was left
   * with a green confirmation and nothing else.
   */
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptName.trim() || !apptPhone.trim()) return;
    const msg =
      `Hi Label by Rasika! I'd like to request a video call.\n` +
      `Name: ${apptName}\n` +
      `Preferred: ${apptDate}, ${apptSlot}\n` +
      `Interested in: ${interest}\n` +
      `You can reach me on ${apptPhone}.`;
    window.open(`https://wa.me/917821923346?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    setApptSubmitted(true);
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

      {/* Modal Container */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Contact Label by Rasika"
        className="relative z-10 w-full max-w-3xl bg-[var(--bg)] rounded-2xl shadow-2xl border border-[var(--line-strong)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[var(--ink-soft)] via-[var(--ink)] to-[var(--ink-soft)] text-white flex items-center justify-between border-b border-[var(--muted)]/40">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
              Label By Rasika Concierge
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              Pune Atelier & VIP Services
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--line)] bg-white text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('appointment')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'appointment'
                ? 'border-[var(--ink)] text-[var(--ink)] bg-[var(--bg)]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span>Book Video Call</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'contact'
                ? 'border-[var(--ink)] text-[var(--ink)] bg-[var(--bg)]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span>Atelier Location</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'faqs'
                ? 'border-[var(--ink)] text-[var(--ink)] bg-[var(--bg)]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span>FAQs & Care</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Live Video Consultation Booking */}
          {activeTab === 'appointment' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[var(--line)] text-xs text-gray-600">
                <h3 className="font-serif text-lg font-bold text-[var(--ink)] mb-1">
                  1-on-1 Virtual Styling Consultation
                </h3>
                <p className="leading-relaxed">
                  Ask Rasika for a video call and she'll show you the pieces in daylight — the
                  real colour, the fall of the fabric and the finish up close. Pick a time that
                  suits you below and it goes across as a WhatsApp request.
                </p>
              </div>

              {apptSubmitted ? (
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-emerald-900">
                    Request ready to send
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    WhatsApp should have opened with your request for {apptDate} ({apptSlot}).
                    Send the message and Rasika will confirm whether that time works — the slot
                    isn't held until she replies.
                  </p>
                  <button
                    type="button"
                    onClick={() => setApptSubmitted(false)}
                    className="text-[11px] underline text-emerald-900 underline-offset-2"
                  >
                    Request another time
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={apptName}
                        onChange={(e) => setApptName(e.target.value)}
                        placeholder="e.g. Radhika Sharma"
                        className="w-full p-2 border border-gray-300 rounded focus:border-[var(--ink)] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">WhatsApp Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={apptPhone}
                        onChange={(e) => setApptPhone(e.target.value)}
                        placeholder="Your WhatsApp number"
                        className="w-full p-2 border border-gray-300 rounded focus:border-[var(--ink)] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Preferred Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={apptDate}
                        onChange={(e) => setApptDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:border-[var(--ink)] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Time Slot (IST)</label>
                      <select
                        value={apptSlot}
                        onChange={(e) => setApptSlot(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:border-[var(--ink)] focus:outline-hidden"
                      >
                        <option value="morning (IST)">Morning</option>
                        <option value="afternoon (IST)">Afternoon</option>
                        <option value="evening (IST)">Evening</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Category</label>
                      <select
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:border-[var(--ink)] focus:outline-hidden"
                      >
                        {/* Driven by the catalogue so this can never offer
                            something the atelier does not actually make. */}
                        {ACTIVE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                        <option value="Custom / made to measure">Custom / made to measure</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Confirm Video Appointment</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Atelier Location & Contact Info */}
          {activeTab === 'contact' && (
            <div className="space-y-4 text-xs text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[var(--line)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--ink)] font-bold">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-serif">The Boutique</span>
                  </div>
                  <p className="leading-relaxed text-gray-600">
                    <strong>Label by Rasika Studio & Boutique</strong><br />
                    Chandrarang Park, Sudarshan Nagar,<br />
                    Near Jagtap Patil Petrol Pump & Wankhede Jewellers,<br />
                    Pimple Gurav, Pune, Maharashtra 411061, India.
                  </p>
                  <p className="text-gray-500 pt-1">
                    Message on WhatsApp before you travel — opening times aren't published, so
                    it's worth checking Rasika is in.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[var(--line)] space-y-3">
                  <div className="flex items-center gap-2 text-[var(--ink)] font-bold">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-serif">Reach the atelier</span>
                  </div>

                  <p className="flex items-center gap-2 text-gray-600">
                    <span>Phone:</span>
                    <a href="tel:+917821923346" className="text-[var(--ink)] font-bold hover:underline">
                      +91 78219 23346
                    </a>
                  </p>


                  <a
                    href="https://wa.me/917821923346"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#075E54] text-white font-medium hover:bg-[#0a7a6c] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Instagram Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-full">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">@label_by_rasika</p>
                    <p className="text-[11px] text-gray-600">New pieces, reels and behind-the-scenes from the atelier.</p>
                  </div>
                </div>
                <a
                  href="https://www.instagram.com/label_by_rasika/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[var(--ink)] underline"
                >
                  View Profile
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: FAQs */}
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-[var(--line)] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-[var(--ink)] hover:bg-gray-50 transition-colors"
                    >
                      <span className="pr-4">{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-[var(--bg)]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
