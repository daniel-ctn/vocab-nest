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
        'font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-secondary',
        className
      )}
    >
      {children}
    </As>
  )
}
