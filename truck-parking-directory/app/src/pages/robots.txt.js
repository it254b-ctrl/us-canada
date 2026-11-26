export const GET = ({ url }) => new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain' } });
