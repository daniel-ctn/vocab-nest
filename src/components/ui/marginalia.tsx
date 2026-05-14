import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Marginalia — small italic notes set in the gutter (right-side on desktop,
 * inline on mobile). Use for dates, parts-of-speech, status remarks.
 */
export function Marginalia({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <aside
      className={cn(
        'text-[13px] font-display italic leading-snug text-ink-tertiary',
        className
      )}
    >
      {children}
    </aside>
  )
}
