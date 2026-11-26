// TEMPORARY one-time import of OpenStreetMap truck parking (Canada). Remove after use.
import { createClient } from '@libsql/client/web';
import canada from '../../data/osm-canada.json';
import { US, CA, slugify } from '../../lib/regions.js';
export const prerender = false;
export async function GET({ url, locals }) {
  if (url.searchParams.get('key') !== '56ad3a6ad4ba') return new Response('Not found', { status: 404 });
  const e = locals?.runtime?.env ?? {};
  const client = createClient({ url: e.TURSO_DATABASE_URL, authToken: e.TURSO_AUTH_TOKEN });
  const stmts = [];
  for (const r of canada) {
    const stateName = CA[r.state] || US[r.state];
    if (!stateName) continue;
    const tag = `${Math.abs(Math.round(r.lat * 10000))}${Math.abs(Math.round(r.lng * 10000))}`;
    const slug = slugify(`${r.name} ${r.city} ${r.state} ${tag}`);
    stmts.push({ sql: 'INSERT OR IGNORE INTO stops (id,slug,name,country,state_province,state_name,city,highway,exit_number,address,latitude,longitude,total_spaces,is_free,has_showers,has_diesel,is_24_7) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)',
      args: [slug, slug, r.name, CA[r.state] ? 'CA' : 'US', r.state, stateName, r.city, null, null, null, r.lat, r.lng, r.spaces, r.free ? 1 : 0, r.shower ? 1 : 0, r.diesel ? 1 : 0] });
  }
  let done = 0;
  for (let i = 0; i < stmts.length; i += 250) { await client.batch(stmts.slice(i, i + 250), 'write'); done += Math.min(250, stmts.length - i); }
  const c = await client.execute('SELECT COUNT(*) AS n FROM stops');
  return new Response(`Done. Processed ${done} Canadian rows. Stops in database now: ${c.rows[0].n}`, { headers: { 'content-type': 'text/plain' } });
}
