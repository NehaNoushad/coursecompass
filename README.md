# Paper Plane

A course- and college-discovery web app for Indian students who have finished
Class 12. Launch market is **Kerala**; the catalogue covers 394 colleges and
181 courses across all 14 districts.

Live: <https://paper-plane-phi.vercel.app>

## What it does

- Browse colleges by district, course, type, fees.
- Browse courses by stream + entrance exam.
- Take a 6-question quiz and get matched to courses + colleges.
- Sign in (Google or email magic link) to save your results.

## Run it locally

```bash
npm install --legacy-peer-deps
npm run web        # starts the web dev server on localhost:8081
```

Other targets: `npm run ios`, `npm run android`, `npm run start` (Metro picker).
Type-check + lint: `npx tsc --noEmit && npm run lint`.

## Stack

Expo Router + React Native + TypeScript on web (Vercel) + Supabase (auth, db).
See **[CLAUDE.md](./CLAUDE.md)** for the full project map — phases, conventions,
file structure, data model, and the working agreement between the two non-
technical collaborators on this repo.

## Repo layout (quick)

- `app/` — Expo Router file-based routes (`/`, `/colleges`, `/courses`, `/quiz`, `/signin`, `/account`, plus detail pages).
- `components/` — `sky-*` design-system pieces + `ui/` primitives + shared cards.
- `data/` — seed dataset (colleges, courses, exams, categories) — single source of truth until the Supabase admin panel lands.
- `lib/` — non-UI logic (recommendation engine, auth provider, browse-gate timer, supabase client).
- `constants/theme.ts` — every design token. Reference it; never hardcode values.
- `design_prototypes/` — throwaway static HTML/CSS sketches kept as design reference; one folder per page.
- `docs/` — phone-survey checklist, Supabase schema, deployment notes.
