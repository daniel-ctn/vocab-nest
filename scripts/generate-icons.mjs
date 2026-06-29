// Generates Vocab Nest's raster icons from the colophon mark.
//   pnpm icons
// The favicon uses the bare core emblem (legible at 16px); apple / PWA icons use
// the full colophon (folio plate rule). All are struck on the brand's cream
// paper so they read on any browser chrome or home screen. Static — never
// animated. Run after editing the mark geometry in src/components/ui/logo.tsx.
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const INK = '#211a10'
const SEED = '#c2502a'
const CREAM = { r: 0xf7, g: 0xf2, b: 0xe7, alpha: 1 }

// Bare core emblem (nib + nest + seed), tuned to survive 16px.
const CORE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path fill="${INK}" fill-rule="evenodd" d="M16 4C12.7 5.9 11.1 9.4 11.1 13 11.1 16.2 13 19.1 16 21 19 19.1 20.9 16.2 20.9 13 20.9 9.4 19.3 5.9 16 4ZM16 8.1A1.45 1.45 0 1 0 16.01 8.1ZM15.4 10.1 16.6 10.1 16.38 19.6 15.62 19.6Z"/>
  <path stroke="${INK}" stroke-width="2.3" stroke-linecap="round" d="M8.3 23.5Q16 30.8 23.7 23.5"/>
  <circle cx="16" cy="24" r="3" fill="${SEED}"/>
</svg>`

// Full colophon (folio plate rule + emblem) for larger icons.
const SEAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="27.5" stroke="${INK}" stroke-width="1.3"/>
  <circle cx="32" cy="32" r="23.8" stroke="${INK}" stroke-width="0.8" opacity="0.32"/>
  <path fill="${INK}" fill-rule="evenodd" d="M32 13.5C28 17.5 25.2 22.5 25.2 27.5 25.2 32.5 28 36.5 32 40 36 36.5 38.8 32.5 38.8 27.5 38.8 22.5 36 17.5 32 13.5ZM32 21.4A1.6 1.6 0 1 0 32.01 21.4ZM31.3 23.5 32.7 23.5 32.4 37.5 31.6 37.5Z"/>
  <g stroke="${INK}" stroke-linecap="round">
    <path d="M19.5 41.5Q32 53 44.5 41.5" stroke-width="1.7"/>
    <path d="M23 40.5Q32 48.5 41 40.5" stroke-width="1.3"/>
    <path d="M19.5 41.5Q18.4 38.5 19.1 36.5" stroke-width="1.5"/>
    <path d="M44.5 41.5Q45.6 38.5 44.9 36.5" stroke-width="1.5"/>
  </g>
  <circle cx="32" cy="43.4" r="3.3" fill="${SEED}"/>
</svg>`

// Render a mark onto a cream square of `size`px, with `inset` fraction of padding.
async function tile(svg, size, inset) {
  const markPx = Math.round(size * (1 - inset * 2))
  const mark = await sharp(Buffer.from(svg), { density: 512 })
    .resize(markPx, markPx, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  const off = Math.round((size - markPx) / 2)
  return sharp({ create: { width: size, height: size, channels: 4, background: CREAM } })
    .composite([{ input: mark, top: off, left: off }])
    .png()
    .toBuffer()
}

mkdirSync(join(ROOT, 'public', 'brand'), { recursive: true })

const out = {
  // favicon.ico — bare core, multi-resolution
  ico16: await tile(CORE, 16, 0.06),
  ico32: await tile(CORE, 32, 0.08),
  ico48: await tile(CORE, 48, 0.1),
  // standalone favicon PNGs
  fav16: ['public/brand/favicon-16x16.png', await tile(CORE, 16, 0.06)],
  fav32: ['public/brand/favicon-32x32.png', await tile(CORE, 32, 0.08)],
  // apple touch icon — full colophon
  apple: ['src/app/apple-icon.png', await tile(SEAL, 180, 0.16)],
  // PWA / Android
  i192: ['public/icon-192.png', await tile(SEAL, 192, 0.16)],
  i512: ['public/icon-512.png', await tile(SEAL, 512, 0.16)],
}

for (const v of Object.values(out)) {
  if (Array.isArray(v)) writeFileSync(join(ROOT, v[0]), v[1])
}
writeFileSync(join(ROOT, 'src/app/favicon.ico'), await pngToIco([out.ico16, out.ico32, out.ico48]))

console.log('Icons written:')
console.log('  src/app/favicon.ico        (16/32/48)')
console.log('  src/app/apple-icon.png     (180)')
console.log('  public/icon-192.png, public/icon-512.png')
console.log('  public/brand/favicon-16x16.png, favicon-32x32.png')
