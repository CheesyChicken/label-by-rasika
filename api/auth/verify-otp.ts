/**
 * POST /api/auth/verify-otp   { challenge, code, email? }
 *
 * Checks a submitted code against the signed challenge from request-otp and,
 * on success, issues a signed session token.
 *
 * The challenge is verified by recomputing its HMAC, so a tampered payload —
 * a stretched expiry, a swapped phone number — fails signature before anything
 * else is read. The code itself is compared with a timing-safe equality check.
 */

import crypto from 'node:crypto';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_ATTEMPTS = 5;

/** challenge signature -> attempts used. Best-effort within a warm instance. */
const attempts = new Map<string, number>();

const b64 = (b: Buffer) => b.toString('base64url');

function verifySigned(token: string, secret: string): any | null {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = b64(crypto.createHmac('sha256', secret).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function signSession(payload: object, secret: string): string {
  const body = b64(Buffer.from(JSON.stringify(payload)));
  const sig = b64(crypto.createHmac('sha256', secret).update(body).digest());
  return `${body}.${sig}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    res.status(503).json({ ok: false, reason: 'not_configured' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
  const { challenge, code, email } = body as { challenge?: string; code?: string; email?: string };

  const payload = verifySigned(challenge ?? '', secret);
  if (!payload) {
    res.status(400).json({ ok: false, reason: 'bad_challenge', message: 'Start again — that request is not valid.' });
    return;
  }
  if (Date.now() > Number(payload.expiresAt)) {
    res.status(400).json({ ok: false, reason: 'expired', message: 'That code has expired. Request a new one.' });
    return;
  }

  const sigKey = String(challenge).split('.')[1] ?? '';
  const used = attempts.get(sigKey) ?? 0;
  if (used >= MAX_ATTEMPTS) {
    res.status(429).json({ ok: false, reason: 'too_many_attempts', message: 'Too many attempts. Request a new code.' });
    return;
  }
  attempts.set(sigKey, used + 1);

  const submitted = String(code ?? '').replace(/\D/g, '');
  const candidate = crypto
    .createHash('sha256')
    .update(`${payload.phone}:${submitted}:${secret}`)
    .digest('base64url');

  const a = Buffer.from(candidate);
  const b = Buffer.from(String(payload.codeHash));
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    res.status(401).json({
      ok: false,
      reason: 'wrong_code',
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - used - 1),
      message: 'That code is not right.',
    });
    return;
  }

  attempts.delete(sigKey);

  const cleanEmail =
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
      ? email.trim().toLowerCase()
      : undefined;

  const session = signSession(
    { phone: payload.phone, email: cleanEmail, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS },
    secret
  );

  // httpOnly so page scripts cannot read it; SameSite=Lax so it survives a
  // normal navigation but is not sent on cross-site requests.
  res.setHeader(
    'Set-Cookie',
    `lbr_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.round(
      SESSION_TTL_MS / 1000
    )}`
  );

  res.status(200).json({
    ok: true,
    // Only what the UI needs to greet them — never the token itself.
    user: { phone: payload.phone, email: cleanEmail ?? null },
  });
}
