# Design prototypes

Static design exploration — **not production code, not wired to the real app**. These are throwaway HTML/CSS/JS sketches to test direction before committing to a look-and-feel in the real React Native build.

## How to view

Open any HTML file directly in your browser:

```
open design_prototypes/home/4prototype.html
```

No build step. No server. Self-contained.

## Folder structure

Prototypes are grouped by the page they're designing. Each page has its own folder. Most pages get 2 prototypes (`Aprototype.html` and `Bprototype.html`); the home page round had 4. The ones currently live in the real app are noted as **chosen**.

```
design_prototypes/
├── home/             — 4 directions for the marketing home page
├── colleges/         — 2 directions for /colleges (catalogue)
├── college-detail/   — 2 directions for /colleges/[id]
├── courses/          — 2 directions for /courses (catalogue)
├── course-detail/    — 2 directions for /courses/[id]
├── quiz/             — 2 directions for /quiz
├── signin/           — 2 directions for /signin
└── account/          — 2 directions for /account
```

---

## `home/` — the marketing landing page

The original round: pick a visual personality for the brand. **Prototype 4 was chosen** and is now live; 1-3 are kept as reference for the directions not taken.

- **`home/1prototype.html`** — *sky as a day-arc.* Sunrise gradient hero with floating clouds, scroll-driven section reveals, animated stat counters, gradient course tiles, twilight closing CTA. Bold Space Grotesk display type with Inter body. **Warm, cinematic, gradient-heavy. Apple-ish.**

- **`home/2prototype.html`** — *sky as an aerial chart.* Parchment paper, navy chart ink, coral pin colour. Editorial italic-serif headlines (Fraunces) + mono coordinate labels (JetBrains Mono). Asymmetric grid, rotating compass roses, dotted route lines that draw themselves on scroll, "you are here" coordinates that echo your cursor, course tiles laid out as pins on a chart. **Editorial, disciplined, type-driven. Leans into the *compass* half of the brand.**

- **`home/3prototype.html`** — *sky as coastal dusk.* Sunset over the Arabian Sea palette (deep indigo → magenta → coral → reflected water). Instrument Serif italic display type. Hero with a setting sun, floating bokeh, shimmering horizon line. Cinematic full-bleed panels (alternating left/right) each with a CSS-mockup of the relevant feature — quiz, catalogue, compare. Closes on a moonlit night sky with a faint coral horizon hinting at tomorrow. **Quieter, more romantic, more Kerala-rooted than #1. Same gradient-cinematic family but a different time of day and a different page rhythm.**

- **`home/4prototype.html`** — *sky as a bright clear-blue day.* Cyan to azure gradient, big puffy clouds, small yellow sun, and a paper plane as the recurring motif (brand mark, hero mascot, and it "arrives" at the closing CTA). Sora display type (round, friendly, modern) with one handwritten Caveat accent for personality. Cloud-shaped feature cards on a pale-sky background. How-it-works steps connected by a dotted flight path that draws itself on scroll. **Playful, optimistic, mid-day energy — distinct from the cinematic #1 and the romantic #3 by personality, even though it shares the gradient-sky DNA.** **Chosen — now live on the home page.**

---

## `colleges/` — the catalogue (`/colleges`)

The current /colleges before this round was a linear top-to-bottom utility: title → search → 4 dropdowns → list. **Prototype 6 was chosen** and is now live.

- **`colleges/5prototype.html`** — *Atlas. Spatial / map-led.* Kerala's 14 districts as a vertical N → S strip on the left, each with a click target and a result count — the abstracted "map" that the sky-deep-to-coral arc echoes. Course / Type / Fees as chip groups underneath. Right side is a 2-column tile grid; each tile has a thin district-coloured ribbon at the top, the college name in Sora display, and pill rows for type + fees. The page is structured around *where*, with *what / which* as secondary filters. **Browsing geography-first.**

- **`colleges/6prototype.html`** — *Editorial. Magazine spread.* Short sky-gradient hero strip up top with a paper-plane brand mark, a paper-textured eyebrow chip, and a big "Browse 394 colleges" headline with a coral number — looks like the cover of a publication. Sticky filter panel on the left (continuous search + radio rows + multi-select district chips, one panel instead of four dropdowns). Magazine-style 2-column card grid on the right; each card has its own coloured gradient header (district + type) with a cloud puff, big name in Sora, a one-line tagline, and a tri-column stat strip (courses / seats / fee band). **Browsing as reading.** **Chosen — now live on /colleges.**

---

## `college-detail/` — single college page (`/colleges/[id]`)

Sample college used throughout: Sacred Heart College Thevara (Ernakulam, Aided, Medium fees, NAAC A++, NIRF #57, Est. 1944).

- **`college-detail/Aprototype.html`** — *Profile.* Utility-first detail page with a sky-gradient hero carrying the college name and accreditation pills, a sticky left table-of-contents sidebar that mirrors the catalogue's filter sidebar, and a sequence of labelled white section cards covering Overview, Programmes (expandable by category), Fees (table with quota rows), Admissions, and Contact — closes with a sky-gradient quiz CTA card. **Disciplined, scannable, easy to update.**

- **`college-detail/Bprototype.html`** — *Brochure.* Magazine-editorial detail page with a taller (~500px) deeply layered sky hero (sun-glow orb, cloud puffs, large paper-plane decoration, floating cover-line stat pills), a wide narrative left column using editorial typography, a pull-quote treatment, and horizontal-scroll course pill rows per category, paired with a sticky right sidebar stack of four info cards (At a glance / Contact / Fees / Shortlist preview). **Reads like a printed college brochure rather than a database page.**

---

## `courses/` — the courses catalogue (`/courses`)

Mirrors the structure choice for /colleges but for the 181 courses available after 12th.

- **`courses/Aprototype.html`** — *Editorial mirror.* The courses catalogue as a direct sibling of the colleges page — same sky-gradient hero, same sticky filter sidebar (stream radio, category chips, exam chips, duration radio), and the same magazine card grid, with each card's gradient header coloured by course category and a stat strip showing duration, stream, and number of colleges. **Keeps the two catalogues visually consistent.**

- **`courses/Bprototype.html`** — *Stream-funnel.* A directive alternative that opens with a question ("What did you study after 10th?") and five big tab buttons in the hero; selecting a tab swaps in course tiles grouped by entrance-exam path (e.g. "Need JEE / KEAM", "Need NEET-UG", "Direct / CUET"), so students see only the courses they actually qualify for rather than filtering a full list. **Trades 'browse everything' for 'show me what I qualify for'.**

---

## `course-detail/` — single course page (`/courses/[id]`)

Sample course used throughout: B.Tech Computer Science & Engineering (PCM stream, 4 yrs, KEAM + JEE Main, offered at 76 Kerala colleges).

- **`course-detail/Aprototype.html`** — *Course profile.* Sky-gradient hero with category pill, display-name heading, and pill-stats strip, plus a sticky jump-link table of contents on the left and labelled card sections (Overview, Who qualifies, Entrance exams, Colleges offering it, What's next) on the right. **Direct sibling of the college-detail "Profile" direction.**

- **`course-detail/Bprototype.html`** — *Journey diagram.* The page tells a story as a horizontal 4-node flowchart (Class 12 → entrance exams → the course → careers) connected by a JS-drawn dotted SVG path, collapsing to a vertical dashed-border timeline on mobile, with a college grid and quiz CTA below. **Explainer, not database page — useful for students who don't know what a course actually is.**

---

## `quiz/` — the 6-step recommendation quiz (`/quiz`)

The user is partway through the quiz (step 3 of 6, the district question with all 14 Kerala districts) in both prototypes so we can see the progress treatment + the answer pattern at work. Both omit the site footer (focused-task page).

- **`quiz/Aprototype.html`** — *Postcard Journey.* A sky-gradient strip at the top carries a floating paper-plane mascot (positioned at ~45% across for step 3), a dotted flight trail, and step dots; below it a wide white quiz card on a paper background asks the district question with 14 selectable chip-cards and a coral progress bar. **Atmospheric, progress as movement across the sky.**

- **`quiz/Bprototype.html`** — *Notepad / Journal.* A ruled-paper background frames a slightly tilted notebook page with Caveat handwriting for the question and hand-drawn doodle checkmarks on each district chip; a stack of two earlier answered pages peeks in from the left showing "Stream: PCM ✓" and "Marks: 85–95% ✓", and navigation uses cursive italic "← previous page / next page →" links. **Tactile, slow, considered — opposite of the postcard's atmospheric energy.**

---

## `signin/` — sign-in (`/signin`)

Magic-link only (no password, no OTP). Clicking "Send sign-in link / Send the link" transitions the form to a "Check your inbox" confirmation state with the email address shown and a Resend affordance. Focused-task page — no footer.

- **`signin/Aprototype.html`** — *Boarding pass.* 50/50 split layout: sky-gradient illustration panel on the left (large paper plane at −8°, dotted motion trail, three cloud puffs, handwritten Caveat tagline "you're almost in", muted sky note about the 10-minute free window) and a clean paper-background form panel on the right (Google button + OR-with-email divider + email input + sky-blue Send button, max-width 420 px). On mobile the panels stack vertically, illustration on top at 280 px. **Journey framing — you're getting a boarding pass, not filling in a form.**

- **`signin/Bprototype.html`** — *Hatch.* Single floating card centred on a very subtle sky-pale → white watercolour-wash background with faint corner cloud puffs. Card is white, rounded, with a soft "sticker peeling off the sky" shadow. Inside: brand mark + "Sign in" headline, a Caveat handwritten one-liner ("drop your email below ↓"), Google button, OR divider, email input, and a coral "Send the link →" primary button (warm accent, distinct from A's sky blue). The plane icon inside the Send button nudges 6 px right on hover via CSS transform. Footer row holds the legal note and "← back home" side by side. **Intimate and low-pressure — the opposite of a fortified login gate.**

---

## `account/` — signed-in dashboard (`/account`)

Sample user used throughout: Neha, neha.noushad@gmail.com, signed in via Google (initial "N" avatar placeholder), one quiz result from 3 days ago whose top picks were B.Tech CSE + Sacred Heart Thevara.

- **`account/Aprototype.html`** — *Profile + journey.* A sky-gradient hero strip (~200px) carries a 96px avatar breaking into the body, with a Caveat handwritten greeting ("Hi, Neha 👋") and two ghost action buttons; below it, four clearly-labelled sections stack top-to-bottom as a student journey — quiz results, coming-soon shortlist, editable profile, and account controls with a confirm-modal for account deletion. **Reads top-to-bottom as a personal timeline.**

- **`account/Bprototype.html`** — *Cockpit dashboard.* A compact 80px identity strip (paper background, no gradient) keeps avatar + name above a 2-column × 2-row panel grid; each panel has a unique coloured left-border accent (coral for quiz, sky for profile, grey for locked shortlist, neutral for account settings), the shortlist panel shows blurred placeholder cards behind a lock overlay, and the grid collapses to a single column below 980px. **Power-user feel, four equal-weight panels at a glance.**
