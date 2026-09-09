import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Loader2, X } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn: (user: { phone: string; email: string | null }) => void;
}

type Step = 'phone' | 'otp' | 'email';

const OTP_LENGTH = 4;

/**
 * Mobile → OTP → email sign-in, mirroring the flow the client referenced.
 *
 * The code never travels to the browser: request-otp returns only a signed
 * challenge, and verify-otp checks the submitted digits server-side. If no SMS
 * provider is configured the UI says so plainly rather than showing an OTP box
 * that cannot succeed.
 */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignedIn }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [delivered, setDelivered] = useState(false);

  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const firstField = useRef<HTMLInputElement | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(isOpen, onClose, panelRef);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => firstField.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Reset when it closes, so reopening never resumes a stale half-finished flow.
  useEffect(() => {
    if (isOpen) return;
    setStep('phone'); setPhone(''); setDigits(Array(OTP_LENGTH).fill(''));
    setEmail(''); setChallenge(''); setError(null); setNotice(null); setResendIn(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const requestOtp = async (resend = false) => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const r = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const d = await r.json();
      if (d.reason === 'not_configured') {
        setError('Sign-in is not switched on yet. Ask your developer to set AUTH_SECRET and an SMS provider.');
        return;
      }
      if (d.reason === 'bad_phone') { setError(d.message); return; }
      if (d.reason === 'cooldown') { setResendIn(d.retryAfter ?? 30); setError(d.message); return; }
      if (!d.challenge) { setError(d.message || 'Could not send a code just now.'); return; }

      setChallenge(d.challenge);
      setResendIn(d.resendInSec ?? 30);
      setDelivered(d.delivery === 'sent');
      setStep('otp');
      if (d.delivery !== 'sent') {
        setNotice(
          d.delivery === 'unconfigured'
            ? 'No SMS provider is connected, so no code was actually sent — this step cannot be completed yet.'
            : 'The SMS provider rejected the request. Try again shortly.'
        );
      } else if (resend) {
        setNotice('A new code is on its way.');
      }
    } catch {
      setError('Network problem — please try again.');
    } finally {
      setBusy(false);
    }
  };

  // undefined = first pass (go collect an email); null = customer skipped the
  // email; string = email supplied. `verify('')` used to mean "skip", but ''
  // is falsy, so the check below sent the customer straight back to the email
  // step — sign-in was unfinishable without typing an address.
  const verify = async (withEmail?: string | null) => {
    setBusy(true); setError(null);
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ challenge, code: digits.join(''), email: withEmail ?? null }),
      });
      const d = await r.json();
      if (!d.ok) {
        setError(d.message || 'That did not work.');
        if (d.reason === 'expired' || d.reason === 'too_many_attempts') setStep('phone');
        return;
      }
      if (withEmail === undefined) { setStep('email'); return; }
      onSignedIn(d.user);
      onClose();
    } catch {
      setError('Network problem — please try again.');
    } finally {
      setBusy(false);
    }
  };

  const setDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus();
  };

  const field =
    'w-full border border-[var(--line-strong)] bg-[var(--bg)] px-4 py-3 text-sm focus:border-[var(--ink)] focus:outline-none';
  const primary =
    'w-full bg-[var(--ink)] py-3.5 text-[10px] uppercase tracking-[0.2em] text-[var(--bg)] transition-colors hover:bg-[var(--accent)] disabled:opacity-45';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--ink-deep)]/75" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to Label by Rasika"
        className="relative grid w-full max-w-3xl overflow-hidden bg-[var(--bg)] shadow-2xl md:grid-cols-2"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 p-2 text-[var(--muted)] transition-colors hover:text-[var(--ink)] md:text-[var(--bg)]/70 md:hover:text-[var(--bg)]"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Brand panel */}
        <div className="hidden flex-col justify-between bg-[var(--ink)] p-10 text-[var(--bg)] md:flex">
          <p className="font-serif text-lg tracking-[0.18em]">LABEL BY RASIKA</p>
          <p className="font-serif text-2xl font-light leading-snug">
            Ready to wear, and made to your measurements — from our Pune atelier.
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--bg)]/55">
            Chandrarang Park · Pimple Gurav
          </p>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          {step !== 'phone' && (
            <button
              onClick={() => { setStep('phone'); setError(null); setNotice(null); }}
              className="mb-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
          )}

          {step === 'phone' && (
            <form onSubmit={(e) => { e.preventDefault(); requestOtp(); }}>
              <h2 className="font-serif text-xl font-light">Login or sign up</h2>
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                We&rsquo;ll text you a verification code.
              </p>
              <label className="mt-6 block">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Mobile number
                </span>
                <div className="mt-2 flex">
                  <span className="flex items-center border border-r-0 border-[var(--line-strong)] px-3 text-sm text-[var(--muted)]">
                    +91
                  </span>
                  <input
                    ref={firstField}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Enter mobile number"
                    className={field}
                  />
                </div>
              </label>
              <button type="submit" disabled={busy || phone.length !== 10} className={`${primary} mt-6`}>
                {busy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : 'Continue'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
              <h2 className="font-serif text-xl font-light">Verify your number</h2>
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                {delivered
                  ? `Code sent to +91 ${phone}`
                  : `Enter the code for +91 ${phone}`}
              </p>
              <div className="mt-6 flex gap-3">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { boxes.current[i] = el; }}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    className="h-14 w-14 border border-[var(--line-strong)] text-center font-serif text-xl focus:border-[var(--ink)] focus:outline-none"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={busy || digits.join('').length !== OTP_LENGTH}
                className={`${primary} mt-6`}
              >
                {busy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : 'Verify'}
              </button>
              <button
                type="button"
                disabled={resendIn > 0 || busy}
                onClick={() => requestOtp(true)}
                className="mt-4 w-full text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-50"
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
              </button>
            </form>
          )}

          {step === 'email' && (
            <form onSubmit={(e) => { e.preventDefault(); verify(email); }}>
              <h2 className="font-serif text-xl font-light">Your email address</h2>
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                Linked to +91 {phone}. Optional — we use it for order updates only.
              </p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`${field} mt-6`}
              />
              <button type="submit" disabled={busy} className={`${primary} mt-6`}>
                {busy ? (
                  <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> Finish</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => verify(null)}
                className="mt-3 w-full text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                Skip for now
              </button>
            </form>
          )}

          {notice && (
            <p className="mt-5 flex items-start gap-2 border border-[var(--line)] bg-[var(--bg-soft)] p-3 text-[11px] leading-relaxed text-[var(--muted)]">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {notice}
            </p>
          )}
          {error && (
            <p className="mt-4 flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-800">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          <p className="mt-6 text-[10px] leading-relaxed text-[var(--muted)]">
            By continuing you agree to be contacted about your enquiry. We never share your number.
          </p>
        </div>
      </div>
    </div>
  );
};
