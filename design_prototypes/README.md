# Design prototypes

Static design exploration — **not production code, not wired to the real app**. These are throwaway HTML/CSS/JS sketches to test direction before committing to a look-and-feel in the real React Native build.

## How to view

Open the HTML files directly in your browser:

```
open design_prototypes/1prototype.html
```

No build step. No server. Self-contained.

## Prototypes

- **`1prototype.html`** — *sky as a day-arc.* Sunrise gradient hero with floating clouds, scroll-driven section reveals, animated stat counters, gradient course tiles, twilight closing CTA. Bold Space Grotesk display type with Inter body. **Warm, cinematic, gradient-heavy. Apple-ish.**

- **`2prototype.html`** — *sky as an aerial chart.* Parchment paper, navy chart ink, coral pin colour. Editorial italic-serif headlines (Fraunces) + mono coordinate labels (JetBrains Mono). Asymmetric grid, rotating compass roses, dotted route lines that draw themselves on scroll, "you are here" coordinates that echo your cursor, course tiles laid out as pins on a chart. **Editorial, disciplined, type-driven. Leans into the *compass* half of the brand.**

- **`3prototype.html`** — *sky as coastal dusk.* Sunset over the Arabian Sea palette (deep indigo → magenta → coral → reflected water). Instrument Serif italic display type. Hero with a setting sun, floating bokeh, shimmering horizon line. Cinematic full-bleed panels (alternating left/right) each with a CSS-mockup of the relevant feature — quiz, catalogue, compare. Closes on a moonlit night sky with a faint coral horizon hinting at tomorrow. **Quieter, more romantic, more Kerala-rooted than #1. Same gradient-cinematic family but a different time of day and a different page rhythm.**

- **`4prototype.html`** — *sky as a bright clear-blue day.* Cyan to azure gradient, big puffy clouds, small yellow sun, and a paper plane as the recurring motif (brand mark, hero mascot, and it "arrives" at the closing CTA). Sora display type (round, friendly, modern) with one handwritten Caveat accent for personality. Cloud-shaped feature cards on a pale-sky background. How-it-works steps connected by a dotted flight path that draws itself on scroll. **Playful, optimistic, mid-day energy — distinct from the cinematic #1 and the romantic #3 by personality, even though it shares the gradient-sky DNA.** **Chosen — now live on the home page.**

---

Prototypes 5 + 6 are the next round, this time for the **`/colleges` catalogue page** (not the home page). They reuse the prototype-4 sky palette + typography but propose different *layout* rethinks. The current /colleges is a linear top-to-bottom utility (title → search → 4 dropdowns → result list).

- **`5prototype.html`** — *Atlas. Spatial / map-led.* Kerala's 14 districts as a vertical N → S strip on the left, each with a click target and a result count — the abstracted "map" that the sky-deep-to-coral arc echoes. Course / Type / Fees as chip groups underneath. Right side is a 2-column tile grid; each tile has a thin district-coloured ribbon at the top, the college name in Sora display, and pill rows for type + fees. The page is structured around *where*, with *what / which* as secondary filters. **Browsing geography-first.**

- **`6prototype.html`** — *Editorial. Magazine spread.* Short sky-gradient hero strip up top with a paper-plane brand mark, a paper-textured eyebrow chip, and a big "Browse 394 colleges" headline with a coral number — looks like the cover of a publication. Sticky filter panel on the left (continuous search + radio rows + multi-select district chips, one panel instead of four dropdowns). Magazine-style 2-column card grid on the right; each card has its own coloured gradient header (district + type) with a cloud puff, big name in Sora, a one-line tagline, and a tri-column stat strip (courses / seats / fee band). **Browsing as reading.**
