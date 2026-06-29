// Generates Vocab Nest's brand exports — the horizontal logo lockup and the
// Open Graph image — with the wordmark OUTLINED to paths (zero font dependency
// in the shipped assets).
//   pnpm brand
// Fetches Fraunces + DM Mono from Google Fonts at run time only (the outputs are
// committed; consumers never need the fonts). Static — the lockup ships a quiet
// reveal but the OG image is a flat frame.
import sharp from 'sharp'
import opentype from 'opentype.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const INK = '#211a10'
const INK3 = '#9a8f79'
const SEED = '#c2502a'
const CREAM = '#f7f2e7'

async function loadFont(query) {
  // Different UAs coax Google into serving a plain .ttf for different families.
  for (const ua of ['Mozilla/4.0 (compatible; MSIE 6.0)', 'curl/8.0']) {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${query}`, {
      headers: { 'User-Agent': ua },
    }).then((r) => r.text())
    const url = css.match(/url\((https:\/\/[^)]+\.ttf)\)/)?.[1]
    if (url) {
      const buf = await fetch(url).then((r) => r.arrayBuffer())
      return opentype.parse(buf)
    }
  }
  throw new Error('No .ttf for ' + query)
}

// Outline `text` to a single path string with optional letter tracking (em).
function outline(font, text, fontSize, trackEm = 0) {
  const scale = fontSize / font.unitsPerEm
  const track = trackEm * fontSize
  const full = new opentype.Path()
  let x = 0
  for (const ch of text) {
    const g = font.charToGlyph(ch)
    full.extend(g.getPath(x, 0, fontSize))
    x += g.advanceWidth * scale + track
  }
  const bb = full.getBoundingBox()
  return { d: full.toPathData(2), width: x - track, bbox: bb }
}

// The colophon mark as a transformable group (origin 0,0, given scale).
function markGroup(tx, ty, scale, ink = INK, seed = SEED) {
  return `<g transform="translate(${tx} ${ty}) scale(${scale})">
    <circle cx="32" cy="32" r="27.5" fill="none" stroke="${ink}" stroke-width="1.3"/>
    <circle cx="32" cy="32" r="23.8" fill="none" stroke="${ink}" stroke-width="0.8" opacity="0.32"/>
    <path fill="${ink}" fill-rule="evenodd" d="M32 13.5C28 17.5 25.2 22.5 25.2 27.5 25.2 32.5 28 36.5 32 40 36 36.5 38.8 32.5 38.8 27.5 38.8 22.5 36 17.5 32 13.5ZM32 21.4A1.6 1.6 0 1 0 32.01 21.4ZM31.3 23.5 32.7 23.5 32.4 37.5 31.6 37.5Z"/>
    <g fill="none" stroke="${ink}" stroke-linecap="round">
      <path d="M19.5 41.5Q32 53 44.5 41.5" stroke-width="1.7"/>
      <path d="M23 40.5Q32 48.5 41 40.5" stroke-width="1.3"/>
      <path d="M19.5 41.5Q18.4 38.5 19.1 36.5" stroke-width="1.5"/>
      <path d="M44.5 41.5Q45.6 38.5 44.9 36.5" stroke-width="1.5"/>
    </g>
    <circle cx="32" cy="43.4" r="3.3" fill="${seed}"/>
  </g>`
}

const mono = await loadFont('DM+Mono:wght@500')
const serif = await loadFont('Fraunces:ital,opsz,wght@1,144,400')

mkdirSync(join(ROOT, 'public', 'brand'), { recursive: true })

/* ── Horizontal logo lockup ─────────────────────────────────────────────── */
{
  const markSize = 56
  const gap = 22
  const fs = 30
  const wm = outline(mono, 'VOCAB NEST', fs, 0.2)
  const midY = 34
  // baseline so the caps are vertically centred on midY
  const baseline = midY - (wm.bbox.y1 + wm.bbox.y2) / 2
  const wmX = markSize + gap
  const W = Math.ceil(wmX + wm.width + 2)
  const H = 68
  const markTy = (H - markSize) / 2
  const markScale = markSize / 64

  const lockup = (ink, seed, withStyle) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
${withStyle}${markGroup(0, markTy, markScale, ink, seed)}
  <path transform="translate(${wmX} ${baseline})" d="${wm.d}" fill="${ink}"/>
</svg>`

  const SELF_THEME = `  <style> .ink{fill:#211a10;stroke:#211a10} .seed{fill:#c2502a}
    @media (prefers-color-scheme:dark){ .ink{fill:#efe6d2;stroke:#efe6d2} .seed{fill:#e27d5e} } </style>\n`
  // self-theming version uses currentColor-style classes
  const themed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
${SELF_THEME}  <g class="_ink">${markGroup(0, markTy, markScale, 'currentColor', 'var(--seed,#c2502a)')}</g>
  <path transform="translate(${wmX} ${baseline})" d="${wm.d}" fill="currentColor"/>
</svg>`

  // Ship two flat, explicit-colour variants (robust everywhere) + note.
  writeFileSync(join(ROOT, 'public/brand/logo.svg'), lockup(INK, SEED, ''))
  writeFileSync(
    join(ROOT, 'public/brand/logo-dark.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
${markGroup(0, markTy, markScale, '#efe6d2', '#e27d5e')}
  <path transform="translate(${wmX} ${baseline})" d="${wm.d}" fill="#efe6d2"/>
</svg>`
  )

  // Animated lockup: mark reveal + wordmark fades in after.
  const anim = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
  <style>
    .ring{stroke-dasharray:100;stroke-dashoffset:0;animation:d 720ms cubic-bezier(.32,.72,0,1) both}
    .ring.i{animation-delay:120ms}
    .nib{transform-box:fill-box;transform-origin:center;animation:r 460ms cubic-bezier(.32,.72,0,1) 360ms both}
    .nst{transform-box:fill-box;transform-origin:center;animation:r 460ms cubic-bezier(.32,.72,0,1) 500ms both}
    .sd{transform-box:fill-box;transform-origin:center;animation:s 560ms cubic-bezier(.32,.72,0,1) 700ms both}
    .wm{animation:f 600ms cubic-bezier(.32,.72,0,1) 760ms both}
    @keyframes d{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
    @keyframes r{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
    @keyframes s{0%{opacity:0;transform:translateY(-6px) scale(.6)}70%{opacity:1;transform:translateY(0) scale(1)}84%{transform:translateY(0) scaleY(.86)}100%{transform:translateY(0) scaleY(1)}}
    @keyframes f{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
    @media (prefers-reduced-motion:reduce){.ring,.nib,.nst,.sd,.wm{animation:none}}
  </style>
  <g transform="translate(0 ${markTy}) scale(${markScale})">
    <circle class="ring" cx="32" cy="32" r="27.5" fill="none" stroke="${INK}" stroke-width="1.3" pathLength="100"/>
    <circle class="ring i" cx="32" cy="32" r="23.8" fill="none" stroke="${INK}" stroke-width="0.8" opacity="0.32" pathLength="100"/>
    <path class="nib" fill="${INK}" fill-rule="evenodd" d="M32 13.5C28 17.5 25.2 22.5 25.2 27.5 25.2 32.5 28 36.5 32 40 36 36.5 38.8 32.5 38.8 27.5 38.8 22.5 36 17.5 32 13.5ZM32 21.4A1.6 1.6 0 1 0 32.01 21.4ZM31.3 23.5 32.7 23.5 32.4 37.5 31.6 37.5Z"/>
    <g class="nst" fill="none" stroke="${INK}" stroke-linecap="round">
      <path d="M19.5 41.5Q32 53 44.5 41.5" stroke-width="1.7"/>
      <path d="M23 40.5Q32 48.5 41 40.5" stroke-width="1.3"/>
      <path d="M19.5 41.5Q18.4 38.5 19.1 36.5" stroke-width="1.5"/>
      <path d="M44.5 41.5Q45.6 38.5 44.9 36.5" stroke-width="1.5"/>
    </g>
    <circle class="sd" cx="32" cy="43.4" r="3.3" fill="${SEED}"/>
  </g>
  <path class="wm" transform="translate(${wmX} ${baseline})" d="${wm.d}" fill="${INK}"/>
</svg>`
  writeFileSync(join(ROOT, 'public/brand/logo-animated.svg'), anim)
  void themed
}

/* ── Open Graph image (1200×630) ────────────────────────────────────────── */
{
  const W = 1200
  const H = 630
  const markSize = 132
  const markX = (W - markSize) / 2
  const markY = 150
  const wmFs = 40
  const wm = outline(mono, 'VOCAB NEST', wmFs, 0.34)
  const wmX = (W - wm.width) / 2
  const wmBase = 372 - (wm.bbox.y1 + wm.bbox.y2) / 2
  const tagFs = 38
  const tag = outline(serif, 'a commonplace book for words', tagFs)
  const tagX = (W - tag.width) / 2
  const tagBase = 452 - (tag.bbox.y1 + tag.bbox.y2) / 2
  const estFs = 17
  const est = outline(mono, 'EST. MMXXVI', estFs, 0.32)
  const estX = (W - est.width) / 2

  const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${INK}" stroke-width="1" opacity="0.28"/>
  ${markGroup(markX, markY, markSize / 64)}
  <path transform="translate(${wmX} ${wmBase})" d="${wm.d}" fill="${INK}"/>
  <g stroke="${SEED}" stroke-width="1.4"><path d="M${W / 2 - 30} 410 H${W / 2 + 30}"/></g>
  <path transform="translate(${tagX} ${tagBase})" d="${tag.d}" fill="#6a5f4c"/>
  <path transform="translate(${estX} ${545})" d="${est.d}" fill="${INK3}"/>
</svg>`
  await sharp(Buffer.from(og), { density: 144 }).png().toFile(join(ROOT, 'src/app/opengraph-image.png'))
}

console.log('Brand assets written:')
console.log('  public/brand/logo.svg, logo-dark.svg, logo-animated.svg')
console.log('  src/app/opengraph-image.png (1200x630)')
