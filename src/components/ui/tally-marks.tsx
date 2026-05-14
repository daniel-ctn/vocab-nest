import { cn } from '@/lib/cn'

/**
 * Tally marks rendered as actual ink strokes, grouped in fives with a diagonal
 * slash. The strokes draw on with a stroke-dashoffset animation on mount.
 */
export function TallyMarks({
  count,
  max = 35,
  className,
}: {
  count: number
  max?: number
  className?: string
}) {
  if (count <= 0) {
    return (
      <span className={cn('text-[13px] font-display italic text-ink-tertiary', className)}>
        —
      </span>
    )
  }

  const display = Math.min(count, max)
  const groups: number[] = []
  let remaining = display
  while (remaining > 0) {
    const g = Math.min(5, remaining)
    groups.push(g)
    remaining -= g
  }

  let delay = 0
  return (
    <div className={cn('inline-flex items-center gap-2 text-ink', className)}>
      {groups.map((n, gi) => {
        const startDelay = delay
        delay += n * 60
        return <TallyGroup key={gi} n={n} startDelay={startDelay} />
      })}
      {count > max && (
        <span className="ml-1 text-[12px] font-display italic text-ink-tertiary">
          + {count - max}
        </span>
      )}
    </div>
  )
}

function TallyGroup({ n, startDelay }: { n: number; startDelay: number }) {
  const verticalCount = Math.min(n, 4)
  const w = 22
  const h = 18
  const strokeW = 1.5

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="overflow-visible"
      aria-hidden
    >
      {Array.from({ length: verticalCount }).map((_, i) => (
        <line
          key={i}
          x1={i * 4.5 + 2}
          y1={2}
          x2={i * 4.5 + 2}
          y2={h - 2}
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          className="vn-tally-stroke"
          style={{ animationDelay: `${startDelay + i * 60}ms` }}
        />
      ))}
      {n === 5 && (
        <line
          x1={0}
          y1={h - 1.5}
          x2={w - 4}
          y2={1.5}
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeLinecap="round"
          className="vn-tally-stroke"
          style={{ animationDelay: `${startDelay + 4 * 60}ms` }}
        />
      )}
    </svg>
  )
}
