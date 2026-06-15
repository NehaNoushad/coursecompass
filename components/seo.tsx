/**
 * Seo — a thin wrapper over expo-router's <Head> that sets a page's
 * title, meta description, canonical URL, and Open Graph / Twitter tags
 * in one place. Because the site is statically rendered (app.json
 * `web.output: "static"`), these end up in the real HTML each crawler
 * receives — so every route can have a unique, descriptive title.
 *
 * Usage: drop <Seo title="…" description="…" path="/colleges" /> at the
 * top of a screen's render.
 */

import Head from 'expo-router/head';

import { APP_NAME, APP_TAGLINE, SITE_URL } from '@/constants/app';

interface Props {
  /** Page title. ` | Paper Plane` is appended automatically unless already present. */
  title: string;
  /** Meta + OG description. Falls back to the app tagline. */
  description?: string;
  /** Path portion of the canonical URL, e.g. "/colleges/cusat". Defaults to site root. */
  path?: string;
  /** og:type — "website" for listings, "article" for detail pages. */
  type?: 'website' | 'article';
  /** Keep this page out of the index (account, sign-in). */
  noindex?: boolean;
}

export function Seo({ title, description, path = '', type = 'website', noindex }: Props) {
  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;
  const desc = description ?? APP_TAGLINE;
  const url = `${SITE_URL}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Head>
  );
}
