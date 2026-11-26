// TEMPORARY one-time import of US DOT truck parking data. Remove after use.
import { createClient } from '@libsql/client/web';
import rows from '../../data/dot-import.json';
import { US, CA, slugify } from '../../lib/regions.js';
export const prerender = false;
export async function GET({ url, locals }) {
  if (url.searchParams.get('key') !== '56ad3a6ad4ba') return new Response('Not found', { status: 404 });
  const e = locals?.runtime?.env ?? {};
  const client = createClient({ url: e.TURSO_DATABASE_URL, authToken: e.TURSO_AUTH_TOKEN });
  await client.execute('SELECT 1');
  const stmts = [];
  for (const r of rows) {
    const st = r.state.toUpperCase(), stateName = US[st] || CA[st];
    if (!stateName) continue;
    const lat = parseFloat(r.latitude), lng = parseFloat(r.longitude);
    const ok = Number.isFinite(lat) && Number.isFinite(lng);
    const tag = ok ? `${Math.abs(Math.round(lat * 1000))}${Math.abs(Math.round(lng * 1000))}` : '';
    const slug = slugify(`${r.name} ${r.city} ${st} ${tag}`);
    const spaces = r.spaces === '' ? null : parseInt(r.spaces, 10);
    stmts.push({ sql: 'INSERT OR IGNORE INTO stops (id,slug,name,country,state_province,state_name,city,highway,exit_number,address,latitude,longitude,total_spaces,is_free,is_24_7) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,1)',
      args: [slug, slug, r.name, CA[st] ? 'CA' : 'US', st, stateName, r.city, r.highway || null, null, null, ok ? lat : null, ok ? lng : null, spaces] });
  }
  let done = 0;
  for (let i = 0; i < stmts.length; i += 250) { await client.batch(stmts.slice(i, i + 250), 'write'); done += Math.min(250, stmts.length - i); }
  const c = await client.execute('SELECT COUNT(*) AS n FROM stops');
  return new Response(`Done. Processed ${done} rows. Stops in database now: ${c.rows[0].n}`, { headers: { 'content-type': 'text/plain' } });
}
