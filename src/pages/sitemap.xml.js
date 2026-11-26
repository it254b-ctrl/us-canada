import { ALL, citySlug } from '../lib/regions.js';
import { query } from '../lib/db.js';
export async function GET({ url, locals }) {
  const rows = await query(locals, 'SELECT slug, city, state_province FROM stops');
  const regionCodes = new Set(rows.map((r) => r.state_province));
  const cities = new Set(rows.map((r) => citySlug(r.city, r.state_province)));
  const u = [url.origin + '/', url.origin + '/list-your-lot',
    ...ALL.filter((r) => regionCodes.has(r.code)).map((r) => `${url.origin}/region/${r.slug}`),
    ...[...cities].map((c) => `${url.origin}/city/${c}`),
    ...rows.map((r) => `${url.origin}/stop/${r.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${u.map((l) => `<url><loc>${l}</loc></url>`).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
}
