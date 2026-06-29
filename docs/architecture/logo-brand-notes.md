# Logo & brand notes — The Colophon

Status: **current** · Est. MMXXVI

The mark for Vocab Nest. A press-mark (colophon) that belongs to "The Lexicon"
identity defined in `src/app/globals.css`, not a generic SaaS app icon.

## The mark

> A solid **pen-nib** lays a single **seed** — one word — into a **woven nest**,
> struck inside a **folio plate rule**.

Three product verbs in one glyph:

- **Nib** → keeping a word (you write specimens onto the page). The fused
  breather-hole + slit reads unmistakably as a pen.
- **Seed** → the word itself, in **terracotta** — the app's "due / now / alive"
  colour. The logo is the one place the brand colour lives as brand, but it
  still carries the same meaning it carries everywhere in the product.
- **Nest** → the commonplace book as a vessel that *holds* what you collect
  (Vocab **Nest**).
- **Folio roundel** → the same plate rule the app already draws around its
  apparatus (Plate No. I · fig. 1 · Est. MMXXVI). It reframes the mark as a
  printer's colophon on a title page, which is exactly how the product speaks.

Ink on cream; **one** spot of terracotta. No gradients, no stock iconography.

### Why it fits

Vocab Nest is a deliberately bookish, anti-feed vocabulary keeper — "collect
words like a naturalist keeps specimens." A colophon is the most on-voice object
it could carry. It also *fixes* a defect in the old mark: a flat `#d4613c`
rounded square broke the house rule that terracotta is strictly stateful. The
colophon is ink-first and spends terracotta on exactly one meaningful seed.

### Alternatives explored

Four directions were developed and run through an adversarial 3-lens critique
(brand-fit · favicon/technical · premium-distinctiveness):

| Direction | Verdict |
| --- | --- |
| **Ex-Libris monogram** (serif "N" in a ring) | Strong concept, but reduces to "a serif N in a circle" — one keystroke from a university crest. Encodes no nest/specimen meaning. |
| **Cradled seed** (bare woven nest + seed) | Reads as a rainbow/sun at a glance; the nest cue lives in sub-pixel serif flicks. Weakest on the swap-the-logo test. |
| **Recall orbit** (concentric recall ring + seed) | Best terracotta insight (seed = the due word), but three concentric strokes lose the gestalt war to "bullseye / spinner." |
| **Printer's colophon** ✅ | Highest brand-fit and the only direction above the pack on distinctiveness. Its one weakness (16px density) was the most fixable — a dedicated simplified favicon core. |

The colophon won; the best ideas from the others were grafted in: the
"seed = due word" semantics (Recall orbit), folio-rule discipline (Ex-Libris),
and a settle-and-press seed gesture (Cradled seed).

## Animation

A one-shot **"the device is struck onto the page"** reveal, never a loop:

1. the folio plate **rules itself on** (`stroke-dashoffset` draw, ~720ms),
2. the nib and nest **settle in** (opacity + slight scale),
3. the seed **drops and presses** last (translate into a soft `scaleY` dip) —
   a word dropped into the book and pressed flat.

It is meaningful (it stages keeping a word), lightweight (pure CSS, no JS / no
canvas / no Lottie / no gradients / no filters), under ~1.2s, and single-pass so
it can never read as a spinner. The rest state of the SVG **is** the finished
mark, so with motion disabled (or if CSS never runs) the complete colophon is
shown. `prefers-reduced-motion: reduce` zeroes every animation.

## Files

| File | What | Static / Animated |
| --- | --- | --- |
| `src/components/ui/logo.tsx` | `LogoMark`, `LogoMarkAnimated` (in-app source of truth) | both |
| `src/app/icon.svg` | Browser SVG favicon — bare core emblem, self-theming | static |
| `src/app/favicon.ico` | Legacy favicon, 16/32/48 on cream | static |
| `src/app/apple-icon.png` | Apple touch icon, 180 | static |
| `src/app/opengraph-image.png` | OG / social card, 1200×630 | static |
| `src/app/manifest.ts` | PWA manifest → `public/icon-192.png`, `public/icon-512.png` | static |
| `public/icon-192.png`, `public/icon-512.png` | PWA / Android icons | static |
| `public/brand/logo-mark.svg` | Full colophon symbol, self-theming | static |
| `public/brand/logo-mark-animated.svg` | Full colophon, reveal animation | animated |
| `public/brand/logo-mark-mono.svg` | Single-colour symbol (no terracotta) | static |
| `public/brand/logo.svg` / `logo-dark.svg` | Horizontal lockup (outlined wordmark) | static |
| `public/brand/logo-animated.svg` | Horizontal lockup with reveal | animated |
| `public/brand/favicon-16x16.png`, `favicon-32x32.png` | Standalone favicon PNGs | static |

The in-app wordmark stays **VOCAB NEST** in DM Mono caps (the apparatus voice);
the mark replaces the old lucide `Feather` in the landing/auth/sidebar wordmarks
and the `Loading` mark. Preview everything at **`/brand`**.

### Regenerating raster / outlined assets

```
pnpm icons   # favicon.ico + apple/PWA/favicon PNGs from the mark geometry
pnpm brand   # logo lockup (outlined wordmark) + opengraph-image.png
```

`scripts/generate-icons.mjs` uses `sharp` + `png-to-ico`. `scripts/generate-brand.mjs`
uses `sharp` + `opentype.js` and fetches Fraunces + DM Mono from Google Fonts at
run time **only** — the shipped SVG/PNG outputs carry no font dependency. If you
change the mark geometry in `src/components/ui/logo.tsx`, update the path data in
both scripts (and the standalone SVGs) and re-run both.

## Usage

**Animate** (one-shot reveal, high-visibility): header / sidebar wordmark,
landing hero, auth screens, the `/brand` sheet.

**Keep static**: favicon, browser tab, app icons, Open Graph, loading marks, and
any dense or repeated placement.

The favicon is **never** animated.

## Colour & background

- Ink (`currentColor`) on cream is the default; the seed is `--color-accent`
  (terracotta `#c2502a`, dark `#e27d5e`) and themes automatically.
- Standalone SVGs self-theme via `prefers-color-scheme`. Raster icons are struck
  on cream paper so they read on any browser chrome / home screen.
- For a single-colour context (deboss, stamp, one-colour print) use
  `logo-mark-mono.svg`, or set the React mark's text colour and drop the seed
  hue.

## Performance & accessibility

- The animated mark is a handful of CSS keyframes on existing elements — no
  layout shift (geometry is fixed; transforms use `transform-box: fill-box`),
  no JS, no extra network.
- Decorative marks inside labelled links pass `decorative` (→ `aria-hidden`);
  standalone marks expose `role="img"` + a label.
- `prefers-reduced-motion` is honoured by the component, the standalone animated
  SVGs, and the global reduce block in `globals.css`.

## Future ideas

- A marketing-only hero variant where a single seed makes one slow orbit of the
  plate and comes to rest (the spaced-repetition "return"), reserved for the
  landing hero — never shipped in-app.
- A letterpress-deboss treatment of `logo-mark-mono.svg` for print / merch.
