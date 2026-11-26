import { query } from '../../lib/db.js';
const clean = (v, n = 300) => (v == null ? null : String(v).trim().slice(0, n) || null);
export async function POST({ request, locals }) {
  let d;
  try { d = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (d.website) return Response.json({ ok: true }); // honeypot
  const name = clean(d.business_name), email = clean(d.contact_email), city = clean(d.city), st = clean(d.state_province, 3);
  if (!name || !email || !city || !st || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: 'Business name, valid email, city and state or province are required.' }, { status: 400 });
  const spaces = parseInt(d.total_spaces, 10);
  await query(locals, 'INSERT INTO submissions (business_name, contact_email, phone, city, state_province, highway, total_spaces, wants_featured, notes) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, email, clean(d.phone, 40), city, st.toUpperCase(), clean(d.highway, 40), Number.isFinite(spaces) ? spaces : null, d.wants_featured ? 1 : 0, clean(d.notes, 1000)]);
  return Response.json({ ok: true });
}
