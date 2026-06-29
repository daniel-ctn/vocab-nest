import { cn } from '@/lib/cn'

/**
 * The Colophon — Vocab Nest's pressmark.
 *
 * A solid pen-nib (the act of keeping a word) lays a single seed — the word
 * itself — into a woven nest, struck inside a folio plate rule, the way the app
 * already frames its apparatus (Plate No. I · fig. 1 · Est. MMXXVI). Ink is
 * `currentColor`; the seed is `--color-accent`, so it themes with the app and
 * carries the same meaning the accent carries everywhere — due / now / alive.
 *
 * Pure geometry, no font dependency. `LogoMark` is static; `LogoMarkAnimated`
 * adds a one-shot "struck onto the page" reveal that honours reduced motion and
 * degrades to the finished static mark.
 */

// The nib: a filled leaf-nib with a keyhole counter (breather hole + slit).
const NIB =
  'M32 13.5C28 17.5 25.2 22.5 25.2 27.5 25.2 32.5 28 36.5 32 40 36 36.5 38.8 32.5 38.8 27.5 38.8 22.5 36 17.5 32 13.5ZM32 21.4A1.6 1.6 0 1 0 32.01 21.4ZM31.3 23.5 32.7 23.5 32.4 37.5 31.6 37.5Z'

function MarkBody() {
  return (
    <>
      <circle
        className="vn-mark-ring"
        cx="32"
        cy="32"
        r="27.5"
        stroke="currentColor"
        strokeWidth="1.3"
        pathLength="100"
      />
      <circle
        className="vn-mark-ring vn-mark-ring--inner"
        cx="32"
        cy="32"
        r="23.8"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.32"
        pathLength="100"
      />
      <path
        className="vn-mark-nib"
        d={NIB}
        fill="currentColor"
        fillRule="evenodd"
      />
      <g
        className="vn-mark-nest"
        stroke="currentColor"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M19.5 41.5Q32 53 44.5 41.5" strokeWidth="1.7" />
        <path d="M23 40.5Q32 48.5 41 40.5" strokeWidth="1.3" />
        <path d="M19.5 41.5Q18.4 38.5 19.1 36.5" strokeWidth="1.5" />
        <path d="M44.5 41.5Q45.6 38.5 44.9 36.5" strokeWidth="1.5" />
      </g>
      <circle
        className="vn-mark-seed"
        cx="32"
        cy="43.4"
        r="3.3"
        fill="var(--color-accent)"
      />
    </>
  )
}

type MarkProps = {
  size?: number
  className?: string
  title?: string
  /** Hide from assistive tech — for use inside an already-labelled link. */
  decorative?: boolean
}

function a11y(title: string, decorative?: boolean) {
  return decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': title } as const)
}

export function LogoMark({
  size = 28,
  className,
  title = 'Vocab Nest',
  decorative,
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      {...a11y(title, decorative)}
      className={cn('shrink-0 text-ink', className)}
      fill="none"
    >
      <MarkBody />
    </svg>
  )
}

// One-shot reveal: the plate rules itself on, the nib + nest settle in, and the
// seed drops last with a soft letterpress press. Self-contained CSS; the rest
// state is the finished mark, so it is fully visible with motion disabled.
const REVEAL_CSS = `
.vn-anim .vn-mark-ring{stroke-dasharray:100;stroke-dashoffset:0;animation:vn-mark-draw 720ms cubic-bezier(0.32,0.72,0,1) both}
.vn-anim .vn-mark-ring--inner{animation-delay:120ms}
.vn-anim .vn-mark-nib{transform-box:fill-box;transform-origin:center;animation:vn-mark-rise 460ms cubic-bezier(0.32,0.72,0,1) 360ms both}
.vn-anim .vn-mark-nest{transform-box:fill-box;transform-origin:center;animation:vn-mark-rise 460ms cubic-bezier(0.32,0.72,0,1) 500ms both}
.vn-anim .vn-mark-seed{transform-box:fill-box;transform-origin:center;animation:vn-mark-seed 560ms cubic-bezier(0.32,0.72,0,1) 700ms both}
@keyframes vn-mark-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
@keyframes vn-mark-rise{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes vn-mark-seed{0%{opacity:0;transform:translateY(-6px) scale(0.6)}70%{opacity:1;transform:translateY(0) scale(1)}84%{transform:translateY(0) scaleY(0.86)}100%{transform:translateY(0) scaleY(1)}}
@media (prefers-reduced-motion:reduce){.vn-anim .vn-mark-ring,.vn-anim .vn-mark-nib,.vn-anim .vn-mark-nest,.vn-anim .vn-mark-seed{animation:none}}
`

export function LogoMarkAnimated({
  size = 28,
  className,
  title = 'Vocab Nest',
  decorative,
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      {...a11y(title, decorative)}
      className={cn('vn-anim shrink-0 text-ink', className)}
      fill="none"
    >
      <style>{REVEAL_CSS}</style>
      <MarkBody />
    </svg>
  )
}
