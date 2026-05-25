# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Phases 1–5 complete.** Foundation, full discovery experience (catalogues + detail pages + 6-step quiz), Supabase phone/Google auth + 10-minute browse gate, signed-in dashboard with quiz history, mobile UI pass, and the sky-theme design system (paper-plane / cyan-azure gradient / Sora display + Caveat handwritten accent — chosen from prototype 4) ported to every page. Seed data: 394 colleges, 181 courses, 37 exams, 20 categories. Live on Vercel.

Next: **Phase 6 — monetization (2027 only)**. Wire Razorpay + automated PDF report generation + unique-code redemption. Until then 2026 stays entirely free; the paywall structure is built but inactive.

## Commands

```
npm run web      # start the web dev server (localhost:8081) — primary dev target
npm run start    # start Metro with the platform picker
npm run ios      # run on iOS simulator
npm run android  # run on Android emulator
npm run lint     # ESLint (expo lint)
npx tsc --noEmit # TypeScript type-check
```

There is no test runner configured yet. Verify changes with `npx tsc --noEmit`, `npm run lint`, and by loading the affected route on the web server.

## Collaboration

Two non-technical collaborators work on this repo through Claude Code:
**NehaNoushad** (owner) and **nairah373**. Both push directly to `main` — no
branches or pull requests.

To keep their work from colliding, follow this discipline every session:
- **Start of session:** run `git pull` before making any edits, so the local
  copy has the other person's latest work.
- **End of session:** `git commit` and `git push` so the other person can pull
  it. Don't leave finished work uncommitted.
- Only one person edits at a time — they coordinate timing between themselves.
- If a `git pull` ever reports a merge conflict, resolve it (don't discard
  either side's work) before continuing.

## Project structure

- `app/` — Expo Router file-based routes. `_layout.tsx` is the root Stack (headers hidden — the app draws its own `SiteHeader`). Routes: `/` (home), `/colleges` + `/colleges/[id]`, `/courses` + `/courses/[id]`, `/quiz`. The `/colleges` catalogue reads optional `?category=` / `?district=` query params as initial filter state.
- `lib/` — non-UI logic. `recommend.ts` is the quiz recommendation engine: pure functions that score courses/colleges against `QuizAnswers` and attach human-readable reasons.
- `components/ui/` — design-system primitives: `Text` (variant-based typography), `Button`/`LinkButton`, `Card`, `Screen`.
- `components/site-header.tsx` — top nav, rendered by `Screen`.
- `constants/theme.ts` — all design tokens (`colors`, `spacing`, `radius`, `fontSize`, `fontWeight`, `layout`) plus `navigationTheme`. Anything visual must reference these, not hardcoded values.
- `constants/app.ts` — app metadata. `APP_NAME` is the brand placeholder — change it here only.
- `types/index.ts` — shared domain types (`College`, `Course`, `Exam`, `District`, etc.), shaped to match the planned Supabase tables.
- `data/` — the seed dataset (`colleges.ts`, `courses.ts`, `exams.ts`, `course-categories.ts`) and `index.ts`, the barrel + lookup helpers (`getCoursesForStream`, `getCollegesForCategory`, etc.). `data/index.ts` is the single source of truth for the catalogue and quiz; when Supabase lands, these helpers become the query layer and call sites should not change.
- `@/*` path alias maps to the project root (see `tsconfig.json`).

## Conventions

- **Light mode only** for now — there is no dark theme; do not add one without a reason.
- Every page wraps its content in `<Screen>`, which provides the header, vertical scroll, and max-width centring for desktop web.
- Use the `Text` component (with a `variant`) instead of React Native's raw `Text`.
- Typed routes are on (`app.json` → `experiments.typedRoutes`); route strings are type-checked.

## What this is

A course- and college-discovery web/mobile product for Indian students who have finished Class 12 ("12th pass"). Launch market is **Kerala**; later expansion to the rest of India.

Two separate products share a strategy:
- **Product 1 (this repo):** discovery site — a guided quiz plus a browsable/filterable catalogue of colleges and courses. Monetized (from 2027) by a one-time paid personalised PDF report; buying it issues a unique code.
- **Product 2 (future, separate repo):** a subscription "Student Dashboard" mobile app (application tracker + deadline alerts). The Product 1 unique code unlocks a discount on it.

Build Product 1 so the unique-code system and shared UI components can carry over to Product 2.

## Stack decisions (locked)

- **Expo / React Native** — one codebase targeting web (now) and iOS/Android (later). Chosen over Flutter for SEO and JS hiring pool.
- **Expo Router** — file-based routing; matters for web SEO on a discovery site that depends on Google traffic.
- **TypeScript**.
- **Supabase** (planned) — Postgres database, phone-OTP auth, and an admin panel the non-technical founder can use to edit college data without code. Not yet set up; until then, data lives in typed seed files structured for a clean Supabase migration.
- **Vercel** (planned) — hosting for the web export.
- **Razorpay** (planned, 2027 only) — payments. Do NOT treat payments as a blocker; it is the final phase.

## Build phases

1. Foundation — Expo + Expo Router scaffold; data schema; load college/course/exam seed data.
2. Discovery — browsable catalogue with filters (course, district, exam, fee band) + the quiz.
3. Accounts — free browsing for ~10 minutes, then a soft signup gate; phone-OTP signup.
4. Teaser result — quiz result screen showing roughly half free, half locked.
5. Free beta launch — SEO, mobile layout, deploy to Vercel.
6. *(2027)* Monetization — Razorpay + automated PDF report + unique-code generation.

## Product rules that affect implementation

- **2026 = entirely free.** Build the paywall structure but keep it inactive; monetization switches on in 2027.
- **Paywall model:** the quiz is free; the on-screen result is ~half free / half locked; the full downloadable PDF report is the paid unlock.
- **Quiz inputs** that drive recommendations: 12th stream + marks, district preference, budget/fee band, interests & career goals, and which entrance exams the student has attempted.
- **English only** at launch.
- **Account gate:** no account needed to browse for the first ~10 minutes; account required after that and to purchase.
- **Report generation is fully automated** — generated instantly from quiz answers, no manual step per sale.

## Data

- Source material: the ~297 Kerala colleges list and the "Courses After 12th" catalogue gathered earlier in the project (see conversation history; PDFs may not be in the repo).
- College records need at minimum: **district**, **type** (government / aided / private/self-financing), **course categories offered**, and a **fee band** (Low / Medium / High). Exact per-college fees are not reliably public for all 297 — use fee bands, not invented exact figures; the founder refines real numbers later via the Supabase admin panel.
- Entrance exams: scope is the 37 Kerala-relevant exams (engineering, medical/allied, architecture, agriculture, law, management/general UG, design, hotel management, science/research, defence, polytechnic, education). Exams must map to the courses they unlock and the colleges that accept them.
- **Per-college courses:** a college may carry an explicit `courses` list (course ids it actually offers). `getCoursesForCollege` returns `confirmed: true` for these; colleges without a list fall back to category-level display (`confirmed: false`) with an honest "exact programmes not confirmed" disclaimer. `getCollegesForCourse` is the inverse lookup. Engineering colleges have researched `courses`; other categories are still on fallback and get populated progressively.

## Working with the founder

The founder is non-technical and runs the business side. Explain technical trade-offs in plain language; prefer admin-editable data (Supabase panel) over code edits; give setup checklists rather than assuming prior knowledge.
