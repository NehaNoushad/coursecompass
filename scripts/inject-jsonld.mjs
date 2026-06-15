/**
 * Post-export step: inject schema.org JSON-LD into the static HTML.
 * Runs after `expo export` (see vercel.json buildCommand). Expo's <Head>
 * serializes title/meta/link but drops <script> tags, so structured data
 * has to be stitched into the exported pages here instead.
 *
 *   /                  → WebSite + Organization
 *   /colleges/<id>     → CollegeOrUniversity
 *   /courses/<id>      → Course
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(root + p, 'utf8');
const appTs = read('constants/app.ts');
const SITE_URL = appTs.match(/SITE_URL\s*=\s*'([^']+)'/)[1].replace(/\/$/, '');
const APP_NAME = appTs.match(/APP_NAME\s*=\s*'([^']+)'/)[1];
const APP_TAGLINE = appTs.match(/APP_TAGLINE\s*=\s*\n?\s*'([^']+)'/)?.[1] ?? '';

// ── Parse seed records into id → fields maps ──────────────────────────
function parseColleges() {
  const map = {};
  for (const line of read('data/colleges.ts').split('\n')) {
    const id = line.match(/\bid:\s*'([^']+)'/)?.[1];
    if (!id || !/^\s*\{/.test(line)) continue;
    map[id] = {
      name: line.match(/name:\s*'(.+?)',\s*district/)?.[1],
      district: line.match(/district:\s*'([^']+)'/)?.[1],
      type: line.match(/type:\s*'([^']+)'/)?.[1],
      website: line.match(/website:\s*'([^']+)'/)?.[1] ?? null,
    };
  }
  return map;
}
function parseCourses() {
  const map = {};
  for (const line of read('data/courses.ts').split('\n')) {
    const id = line.match(/\bid:\s*'([^']+)'/)?.[1];
    if (!id || !/^\s*\{/.test(line)) continue;
    map[id] = { name: line.match(/name:\s*'(.+?)',\s*categoryId/)?.[1] };
  }
  return map;
}

const TYPE_WORD = { government: 'government', aided: 'aided', private: 'private/self-financing' };

function scriptTag(obj) {
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
function inject(relPath, obj) {
  const p = root + relPath;
  if (!existsSync(p)) return false;
  let html = readFileSync(p, 'utf8');
  if (html.includes('application/ld+json')) return false; // idempotent
  html = html.replace('</head>', `${scriptTag(obj)}</head>`);
  writeFileSync(p, html);
  return true;
}

const colleges = parseColleges();
const courses = parseCourses();
let n = 0;

// Home
if (
  inject('dist/index.html', [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: APP_NAME, url: SITE_URL, description: APP_TAGLINE },
    { '@context': 'https://schema.org', '@type': 'Organization', name: APP_NAME, url: SITE_URL },
  ])
)
  n++;

// Colleges
for (const f of readdirSync(root + 'dist/colleges')) {
  if (!f.endsWith('.html') || f === 'index.html' || f.startsWith('[')) continue;
  const id = f.replace(/\.html$/, '');
  const c = colleges[id];
  if (!c || !c.name) continue;
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: c.name,
    url: `${SITE_URL}/colleges/${id}`,
    description: `${c.name} is a ${TYPE_WORD[c.type] ?? c.type} college in ${c.district}, Kerala.`,
    address: { '@type': 'PostalAddress', addressLocality: c.district, addressRegion: 'Kerala', addressCountry: 'IN' },
    ...(c.website ? { sameAs: [c.website] } : {}),
  };
  if (inject(`dist/colleges/${f}`, obj)) n++;
}

// Courses
for (const f of readdirSync(root + 'dist/courses')) {
  if (!f.endsWith('.html') || f === 'index.html' || f.startsWith('[')) continue;
  const id = f.replace(/\.html$/, '');
  const c = courses[id];
  if (!c || !c.name) continue;
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.name,
    url: `${SITE_URL}/courses/${id}`,
    description: `${c.name} — eligibility, entrance exams, and Kerala colleges that offer it.`,
    provider: { '@type': 'Organization', name: APP_NAME, url: SITE_URL },
  };
  if (inject(`dist/courses/${f}`, obj)) n++;
}

console.log(`JSON-LD injected into ${n} pages`);
