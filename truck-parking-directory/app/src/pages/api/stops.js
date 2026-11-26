import { query, filterSql, ORDER } from '../../lib/db.js';
export async function GET({ url, locals }) {
  const term = (url.searchParams.get('q') || '').trim().slice(0, 60);
  const like = `%${term}%`;
  const sql = `SELECT * FROM stops WHERE (name LIKE ? OR city LIKE ? OR state_province LIKE ? OR state_name LIKE ? OR highway LIKE ?)${filterSql(url.searchParams.get('f'))}${ORDER} LIMIT 30`;
  const rows = await query(locals, sql, [like, like, like, like, like]);
  return Response.json(rows, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
