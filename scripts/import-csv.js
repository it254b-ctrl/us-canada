// Usage: node scripts/import-csv.js path/to/file.csv
// Header names are matched loosely (case-insensitive). Edit ALIASES if your file differs.
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { US, CA, slugify } from '../src/lib/regions.js';
const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/import-csv.js file.csv'); process.exit(1); }
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const ALIASES = {
  name: ['name', 'facility name', 'facility', 'truck stop name', 'site name'],
  city: ['city', 'town'], state: ['state', 'st', 'state_province', 'province'],
  address: ['address', 'street address', 'street'], lat: ['latitude', 'lat', 'y'], lng: ['longitude', 'lon', 'lng', 'long', 'x'],
  spaces: ['spaces', 'total_spaces', 'truck parking spaces', 'parking spaces', 'truck spaces'],
  highway: ['highway', 'route', 'road', 'interstate'], exit: ['exit', 'exit_number', 'exit number'],
};
function parse(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some((v) => v.trim())) rows.push(row); row = []; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
const [head, ...body] = parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const idx = (k) => head.findIndex((h) => ALIASES[k].includes(h.trim().toLowerCase()));
const col = Object.fromEntries(Object.keys(ALIASES).map((k) => [k, idx(k)]));
for (const k of ['name', 'city', 'state']) if (col[k] < 0) { console.error(`Missing a "${k}" column. Headers found: ${head.join(', ')}`); process.exit(1); }
const get = (r, k) => (col[k] >= 0 ? (r[col[k]] ?? '').trim() : '');
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const stmts = []; let skipped = 0;
for (const r of body) {
  const name = get(r, 'name'), city = get(r, 'city'), st = get(r, 'state').toUpperCase();
  const stateName = US[st] || CA[st];
  if (!name || !city || !stateName) { skipped++; continue; }
  const lat = num(get(r, 'lat')), lng = num(get(r, 'lng'));
  const tag = lat != null ? `${Math.abs(Math.round(lat * 1000))}${Math.abs(Math.round(lng * 1000))}` : slugify(get(r, 'address')).slice(0, 12);
  const slug = slugify(`${name} ${city} ${st} ${tag}`);
  stmts.push({ sql: `INSERT OR IGNORE INTO stops (id,slug,name,country,state_province,state_name,city,highway,exit_number,address,latitude,longitude,total_spaces) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [slug, slug, name, CA[st] ? 'CA' : 'US', st, stateName, city, get(r, 'highway') || null, get(r, 'exit') || null, get(r, 'address') || null, lat, lng, num(get(r, 'spaces'))] });
}
let done = 0;
for (let i = 0; i < stmts.length; i += 500) { await client.batch(stmts.slice(i, i + 500), 'write'); done += Math.min(500, stmts.length - i); console.log(`Imported ${done}/${stmts.length}`); }
console.log(`Done. Skipped ${skipped} rows (missing name, city or a valid US/CA state).`);
