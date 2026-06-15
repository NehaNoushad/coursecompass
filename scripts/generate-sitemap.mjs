/**
 * Generates public/sitemap.xml + public/robots.txt from the seed data.
 * Run automatically before `expo export` (see vercel.json buildCommand)
 * so the sitemap always lists every college + course page. The `public/`
 * directory is copied to the export root, so these land at /sitemap.xml
 * and /robots.txt.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(root + p, 'utf8');

// SITE_URL is the single source of truth in constants/app.ts.
const siteUrl = read('constants/app.ts').match(/SITE_URL\s*=\s*'([^']+)'/)[1].replace(/\/$/, '');

// Each record line starts with `id: '...'`; arrays inside use bare strings,
// so this only matches record ids.
const ids = (file) => [...read(file).matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]);
const collegeIds = ids('data/colleges.ts');
const courseIds = ids('data/courses.ts');

const staticRoutes = ['/', '/colleges', '/courses', '/quiz', '/feedback'];
const urls = [
  ...staticRoutes,
  ...collegeIds.map((id) => `/colleges/${id}`),
  ...courseIds.map((id) => `/courses/${id}`),
];

const today = new Date().toISOString().slice(0, 10);
const body = urls
  .map(
    (u) =>
      `  <url>\n    <loc>${siteUrl}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`,
  )
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const robots = `# https://www.sitemaps.org/protocol.html\nUser-agent: *\nAllow: /\nDisallow: /account\nDisallow: /signin\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

mkdirSync(root + 'public', { recursive: true });
writeFileSync(root + 'public/sitemap.xml', xml);
writeFileSync(root + 'public/robots.txt', robots);
console.log(`sitemap.xml: ${urls.length} URLs (${collegeIds.length} colleges, ${courseIds.length} courses) · robots.txt written`);
