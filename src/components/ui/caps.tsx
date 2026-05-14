import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Caps({
  children,
  className,
  as: As = 'span',
}: {
  children: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p'
}) {
  return (
    <As
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-secondary',
        className
      )}
    >
      {children}
    </As>
  )
}
