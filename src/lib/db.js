import { createClient } from '@libsql/client/web';
import { FILTERS } from './regions.js';
export async function query(locals, sql, args = []) {
  const e = locals?.runtime?.env ?? {};
  const client = createClient({
    url: e.TURSO_DATABASE_URL ?? import.meta.env.TURSO_DATABASE_URL,
    authToken: e.TURSO_AUTH_TOKEN ?? import.meta.env.TURSO_AUTH_TOKEN,
  });
  const r = await client.execute({ sql, args });
  return r.rows.map((row) => Object.fromEntries(r.columns.map((c) => [c, row[c]])));
}
export const filterSql = (key) => (FILTERS[key] ? ` AND ${FILTERS[key][0]} = 1` : '');
export const ORDER = ' ORDER BY is_featured DESC, total_spaces DESC, name ASC';
