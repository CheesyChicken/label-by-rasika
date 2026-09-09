/**
 * POST /api/auth/request-otp   { phone: "9876543210" }
 *
 * Issues a one-time code for a mobile number and returns a signed challenge.
 *
 * SECURITY NOTES
 * - The code is NEVER returned to the browser. The response carries only an
 *   HMAC-signed challenge binding {phone, hash(code), expiry}; the server can
 *   verify a later submission without storing anything, which matters because
 *   this deployment has no database.
 * - Signing requires AUTH_SECRET. Without it the endpoint refuses rather than
 *   falling back to something guessable.
 * - Delivery is pluggable. With no SMS provider configured the endpoint reports
 *   `delivery: "unconfigured"` and the UI says sign-in is not switched on yet —
 *   it does not pretend to have sent anything.
 */

import crypto from 'node:crypto';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

/** phone -> last issue time. Best-effort throttle within a warm instance. */
const lastIssued = new Map<string, number>();

const b64 = (b: Buffer) => b.toString('base64url');

export function signChallenge(payload: object, secret: string): string {
  const body = b64(Buffer.from(JSON.stringify(payload)));
  const sig = b64(crypto.createHmac('sha256', secret).update(body).digest());
  return `${body}.${sig}`;
}

export function normalisePhone(raw: unknown): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  // Indian mobile numbers are 10 digits starting 6-9.
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

async function sendSms(phone: string, code: string): Promise<'sent' | 'unconfigured' | 'failed'> {
  const { MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM } = process.env;

  if (MSG91_AUTH_KEY && MSG91_TEMPLATE_ID) {
    try {
      const r = await fetch(
        `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}` +
          `&mobile=91${phone}&otp=${code}`,
        { method: 'POST', headers: { authkey: MSG91_AUTH_KEY } }
      );
      return r.ok ? 'sent' : 'failed';
    } catch {
      return 'failed';
    }
  }

  if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
    try {
      const body = new URLSearchParams({
        To: `+91${phone}`,
        From: TWILIO_FROM,
        Body: `${code} is your Label by Rasika verification code. It expires in 5 minutes.`,
      });
      const r = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
          },
          body,
        }
      );
      return r.ok ? 'sent' : 'failed';
    } catch {
      return 'failed';
    }
  }

  return 'unconfigured';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    res.status(503).json({
      ok: false,
      reason: 'not_configured',
      message: 'Sign-in is not switched on yet — AUTH_SECRET is not set.',
    });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
  const phone = normalisePhone(body.phone);
  if (!phone) {
    res.status(400).json({ ok: false, reason: 'bad_phone', message: 'Enter a valid 10-digit Indian mobile number.' });
    return;
  }

  const since = Date.now() - (lastIssued.get(phone) ?? 0);
  if (since < RESEND_COOLDOWN_MS) {
    res.status(429).json({
      ok: false,
      reason: 'cooldown',
      retryAfter: Math.ceil((RESEND_COOLDOWN_MS - since) / 1000),
      message: 'Please wait before requesting another code.',
    });
    return;
  }

  const code = String(crypto.randomInt(1000, 10000));
  const expiresAt = Date.now() + OTP_TTL_MS;
  const codeHash = crypto.createHash('sha256').update(`${phone}:${code}:${secret}`).digest('base64url');
  const challenge = signChallenge({ phone, codeHash, expiresAt }, secret);

  const delivery = await sendSms(phone, code);
  lastIssued.set(phone, Date.now());

  res.status(200).json({
    ok: delivery === 'sent',
    delivery,
    challenge,
    expiresInSec: Math.round(OTP_TTL_MS / 1000),
    resendInSec: Math.round(RESEND_COOLDOWN_MS / 1000),
    message:
      delivery === 'sent'
        ? 'Code sent.'
        : delivery === 'unconfigured'
        ? 'No SMS provider is configured, so no code was sent.'
        : 'The SMS provider rejected the request.',
  });
}
