import { cn } from '@/lib/cn'

export function Rule({
  className,
  animate = false,
  fade = false,
  ornament = false,
}: {
  className?: string
  animate?: boolean
  fade?: boolean
  /** Centered printer's mark with hairlines either side — a section break. */
  ornament?: boolean
}) {
  if (ornament) {
    return (
      <div
        className={cn('flex items-center gap-4 text-ink-tertiary', className)}
        aria-hidden
      >
        <span className="h-px flex-1 rule-fade" />
        <span className="font-display text-[13px] leading-none">❧</span>
        <span className="h-px flex-1 rule-fade" />
      </div>
    )
  }

  return (
    <hr
      className={cn(
        'h-px border-0',
        fade ? 'rule-fade' : 'bg-rule',
        animate && 'animate-rule-draw',
        className
      )}
    />
  )
}
