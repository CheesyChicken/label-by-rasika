/** POST /api/auth/sign-out — clears the session cookie. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false });
    return;
  }
  res.setHeader('Set-Cookie', 'lbr_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  res.status(200).json({ ok: true });
}
